import { rateLimit } from 'express-rate-limit';
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import type { Request, Response, NextFunction } from "express";

const requirePro = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const plan = await storage.getEffectivePlan(userId);
    if (!plan.isPro) {
      return res.status(403).json({
        message: "Pro subscription required to use AI tools.",
        proRequired: true,
        plan,
      });
    }
    next();
  } catch (err) {
    console.error("requirePro check failed:", err);
    res.status(500).json({ message: "Failed to verify subscription." });
  }
};
import { insertAnalysisSchema, insertProjectSchema, insertWpsSchema, insertWeldLogSchema } from "@shared/schema";
import { WeldingCalculators, FabricationCalculators } from "./calculators";
import { GeminiAIService } from "./ai-service";
import { z } from "zod";
import { sendMail } from "./mailer";

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: { error: "Beta Limit Reached: Please try again tomorrow to help us manage API costs!" },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Projects routes
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

  // AI Tools routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const plan = await storage.getEffectivePlan(req.user.id);
      res.json(plan);
    } catch (err) {
      console.error("GET /api/subscription failed:", err);
      res.status(500).json({ message: "Failed to load subscription." });
    }
  });

  app.post('/api/ai/analyze-defect', isAuthenticated, requirePro, aiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageData, additionalDetails, projectId } = req.body;

      const analysisInput = additionalDetails || "Weld defect analysis from uploaded image";
      const unitPreference = req.body.unitPreference || 'metric';
      const result = await GeminiAIService.analyzeDefect(imageData || null, analysisInput, unitPreference);

      const analysisData = insertAnalysisSchema.parse({
        userId,
        projectId: projectId || null,
        type: 'defect-analysis',
        input: analysisInput,
        imageData: imageData || null,
        additionalDetails: additionalDetails || null,
        result,
        severity: result.severity,
        title: `Defect Analysis - ${result.defectType}`
      });

      const analysis = await storage.createAnalysis(analysisData);
      await storage.incrementUsage(userId, 'analyses');
      delete (req.body as any).imageData;

      res.json({ analysis, result });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('Defect analysis error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to analyze defect' });
    }
  });

  app.post('/api/ai/generate-wps', isAuthenticated, requirePro, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Beta launch: WPS generation is open to all authenticated users.

      const result = await GeminiAIService.generateWPS(req.body);

      const wpsData = insertWpsSchema.parse({
        userId,
        projectId: req.body.projectId || null,
        wpsNumber: result.wpsNumber,
        title: result.title,
        baseMaterial: result.baseMaterial,
        fillerMetal: result.fillerMetal,
        process: result.process,
        standard: result.standard,
        thickness: req.body.thickness,
        parameters: result.parameters
      });

      const wps = await storage.createWps(wpsData);
      await storage.incrementUsage(userId, 'wps');

      res.json({ wps, result });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('WPS generation error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to generate WPS' });
    }
  });

  app.post('/api/ai/check-compatibility', isAuthenticated, requirePro, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { material1, material2, projectId } = req.body;

      const result = await GeminiAIService.checkMaterialCompatibility(material1, material2);

      const analysisData = insertAnalysisSchema.parse({
        userId,
        projectId: projectId || null,
        type: 'material-check',
        input: `${material1} + ${material2}`,
        result,
        title: `Material Compatibility - ${material1} + ${material2}`
      });

      const analysis = await storage.createAnalysis(analysisData);
      await storage.incrementUsage(userId, 'analyses');

      res.json({ analysis, result });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('Material compatibility error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to check material compatibility' });
    }
  });

  app.post('/api/ai/search-terminology', isAuthenticated, requirePro, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { term } = req.body;

      const result = await GeminiAIService.searchTerminology(term);

      const analysisData = insertAnalysisSchema.parse({
        userId,
        type: 'terminology',
        input: term,
        result,
        title: `Terminology Search - ${term}`
      });

      const analysis = await storage.createAnalysis(analysisData);

      res.json({ analysis, result });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('Terminology search error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to search terminology' });
    }
  });

  app.post('/api/ai/ask-assistant', isAuthenticated, requirePro, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { question, projectId, conversationHistory, unitPreference } = req.body;

      const answer = await GeminiAIService.askAssistant(question, conversationHistory, unitPreference || 'metric');

      const analysisData = insertAnalysisSchema.parse({
        userId,
        projectId: projectId || null,
        type: 'assistant',
        input: question,
        result: { answer },
        title: `Assistant Query`
      });

      const analysis = await storage.createAnalysis(analysisData);
      delete (req.body as any).conversationHistory;
      req.body = {};

      res.json({ analysis, answer });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('Assistant error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to get assistant response' });
    }
  });

  app.post('/api/ai/optimize-process', isAuthenticated, requirePro, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const result = await GeminiAIService.optimizeProcess(req.body);

      const processLabel = `${req.body.process} — ${req.body.material} @ ${req.body.thickness} mm`;
      const analysisData = insertAnalysisSchema.parse({
        userId,
        type: 'process-optimization',
        input: processLabel,
        result,
        title: `Process Optimization - ${req.body.process}`
      });

      const analysis = await storage.createAnalysis(analysisData);
      await storage.incrementUsage(userId, 'analyses');
      req.body = {};

      res.json({ analysis, result });
    } catch (error) {
      const status = (error as any)?.statusCode || 500;
      console.error('Process optimization error:', error);
      res.status(status).json({ message: (error as Error).message || 'Failed to optimize process' });
    }
  });

  // Usage tracking
  app.get('/api/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const usage = await storage.getTodayUsage(userId);
      res.json(usage || { analysesCount: 0, wpsCount: 0, exportsCount: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Calculator routes
  app.post('/api/calculators/voltage-amperage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateVoltageAmperage(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'voltage-amperage', inputs: req.body, results: result, title: 'Voltage & Amperage Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate voltage and amperage" });
    }
  });

  app.post('/api/calculators/wire-feed-speed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateWireFeedSpeed(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'wire-feed-speed', inputs: req.body, results: result, title: 'Wire Feed Speed Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate wire feed speed" });
    }
  });

  app.post('/api/calculators/heat-input', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateHeatInput(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'heat-input', inputs: req.body, results: result, title: 'Heat Input Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate heat input" });
    }
  });

  app.post('/api/calculators/gas-flow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateGasFlowRate(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'gas-flow', inputs: req.body, results: result, title: 'Gas Flow Rate Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate gas flow rate" });
    }
  });

  app.post('/api/calculators/metal-weight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = FabricationCalculators.calculateMetalWeight(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'metal-weight', inputs: req.body, results: result, title: 'Metal Weight Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate metal weight" });
    }
  });

  app.post('/api/calculators/bend-allowance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = FabricationCalculators.calculateBendAllowance(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'bend-allowance', inputs: req.body, results: result, title: 'Bend Allowance Calculation' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate bend allowance" });
    }
  });

  app.post('/api/calculators/project-cost', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = FabricationCalculators.calculateProjectCost(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'project-cost', inputs: req.body, results: result, title: 'Project Cost Estimate' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate project cost" });
    }
  });

  app.post('/api/calculators/preheat-temp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculatePreheatTemperature(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'preheat-temp', inputs: req.body, results: result, title: 'Preheat & Interpass Temperature' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate preheat temperature" });
    }
  });

  app.post('/api/calculators/filler-consumption', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateFillerConsumption(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'filler-consumption', inputs: req.body, results: result, title: 'Filler Metal Consumption' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate filler consumption" });
    }
  });

  app.post('/api/calculators/weld-time', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateWeldTime(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'weld-time', inputs: req.body, results: result, title: 'Weld Time Estimate' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate weld time" });
    }
  });

  app.post('/api/calculators/cutting-length', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = WeldingCalculators.calculateCuttingLength(req.body);
      const calculation = await storage.saveCalculation({ userId, calculatorType: 'cutting-length', inputs: req.body, results: result, title: 'Cut List Optimizer' });
      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate cutting length" });
    }
  });

  // User profile management
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Strict allowlist — never trust raw req.body for privileged fields like role,
      // subscriptionTier, subscriptionStatus, passwordHash, email, id, etc.
      const allowedKeys = ['firstName', 'lastName', 'company', 'profileImageUrl', 'preferences'];
      const sanitized: Record<string, any> = {};
      for (const k of allowedKeys) {
        if (k in (req.body || {})) sanitized[k] = req.body[k];
      }
      const updatedUser = await storage.updateUserProfile(userId, sanitized);
      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const incoming = req.body || {};
      const sanitized: Record<string, any> = {};

      // Validate each field strictly
      if ('theme' in incoming && (incoming.theme === 'dark' || incoming.theme === 'light')) {
        sanitized.theme = incoming.theme;
      }
      if ('units' in incoming && (incoming.units === 'metric' || incoming.units === 'imperial')) {
        sanitized.units = incoming.units;
      }
      if ('language' in incoming && typeof incoming.language === 'string' && incoming.language.length <= 32) {
        sanitized.language = incoming.language;
      }
      for (const boolKey of ['pushNotifications', 'emailUpdates', 'autoSave', 'shareUsage'] as const) {
        if (boolKey in incoming && typeof incoming[boolKey] === 'boolean') {
          sanitized[boolKey] = incoming[boolKey];
        }
      }

      const existing = await storage.getUser(userId);
      const merged = { ...(existing?.preferences as any || {}), ...sanitized };
      const updated = await storage.updateUserProfile(userId, { preferences: merged });
      res.json({ success: true, preferences: updated.preferences });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post('/api/user/accept-disclaimer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.updateUserProfile(userId, { disclaimerAcceptedAt: new Date() });
      res.json({ success: true });
    } catch (error) {
      console.error('Accept disclaimer error:', error);
      res.status(500).json({ message: "Failed to record disclaimer acceptance" });
    }
  });

  app.post('/api/user/profile-photo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image data" });
      }
      if (imageData.length > 7_000_000) {
        return res.status(400).json({ message: "Image too large. Please use an image under 5 MB." });
      }
      await storage.updateUserProfile(userId, { profileImageUrl: imageData });
      req.body = {};
      res.json({ success: true });
    } catch (error) {
      console.error('Profile photo upload error:', error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });

  // Calculator history
  app.get('/api/calculators/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const calculations = await storage.getUserCalculations(userId);
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculation history" });
    }
  });

  // Weld Log routes
  app.get('/api/weld-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.query.projectId as string | undefined;
      const entries = await storage.getUserWeldLogEntries(userId, projectId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weld log entries" });
    }
  });

  app.post('/api/weld-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryData = insertWeldLogSchema.parse({ ...req.body, userId });
      const entry = await storage.createWeldLogEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create weld log entry" });
    }
  });

  app.delete('/api/weld-log/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.deleteWeldLogEntry(req.params.id, userId);
      res.json({ message: "Entry deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Subscription management
  app.post('/api/subscription/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.upgradeSubscription(userId);
      res.json({ message: "Subscription upgraded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Beta feedback submission
  app.post('/api/beta-feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email || 'unknown';
      const { navigationRating, accuracyRating, aiQualityRating, performanceRating, technicalNotes } = req.body;

      if (![navigationRating, accuracyRating, aiQualityRating, performanceRating].every(r => r >= 1 && r <= 5)) {
        return res.status(400).json({ message: "All ratings must be between 1 and 5" });
      }

      const averageScore = (navigationRating + accuracyRating + aiQualityRating + performanceRating) / 4;

      const feedback = await storage.submitBetaFeedback({
        userId,
        navigationRating,
        accuracyRating,
        aiQualityRating,
        performanceRating,
        technicalNotes: technicalNotes || null,
        averageScore: averageScore.toFixed(2),
      });

      // Send feedback email via Resend
      try {
        const starRow = (label: string, rating: number) =>
          `${label}: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`;

        await sendMail({
          to: 'info@arcside.co.za',
          subject: `ArcSide Beta Feedback — ${averageScore.toFixed(1)}/5 ⭐ from ${userEmail}`,
          text: [
            `New beta feedback received from: ${userEmail}`,
            `Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}`,
            '',
            '── RATINGS ──────────────────────',
            starRow('Navigation & UX      ', navigationRating),
            starRow('Calculation Accuracy ', accuracyRating),
            starRow('AI Assistant Quality ', aiQualityRating),
            starRow('App Performance      ', performanceRating),
            '',
            `Overall Average: ${averageScore.toFixed(2)} / 5`,
            '',
            '── TECHNICAL NOTES ───────────────',
            technicalNotes?.trim() || '(none provided)',
            '',
            '─────────────────────────────────',
            'ArcSide™️ Beta Feedback System',
          ].join('\n'),
        });
        console.log(`[MAIL] Beta feedback email sent for user ${userEmail}`);
      } catch (mailError) {
        console.error("[MAIL] Failed to send feedback email:", mailError);
        // Do not fail the request — DB save succeeded
      }

      res.json(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Branding: public read (so unauthenticated landing also picks up brand)
  app.get("/api/branding", async (_req, res) => {
    try {
      const brandId = (await storage.getSetting("currentBrand")) || "arcside";
      res.json({ brandId });
    } catch {
      res.json({ brandId: "arcside" });
    }
  });

  // Branding: admin-only update
  app.post("/api/admin/branding", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { brandId } = req.body as { brandId?: string };
      if (!brandId || !["arcside", "afrox"].includes(brandId)) {
        return res.status(400).json({ message: "brandId must be 'arcside' or 'afrox'." });
      }
      await storage.setSetting("currentBrand", brandId);
      res.json({ success: true, brandId });
    } catch (error) {
      console.error("Failed to set brand:", error);
      res.status(500).json({ message: "Failed to update brand." });
    }
  });

  // Admin: whitelist management
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

  // Detailed feedback from FeedbackDrawer (email-only, no DB persistence)
  app.post('/api/beta-feedback-detailed', isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email ?? 'unknown';
      const { category, severity, toolTested, issueTitle, description, deviceInfo, phoneNumber, userName } = req.body;

      if (!category || !severity || !issueTitle || !description || !deviceInfo) {
        return res.status(400).json({ message: "Category, severity, issue title, description, and device info are required." });
      }

      const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

      await sendMail({
        to: 'info@arcside.co.za',
        subject: `[ArcSide Beta] ${category} — ${issueTitle} (${severity})`,
        text: [
          '╔══════════════════════════════════════════╗',
          '║       ARCSIDE™ BETA FEEDBACK REPORT      ║',
          '╚══════════════════════════════════════════╝',
          '',
          `Submitted : ${timestamp}`,
          `From      : ${userName || 'Unknown'} <${userEmail}>`,
          `Phone     : ${phoneNumber || '—'}`,
          '',
          '── CLASSIFICATION ─────────────────────────',
          `Category  : ${category}`,
          `Severity  : ${severity}`,
          `Tool      : ${toolTested || '—'}`,
          '',
          '── ISSUE DETAILS ───────────────────────────',
          `Title     : ${issueTitle}`,
          '',
          'Description:',
          description.trim(),
          '',
          '── ENVIRONMENT ─────────────────────────────',
          `Device    : ${deviceInfo}`,
          '',
          '────────────────────────────────────────────',
          'ArcSide™ Beta Feedback Drawer System',
        ].join('\n'),
      });
      console.log(`[MAIL] Detailed feedback email sent — ${category} from ${userEmail}`);

      res.json({ success: true, message: "Feedback submitted successfully." });
    } catch (error) {
      console.error("Error submitting detailed feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
