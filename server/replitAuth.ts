import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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

async function upsertUser(profile: any) {
  // Extract user data from Google profile
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value || '';
  const firstName = profile.name?.givenName || profile.displayName || 'User';
  const lastName = profile.name?.familyName || '';
  const profileImageUrl = profile.photos?.[0]?.value || '';

  console.log(`[AUTH] Upserting user: googleId=${googleId}, email=${email}`);

  await storage.upsertUser({
    id: googleId,
    email,
    firstName,
    lastName,
    profileImageUrl,
  });
}

export function setupAuth(app: Express) {
  const domain = process.env.REPLIT_DOMAINS!.split(",")[0];
  const callbackURL = `https://${domain}/api/callback`;
  
  console.log(`[AUTH] Configuring Google OAuth with callback: ${callbackURL}`);

  // Configure Google OAuth Strategy
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
          await upsertUser(profile);
          
          // Return minimal user object for session
          const user = {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
          };
          console.log(`[AUTH] Strategy verify returning user:`, user);
          return done(null, user);
        } catch (error) {
          console.error("[AUTH] Strategy verify error:", error);
          return done(error);
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
      // If user doesn't exist, pass null (unauthenticated) instead of error
      done(null, user || null);
    } catch (error) {
      console.error("[AUTH] Deserialization error:", error);
      // On error, treat as unauthenticated instead of propagating error
      done(null, null);
    }
  });

  // Initialize Passport
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Session error recovery middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // If user was expected to be deserialized but is null/undefined, clear session
    if (!req.user && req.session && Object.keys(req.session).length > 1) {
      console.log(`[AUTH] Session exists but user is null. Clearing session.`);
      req.session.destroy((err) => {
        if (err) {
          console.error("[AUTH] Session destroy error:", err);
        }
      });
    }
    next();
  });

  // Login route — redirect to Google
  app.get("/api/login", (req, res, next) => {
    console.log(`[AUTH] /api/login called, redirecting to Google`);
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  });

  // Google OAuth callback
  app.get(
    "/api/callback",
    (req, res, next) => {
      console.log(`[AUTH] /api/callback called`);
      console.log(`[AUTH] Before auth - req.user:`, req.user);
      console.log(`[AUTH] Session ID:`, req.sessionID);
      next();
    },
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req: any, res) => {
      console.log(`[AUTH] After auth - req.user:`, req.user);
      console.log(`[AUTH] req.isAuthenticated():`, req.isAuthenticated());
      console.log(`[AUTH] Session ID after auth:`, req.sessionID);

      // Check if user is approved beta tester
      if (req.user?.id) {
        const user = await storage.getUser(req.user.id);
        if (!user?.isApprovedBetaTester) {
          console.log(`[AUTH] User ${req.user.id} is not approved. Redirecting to /request-access`);
          return res.redirect("/?status=access_request");
        }
      }
      
      // Save session explicitly before redirect
      req.session.save((err) => {
        if (err) {
          console.error("[AUTH] Session save error:", err);
          return res.redirect("/?error=session_save_failed");
        }
        console.log("[AUTH] Session saved successfully, redirecting to /");
        res.redirect("/");
      });
    }
  );

  // Logout route
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

  // Auth user endpoint
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
