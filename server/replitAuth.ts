import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import type { User } from "@shared/schema";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
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

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000;
  const PgStore = connectPgSimple(session);
  const sessionStore = new PgStore({
    pool,
    tableName: "sessions",
    ttl: sessionTtl / 1000,
    createTableIfMissing: false,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: sessionTtl,
    },
  });
}

async function upsertGoogleUser(profile: GoogleProfile): Promise<void> {
  const googleId = profile.id;
  const email = (profile.emails?.[0]?.value ?? "").toLowerCase().trim();
  const firstName = profile.name?.givenName ?? profile.displayName ?? "User";
  const lastName = profile.name?.familyName ?? "";
  const profileImageUrl = profile.photos?.[0]?.value ?? "";

  console.log(`[AUTH] Upserting Google user: googleId=${googleId}, email=${email}`);

  if (email) {
    const existing = await storage.getUserByEmail(email);
    if (existing && existing.id !== googleId) {
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
  const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
  const callbackURL = `https://${domain}/api/callback`;

  console.log(`[AUTH] Configuring Google OAuth with callback: ${callbackURL}`);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(`[AUTH] Google strategy verify: profile.id=${profile.id}`);
          await upsertGoogleUser(profile);

          const normalizedEmail = (profile.emails?.[0]?.value ?? "").toLowerCase().trim();
          const user: SessionUser = {
            id: normalizedEmail
              ? (await storage.getUserByEmail(normalizedEmail))?.id ?? profile.id
              : profile.id,
            email: normalizedEmail || undefined,
            displayName: profile.displayName,
          };
          console.log(`[AUTH] Google strategy returning user:`, user);
          return done(null, user);
        } catch (error) {
          console.error("[AUTH] Strategy verify error:", error);
          return done(error as Error);
        }
      }
    )
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          console.log(`[AUTH] Local strategy verify: email=${email}`);
          const user = await storage.getUserByEmail(email.toLowerCase().trim());

          if (!user) {
            return done(null, false, { message: "No account found with that email." });
          }
          if (!user.passwordHash) {
            return done(null, false, { message: "This account uses Google sign-in. Please use the Google button." });
          }

          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordMatch) {
            return done(null, false, { message: "Incorrect password." });
          }

          const sessionUser: SessionUser = {
            id: user.id,
            email: user.email ?? undefined,
            displayName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          };
          console.log(`[AUTH] Local strategy returning user:`, sessionUser);
          return done(null, sessionUser);
        } catch (error) {
          console.error("[AUTH] Local strategy error:", error);
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SessionUser).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user ?? null);
    } catch (error) {
      console.error("[AUTH] Deserialization error:", error);
      done(null, null);
    }
  });

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const sess = req.session as Record<string, unknown>;
    if (!req.user && req.session && Object.keys(sess).length > 1) {
      req.session.destroy((err: Error | null) => {
        if (err) console.error("[AUTH] Session destroy error:", err);
      });
    }
    next();
  });

  app.get("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get(
    "/api/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req: Request, res: Response) => {
      const email = req.user?.email;
      const allowed = email ? await storage.isEmailInWhitelist(email) : false;

      if (!allowed) {
        console.log(`[AUTH] Email ${email} not whitelisted — logging out, redirecting to /private-beta`);
        return req.logout((err: Error | null) => {
          if (err) console.error("[AUTH] Logout error:", err);
          res.redirect("/private-beta");
        });
      }
      req.session.save((err: Error | null) => {
        if (err) {
          console.error("[AUTH] Session save error:", err);
          return res.redirect("/?error=session_save_failed");
        }
        res.redirect("/");
      });
    }
  );

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body as {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
      };

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const allowed = await storage.isEmailInWhitelist(normalizedEmail);
      if (!allowed) {
        console.log(`[AUTH] Register denied (not whitelisted): ${normalizedEmail}`);
        return res.status(403).json({
          message: "Access restricted. Your email is not on the beta invite list. Contact info@arcside.co.za to request access.",
        });
      }

      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = `local_${crypto.randomUUID()}`;

      await storage.upsertUser({
        id: userId,
        email: normalizedEmail,
        firstName: firstName?.trim() ?? "User",
        lastName: lastName?.trim() ?? "",
        passwordHash,
        authProvider: "email",
        isApprovedBetaTester: true,
      });

      const sessionUser: SessionUser = {
        id: userId,
        email: normalizedEmail,
        displayName: firstName?.trim() ?? "User",
      };

      req.login(sessionUser, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("[AUTH] Login after register error:", loginErr);
          return res.status(500).json({ message: "Registration succeeded but login failed. Please sign in." });
        }
        console.log(`[AUTH] Registered and logged in: ${normalizedEmail}`);
        res.json({ success: true, message: "Account created successfully." });
      });
    } catch (error) {
      console.error("[AUTH] Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/login/local", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      async (err: Error | null, user: SessionUser | false, info: { message: string } | undefined) => {
        if (err) {
          console.error("[AUTH] Local login error:", err);
          return res.status(500).json({ message: "Login failed. Please try again." });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message ?? "Invalid credentials." });
        }

        const allowed = user.email ? await storage.isEmailInWhitelist(user.email) : false;
        if (!allowed) {
          console.log(`[AUTH] Local login denied (not whitelisted): ${user.email}`);
          return res.status(403).json({
            message: "Access restricted. Your email is not on the beta invite list. Contact info@arcside.co.za to request access.",
          });
        }

        req.login(user, (loginErr: Error | null) => {
          if (loginErr) {
            console.error("[AUTH] Session login error:", loginErr);
            return res.status(500).json({ message: "Login failed. Please try again." });
          }
          console.log(`[AUTH] Local login successful: ${user.email}`);
          res.json({ success: true });
        });
      }
    )(req, res, next);
  });

  app.get("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sessionUser = req.user as SessionUser;
      if (!sessionUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const dbUser = await storage.getUser(sessionUser.id);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(toPublicUser(dbUser));
    } catch (error) {
      console.error("[AUTH] /api/auth/user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[AUTH] isAuthenticated middleware - req.isAuthenticated():`, req.isAuthenticated?.());
  console.log(`[AUTH] isAuthenticated middleware - req.user:`, req.user);

  if (req.isAuthenticated?.()) {
    console.log("[AUTH] User is authenticated, proceeding");
    return next();
  }

  console.log("[AUTH] User is not authenticated, returning 401");
  res.status(401).json({ message: "Unauthorized" });
};

export const isAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as SessionUser | undefined;
  if (!user || user.email?.toLowerCase() !== "info@arcside.co.za") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};
