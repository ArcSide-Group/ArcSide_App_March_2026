import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAnalysisSchema, insertProjectSchema, insertWpsSchema, insertWeldLogSchema } from "@shared/schema";
import { WeldingCalculators, FabricationCalculators } from "./calculators";
import { GeminiAIService } from "./ai-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Projects routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = { ...req.body, userId };
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // AI Tools routes
  app.post('/api/ai/analyze-defect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageData, additionalDetails, projectId } = req.body;

      // Check subscription limits for free users
      const user = await storage.getUser(userId);
      if (user?.subscriptionTier === 'free') {
        const todayUsage = await storage.getTodayUsage(userId);
        if (todayUsage && (todayUsage.analysesCount || 0) >= 5) {
          return res.status(403).json({
            message: "Daily analysis limit reached. Upgrade to Premium for unlimited analyses."
          });
        }
      }

      // Use additionalDetails or a generic description based on image
      const analysisInput = additionalDetails || "Weld defect analysis from uploaded image";
      const result = await GeminiAIService.analyzeDefect(imageData || null, analysisInput);

      // Save analysis with image data
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

      res.json({ analysis, result, imageData });
    } catch (error) {
      console.error('Defect analysis error:', error);
      res.status(500).json({ message: "Failed to analyze defect" });
    }
  });

  app.post('/api/ai/generate-wps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.subscriptionTier === 'free') {
        return res.status(403).json({
          message: "WPS generation requires Premium subscription"
        });
      }

      const result = await GeminiAIService.generateWPS(req.body);

      // Save WPS document
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
      console.error('WPS generation error:', error);
      res.status(500).json({ message: "Failed to generate WPS" });
    }
  });

  app.post('/api/ai/check-compatibility', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { material1, material2, projectId } = req.body;

      const result = await GeminiAIService.checkMaterialCompatibility(material1, material2);

      // Save analysis
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
      console.error('Material compatibility error:', error);
      res.status(500).json({ message: "Failed to check material compatibility" });
    }
  });

  app.post('/api/ai/search-terminology', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { term } = req.body;

      const result = await GeminiAIService.searchTerminology(term);

      // Save search
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
      console.error('Terminology search error:', error);
      res.status(500).json({ message: "Failed to search terminology" });
    }
  });

  app.post('/api/ai/ask-assistant', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question, projectId } = req.body;

      const { conversationHistory } = req.body;
      const answer = await GeminiAIService.askAssistant(question, conversationHistory);

      // Save conversation
      const analysisData = insertAnalysisSchema.parse({
        userId,
        projectId: projectId || null,
        type: 'assistant',
        input: question,
        result: { answer },
        title: `Assistant Query`
      });

      const analysis = await storage.createAnalysis(analysisData);

      res.json({ analysis, answer });
    } catch (error) {
      console.error('Assistant error:', error);
      res.status(500).json({ message: "Failed to get assistant response" });
    }
  });

  // Usage tracking
  app.get('/api/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getTodayUsage(userId);
      res.json(usage || { analysesCount: 0, wpsCount: 0, exportsCount: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Calculator routes
  app.post('/api/calculators/voltage-amperage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = WeldingCalculators.calculateVoltageAmperage(req.body);

      // Save calculation
      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'voltage-amperage',
        inputs: req.body,
        results: result,
        title: 'Voltage & Amperage Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate voltage and amperage" });
    }
  });

  app.post('/api/calculators/wire-feed-speed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = WeldingCalculators.calculateWireFeedSpeed(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'wire-feed-speed',
        inputs: req.body,
        results: result,
        title: 'Wire Feed Speed Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate wire feed speed" });
    }
  });

  app.post('/api/calculators/heat-input', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = WeldingCalculators.calculateHeatInput(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'heat-input',
        inputs: req.body,
        results: result,
        title: 'Heat Input Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate heat input" });
    }
  });

  app.post('/api/calculators/gas-flow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = WeldingCalculators.calculateGasFlowRate(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'gas-flow',
        inputs: req.body,
        results: result,
        title: 'Gas Flow Rate Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate gas flow rate" });
    }
  });

  app.post('/api/calculators/metal-weight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = FabricationCalculators.calculateMetalWeight(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'metal-weight',
        inputs: req.body,
        results: result,
        title: 'Metal Weight Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate metal weight" });
    }
  });

  app.post('/api/calculators/bend-allowance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = FabricationCalculators.calculateBendAllowance(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'bend-allowance',
        inputs: req.body,
        results: result,
        title: 'Bend Allowance Calculation'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate bend allowance" });
    }
  });

  app.post('/api/calculators/project-cost', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = FabricationCalculators.calculateProjectCost(req.body);

      const calculation = await storage.saveCalculation({
        userId,
        calculatorType: 'project-cost',
        inputs: req.body,
        results: result,
        title: 'Project Cost Estimate'
      });

      await storage.incrementUsage(userId, 'calculations');
      res.json({ calculation, result });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate project cost" });
    }
  });

  // User profile management
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Calculator history
  app.get('/api/calculators/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calculations = await storage.getUserCalculations(userId);
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calculation history" });
    }
  });

  // Weld Log routes
  app.get('/api/weld-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = req.query.projectId as string | undefined;
      const entries = await storage.getUserWeldLogEntries(userId, projectId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weld log entries" });
    }
  });

  app.post('/api/weld-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertWeldLogSchema.parse({ ...req.body, userId });
      const entry = await storage.createWeldLogEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create weld log entry" });
    }
  });

  app.delete('/api/weld-log/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteWeldLogEntry(req.params.id, userId);
      res.json({ message: "Entry deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Subscription management
  app.post('/api/subscription/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock payment processing
      await storage.upgradeSubscription(userId);
      res.json({ message: "Subscription upgraded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}