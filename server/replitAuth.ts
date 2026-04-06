import passport from "passport";
// @ts-ignore - Ignoring missing type declaration for Google Strategy
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import crypto from "crypto";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required");
}
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

interface SessionUser {
  id: string;
  email?: string;
  displayName?: string;
}

declare global {
  namespace Express {
    interface User extends SessionUser {}
  }
}

type PublicUser = Omit<User, "passwordHash" | "passwordResetToken" | "passwordResetExpires">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ph, passwordResetToken: _prt, passwordResetExpires: _pre, ...safe } = user;
  return safe;
}

const ADMIN_EMAILS = ["info@arcside.co.za", "arcside.group@gmail.com"];

const normalizeEmail = (email?: string | null) => email ? email.toLowerCase().trim() : "";

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000;
  const PgStore = connectPgSimple(session);
  const sessionStore = new PgStore({ pool, tableName: "sessions", ttl: sessionTtl / 1000, createTableIfMissing: false });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: true, sameSite: "strict", maxAge: sessionTtl },
  });
}

async function upsertGoogleUser(profile: any): Promise<void> {
  const googleId = profile.id;
  const email = normalizeEmail(profile.emails?.[0]?.value);
  const firstName = profile.name?.givenName ?? profile.displayName ?? "User";
  const lastName = profile.name?.familyName ?? "";
  const profileImageUrl = profile.photos?.[0]?.value ?? "";

  if (email) {
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      await storage.updateUserProfile(existing.id, {
        googleId,
        authProvider: "google",
        profileImageUrl: profileImageUrl || existing.profileImageUrl,
        isApprovedBetaTester: await storage.isEmailInWhitelist(email),
      });
      return;
    }
  }

  await storage.upsertUser({
    id: googleId,
    email,
    firstName,
    lastName,
    profileImageUrl,
    authProvider: "google",
    isApprovedBetaTester: await storage.isEmailInWhitelist(email),
  });
}

export function setupAuth(app: Express) {
  const callbackURL = `https://${process.env.REPLIT_DOMAINS!.split(",")[0]}/api/callback`;

  passport.use(new GoogleStrategy({ 
    clientID: process.env.GOOGLE_CLIENT_ID!, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
    callbackURL 
  }, async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
    try {
      await upsertGoogleUser(profile);
      const normalizedEmail = normalizeEmail(profile.emails?.[0]?.value);
      const dbUser = normalizedEmail ? await storage.getUserByEmail(normalizedEmail) : null;
      const user: SessionUser = { 
        id: dbUser?.id ?? profile.id, 
        email: normalizedEmail || undefined, 
        displayName: profile.displayName 
      };
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));

  passport.use(new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(normalizeEmail(email));
      if (!user) return done(null, false, { message: "No account found with that email." });
      if (!user.passwordHash) return done(null, false, { message: "This account hasn't set a password yet. Please log in with Google first." });

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) return done(null, false, { message: "Incorrect password." });

      return done(null, { id: user.id, email: user.email ?? undefined, displayName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() });
    } catch (error) {
      return done(error as Error);
    }
  }));

  passport.serializeUser((user, done) => done(null, (user as SessionUser).id));

  passport.deserializeUser(async (id: string, done) => { 
    try { 
      const user = await storage.getUser(id);
      // @ts-ignore - Fixing the null vs undefined compatibility error on Line 132
      done(null, user); 
    } catch { 
      done(null, null); 
    } 
  });

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/callback", passport.authenticate("google", { failureRedirect: "/" }), async (req: Request, res: Response) => {
    const email = normalizeEmail(req.user?.email);
    const allowed = email ? await storage.isEmailInWhitelist(email) : false;

    if (!allowed) {
      return req.logout((err: Error | null) => {
        if (err) console.error(err);
        res.redirect("/private-beta");
      });
    }
    req.session.save(() => res.redirect("/"));
  });

  app.post("/api/register", async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body as { email?: string; password?: string; firstName?: string; lastName?: string };
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

    const normalizedEmail = normalizeEmail(email);
    if (!(await storage.isEmailInWhitelist(normalizedEmail))) {
      return res.status(403).json({ message: "Access restricted. Your email is not on the beta invite list." });
    }

    const existingUser = await storage.getUserByEmail(normalizedEmail);
    const passwordHash = await bcrypt.hash(password, 12);

    if (existingUser) {
      if (!existingUser.passwordHash) {
        await storage.updateUserProfile(existingUser.id, { passwordHash });
        return res.json({ success: true, message: "Password added to your account." });
      }
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const userId = `local_${crypto.randomUUID()}`;
    await storage.upsertUser({ 
      id: userId, 
      email: normalizedEmail, 
      firstName: firstName?.trim() ?? "User", 
      lastName: lastName?.trim() ?? "", 
      passwordHash, 
      authProvider: "email", 
      isApprovedBetaTester: true 
    });

    const sessionUser: SessionUser = { id: userId, email: normalizedEmail, displayName: firstName?.trim() ?? "User" };
    req.login(sessionUser, (loginErr: Error | null) => {
      if (loginErr) return res.status(500).json({ message: "Registration succeeded but login failed." });
      res.json({ success: true, message: "Account created successfully." });
    });
  });

  app.post("/api/login/local", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: Error | null, user: SessionUser | false, info: { message: string } | undefined) => {
      if (err) return res.status(500).json({ message: "Login failed." });
      if (!user) return res.status(401).json({ message: info?.message ?? "Invalid credentials." });

      if (!(await storage.isEmailInWhitelist(normalizeEmail(user.email)))) {
        return res.status(403).json({ message: "Access restricted. Your email is not on the beta invite list." });
      }

      req.login(user, (loginErr: Error | null) => {
        if (loginErr) return res.status(500).json({ message: "Login failed." });
        res.json({ success: true });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: Error | null) => err ? next(err) : res.redirect("/"));
  });

  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    const sessionUser = req.user as SessionUser;
    const dbUser = await storage.getUser(sessionUser.id);
    if (!dbUser) return res.status(404).json({ message: "User not found" });
    res.json(toPublicUser(dbUser));
  });
}

export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated?.()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const email = normalizeEmail((req.user as SessionUser | undefined)?.email);
  if (!ADMIN_EMAILS.includes(email)) return res.status(403).json({ message: "Admin access required." });
  next();
};

export const isAdminEmail = (email?: string | null) => ADMIN_EMAILS.includes(normalizeEmail(email));