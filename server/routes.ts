import { rateLimit } from 'express-rate-limit';
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertAnalysisSchema, insertProjectSchema, insertWpsSchema, insertWeldLogSchema } from "@shared/schema";
import { WeldingCalculators, FabricationCalculators } from "./calculators";
import { GeminiAIService } from "./ai-service";
import { z } from "zod";
import { Resend } from "resend";
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: { error: "Beta Limit Reached: Please try again tomorrow to help us manage API costs!" },
  standardHeaders: true,
  legacyHeaders: false,
});
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function sendMail(options: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn("[MAIL] RESEND_API_KEY not configured — emails will not be sent");
    return null;
  }
  return resend.emails.send({
    from: "ArcSide <onboarding@resend.dev>",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectData = { ...req.body, userId };
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.post('/api/ai/analyze-defect', isAuthenticated, aiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageData, additionalDetails } = req.body;
      const user = await storage.getUser(userId);
      if (user?.subscriptionTier === 'free') {
        const todayUsage = await storage.getTodayUsage(userId);
        if (todayUsage && (todayUsage.analysesCount || 0) >= 5) {
          return res.status(403).json({ message: "Daily analysis limit reached. Upgrade to Premium for unlimited analyses." });
        }
      }
      const analysisInput = additionalDetails || "Weld defect analysis from uploaded image";
      const unitPreference = req.body.unitPreference || 'metric';
      const result = await GeminiAIService.analyzeDefect(imageData || null, analysisInput, unitPreference);
      res.json(result);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze defect" });
    }
  });

  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, email, feedback } = req.body;
      await sendMail({
        to: "info@arcside.co.za",
        subject: `ArcSide Feedback from ${name || email || 'User'}`,
        html: `<p><strong>Name:</strong> ${name || ''}</p><p><strong>Email:</strong> ${email || ''}</p><p>${feedback || ''}</p>`,
      });
      res.json({ success: true, userId });
    } catch {
      res.status(500).json({ message: "Failed to send feedback" });
    }
  });

  app.get("/api/admin/whitelist", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const list = await storage.getWhitelist();
      res.json(list);
    } catch {
      res.status(500).json({ message: "Failed to fetch whitelist." });
    }
  });

  app.post("/api/admin/whitelist", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "A valid email address is required." });
      }
      const entry = await storage.addToWhitelist(email, req.user?.email ?? "admin");
      res.status(201).json(entry);
    } catch (err: any) {
      if (err?.code === "23505") {
        return res.status(409).json({ message: "That email is already on the whitelist." });
      }
      res.status(500).json({ message: "Failed to add email." });
    }
  });

  app.delete("/api/admin/whitelist/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.removeFromWhitelist(req.params.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to remove email." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
