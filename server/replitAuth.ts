import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

// Hardcoded whitelist — only these email addresses can access the app
const ALLOWED_USERS = [
  'info@arcside.co.za',
  'caitywills16@gmail.com',
];

function isEmailAllowed(email: string | undefined | null): boolean {
  if (!email) return false;
  return ALLOWED_USERS.includes(email.toLowerCase().trim());
}

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days — persistent login
  const PgStore = connectPgSimple(session);
  const sessionStore = new PgStore({
    pool,
    tableName: "sessions",
    ttl: sessionTtl / 1000, // in seconds
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

async function upsertGoogleUser(profile: any) {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value || '';
  const firstName = profile.name?.givenName || profile.displayName || 'User';
  const lastName = profile.name?.familyName || '';
  const profileImageUrl = profile.photos?.[0]?.value || '';

  console.log(`[AUTH] Upserting Google user: googleId=${googleId}, email=${email}`);

  await storage.upsertUser({
    id: googleId,
    email,
    firstName,
    lastName,
    profileImageUrl,
    authProvider: 'google',
    isApprovedBetaTester: isEmailAllowed(email),
  });
}

export function setupAuth(app: Express) {
  const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
  const callbackURL = `https://${domain}/api/callback`;

  console.log(`[AUTH] Configuring Google OAuth with callback: ${callbackURL}`);

  // ── Google OAuth Strategy ────────────────────────────────────────────────
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

          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
          };
          console.log(`[AUTH] Strategy verify returning user:`, user);
          return done(null, user);
        } catch (error) {
          console.error("[AUTH] Strategy verify error:", error);
          return done(error as Error);
        }
      }
    )
  );

  // ── Local (email/password) Strategy ─────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          console.log(`[AUTH] Local strategy verify: email=${email}`);
          const user = await storage.getUserByEmail(email.toLowerCase().trim());

          if (!user) {
            return done(null, false, { message: 'No account found with that email.' });
          }
          if (!user.passwordHash) {
            return done(null, false, { message: 'This account uses Google sign-in. Please use the Google button.' });
          }

          const passwordMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordMatch) {
            return done(null, false, { message: 'Incorrect password.' });
          }

          const sessionUser = { id: user.id, email: user.email, displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() };
          console.log(`[AUTH] Local strategy returning user:`, sessionUser);
          return done(null, sessionUser);
        } catch (error) {
          console.error("[AUTH] Local strategy error:", error);
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    console.log(`[AUTH] Serializing user to session:`, user);
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log(`[AUTH] Deserializing user from session: id=${id}`);
      const user = await storage.getUser(id);
      console.log(`[AUTH] Deserialized user:`, user);
      done(null, user || null);
    } catch (error) {
      console.error("[AUTH] Deserialization error:", error);
      done(null, null);
    }
  });

  // Initialize Passport
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Session error recovery middleware
  app.use((req: any, res: any, next: any) => {
    if (!req.user && req.session && Object.keys(req.session).length > 1) {
      console.log(`[AUTH] Session exists but user is null. Clearing session.`);
      req.session.destroy((err: any) => {
        if (err) console.error("[AUTH] Session destroy error:", err);
      });
    }
    next();
  });

  // ── Google Login route ───────────────────────────────────────────────────
  app.get("/api/login", (req, res, next) => {
    console.log(`[AUTH] /api/login called, redirecting to Google`);
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  // ── Google OAuth callback ────────────────────────────────────────────────
  app.get(
    "/api/callback",
    (req, res, next) => {
      console.log(`[AUTH] /api/callback called`);
      next();
    },
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req: any, res) => {
      console.log(`[AUTH] After Google auth - req.user:`, req.user);

      // Whitelist check
      const email = req.user?.email;
      if (!isEmailAllowed(email)) {
        console.log(`[AUTH] Email ${email} not in whitelist. Redirecting to /private-beta`);
        return req.logout((err: any) => {
          if (err) console.error("[AUTH] Logout error:", err);
          res.redirect("/private-beta");
        });
      }

      req.session.save((err: any) => {
        if (err) {
          console.error("[AUTH] Session save error:", err);
          return res.redirect("/?error=session_save_failed");
        }
        console.log("[AUTH] Session saved successfully, redirecting to /");
        res.redirect("/");
      });
    }
  );

  // ── Email/Password Registration ──────────────────────────────────────────
  app.post("/api/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await storage.getUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = `local_${crypto.randomUUID()}`;

      await storage.upsertUser({
        id: userId,
        email: normalizedEmail,
        firstName: firstName?.trim() || 'User',
        lastName: lastName?.trim() || '',
        passwordHash,
        authProvider: 'email',
        isApprovedBetaTester: isEmailAllowed(normalizedEmail),
      });

      // Whitelist check before creating session
      if (!isEmailAllowed(normalizedEmail)) {
        return res.status(403).json({ message: "Access restricted. Your email is not on the beta invite list. Contact info@arcside.co.za to request access." });
      }

      const sessionUser = { id: userId, email: normalizedEmail, displayName: firstName?.trim() || 'User' };

      req.login(sessionUser, (loginErr: any) => {
        if (loginErr) {
          console.error("[AUTH] Login after register error:", loginErr);
          return res.status(500).json({ message: "Registration succeeded but login failed. Please sign in." });
        }
        console.log(`[AUTH] Registered and logged in user: ${normalizedEmail}`);
        res.json({ success: true, message: "Account created successfully." });
      });
    } catch (error) {
      console.error("[AUTH] Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // ── Local Login ──────────────────────────────────────────────────────────
  app.post("/api/login/local", (req: any, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("[AUTH] Local login error:", err);
        return res.status(500).json({ message: "Login failed. Please try again." });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials." });
      }

      // Whitelist check
      if (!isEmailAllowed(user.email)) {
        return res.status(403).json({ message: "Access restricted. Your email is not on the beta invite list. Contact info@arcside.co.za to request access." });
      }

      req.login(user, (loginErr: any) => {
        if (loginErr) {
          console.error("[AUTH] Session login error:", loginErr);
          return res.status(500).json({ message: "Login failed. Please try again." });
        }
        console.log(`[AUTH] Local login successful: ${user.email}`);
        res.json({ success: true });
      });
    })(req, res, next);
  });

  // ── Logout route ─────────────────────────────────────────────────────────
  app.get("/api/logout", (req, res, next) => {
    console.log(`[AUTH] /api/logout called`);
    req.logout((err) => {
      if (err) {
        console.error("[AUTH] Logout error:", err);
        return next(err);
      }
      console.log("[AUTH] Logged out, redirecting to /");
      res.redirect("/");
    });
  });

  // ── Auth user endpoint ───────────────────────────────────────────────────
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      console.log(`[AUTH] /api/auth/user - req.user:`, user);

      if (!user) {
        console.log("[AUTH] No user in request, returning 401");
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`[AUTH] Returning user from /api/auth/user:`, user);
      res.json(user);
    } catch (error) {
      console.error("[AUTH] /api/auth/user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  console.log(`[AUTH] isAuthenticated middleware - req.isAuthenticated():`, req.isAuthenticated?.());
  console.log(`[AUTH] isAuthenticated middleware - req.user:`, req.user);

  if (req.isAuthenticated?.()) {
    console.log("[AUTH] User is authenticated, proceeding");
    return next();
  }

  console.log("[AUTH] User is not authenticated, returning 401");
  res.status(401).json({ message: "Unauthorized" });
};
