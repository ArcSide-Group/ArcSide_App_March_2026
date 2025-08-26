import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAnalysisSchema, insertProjectSchema, insertWpsSchema } from "@shared/schema";
import { z } from "zod";

// AI Service Mock - In production, this would call actual AI APIs
class AIService {
  static async analyzeDefect(description: string): Promise<any> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      defectType: "Porosity",
      severity: "medium",
      causes: [
        "Inadequate shielding gas coverage",
        "Contaminated base material or filler wire",
        "Excessive travel speed"
      ],
      solutions: [
        "Increase gas flow rate to 25-30 CFH",
        "Clean base material thoroughly before welding",
        "Reduce travel speed and maintain steady arc"
      ],
      description: "Gas porosity is detected in your GMAW weld. This is a volumetric discontinuity formed by gas entrapment during solidification.",
      standards: "AWS D1.1 Section 6 acceptance criteria"
    };
  }

  static async generateWPS(params: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      wpsNumber: `WPS-${Date.now()}`,
      title: params.projectName || "Welding Procedure Specification",
      baseMaterial: params.baseMaterial,
      fillerMetal: this.getFillerMetal(params.baseMaterial, params.process),
      process: params.process,
      standard: params.standard,
      thickness: params.thickness,
      parameters: {
        voltage: "22-26V",
        amperage: "180-220A",
        shieldingGas: "75% Ar / 25% CO₂",
        current: "DC Electrode Positive (DCEP)",
        travelSpeed: "6-10 IPM"
      }
    };
  }

  static async checkMaterialCompatibility(material1: string, material2: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: "caution",
      compatibility: "These materials can be welded together but require special considerations",
      recommendations: [
        {
          title: "Filler Metal Selection",
          description: "Use 309L stainless steel filler metal to bridge the composition gap"
        },
        {
          title: "Preheating",
          description: "Preheat carbon steel to 200-300°F to minimize thermal stress"
        },
        {
          title: "Joint Design",
          description: "Consider using buttering technique on carbon steel side"
        }
      ],
      issues: [
        "Carbon migration from steel to stainless steel",
        "Formation of brittle intermetallic compounds",
        "Galvanic corrosion in wet environments"
      ]
    };
  }

  static async searchTerminology(term: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const definitions: Record<string, any> = {
      porosity: {
        definition: "Porosity is a cavity-type discontinuity formed by gas entrapment during solidification. It appears as rounded or elongated cavities in the weld metal.",
        types: ["Uniformly Scattered Porosity", "Cluster Porosity", "Linear Porosity", "Piping Porosity"],
        causes: [
          "Contaminated base material or filler metal",
          "Inadequate shielding gas coverage",
          "Excessive welding speed",
          "Moisture in electrode coating or flux"
        ],
        relatedTerms: ["Gas Inclusion", "Wormhole", "Cavity", "Discontinuity"]
      }
    };
    
    return definitions[term.toLowerCase()] || {
      definition: `Definition for "${term}" not found in current database.`,
      types: [],
      causes: [],
      relatedTerms: []
    };
  }

  static async askAssistant(question: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simple keyword-based responses for demo
    const responses: Record<string, string> = {
      undercut: "Great question! Preventing undercut in overhead welding requires several key techniques:\n\n• Use proper weaving technique - narrow stringer beads work best\n• Reduce travel speed to allow proper penetration\n• Maintain correct electrode angle (5-15° trailing)\n• Use appropriate amperage - not too high\n• Keep short arc length for better control\n\nWould you like me to explain any of these techniques in more detail?",
      "filler metal": "Selecting the right filler metal depends on your base materials, welding process, and application requirements. Here are the key factors:\n\n• Match or exceed base metal strength\n• Consider service conditions (temperature, corrosion)\n• Ensure chemical compatibility\n• Follow AWS classification system\n\nWhat specific materials are you working with?",
      "6g": "6G pipe welding is challenging but achievable with proper technique:\n\n• Start at the bottom (6 o'clock position)\n• Use uphill progression for better penetration\n• Maintain consistent travel speed\n• Watch your electrode angle and arc length\n• Practice root pass consistency\n\nWhat specific challenges are you facing with your 6G welds?"
    };
    
    const lowerQuestion = question.toLowerCase();
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(keyword)) {
        return response;
      }
    }
    
    return "I can help you with welding techniques, codes, materials, and troubleshooting. Could you provide more specific details about what you'd like to know?";
  }

  private static getFillerMetal(baseMaterial: string, process: string): string {
    if (baseMaterial?.includes("304") || baseMaterial?.includes("316")) {
      return process === "GTAW" ? "ER308L" : "E308L-16";
    }
    if (baseMaterial?.includes("A36") || baseMaterial?.includes("A572")) {
      return process === "GMAW" ? "ER70S-6" : "E7018";
    }
    return "ER70S-6"; // default
  }
}

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
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId
      });
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
      const { description, projectId } = req.body;
      
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

      const result = await AIService.analyzeDefect(description);
      
      // Save analysis
      const analysisData = insertAnalysisSchema.parse({
        userId,
        projectId: projectId || null,
        type: 'defect-analysis',
        input: description,
        result,
        severity: result.severity,
        title: `Defect Analysis - ${result.defectType}`
      });
      
      const analysis = await storage.createAnalysis(analysisData);
      await storage.incrementUsage(userId, 'analyses');
      
      res.json({ analysis, result });
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

      const result = await AIService.generateWPS(req.body);
      
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
      
      const result = await AIService.checkMaterialCompatibility(material1, material2);
      
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
      
      const result = await AIService.searchTerminology(term);
      
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
      
      const answer = await AIService.askAssistant(question);
      
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
      const usage = await storage.getMonthlyUsage(userId);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage" });
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
