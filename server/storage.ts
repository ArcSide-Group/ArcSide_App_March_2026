import {
  users,
  projects,
  analyses,
  wpsDocuments,
  usageTracking,
  calculatorResults,
  weldLogEntries,
  betaFeedback,
  whitelist,
  type User,
  type UpsertUser,
  type InsertProject,
  type Project,
  type InsertAnalysis,
  type Analysis,
  type InsertWps,
  type WpsDocument,
  type UsageTracking,
  type InsertWeldLog,
  type WeldLogEntry,
  type InsertBetaFeedback,
  type BetaFeedback,
  type WhitelistEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: any): Promise<User>;

  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;

  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getUserAnalyses(userId: string): Promise<Analysis[]>;

  // WPS operations
  createWps(wps: InsertWps): Promise<WpsDocument>;
  getUserWpsDocuments(userId: string): Promise<WpsDocument[]>;

  // Usage tracking
  getTodayUsage(userId: string): Promise<UsageTracking | undefined>;
  getMonthlyUsage(userId: string): Promise<UsageTracking | undefined>;
  incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports' | 'calculations'): Promise<void>;

  // Calculation operations
  saveCalculation(data: {
    userId: string;
    calculatorType: string;
    inputs: any;
    results: any;
    title: string;
    projectId?: string;
  }): Promise<any>;
  getUserCalculations(userId: string): Promise<any[]>;

  // Weld log operations
  createWeldLogEntry(entry: InsertWeldLog): Promise<WeldLogEntry>;
  getUserWeldLogEntries(userId: string, projectId?: string): Promise<WeldLogEntry[]>;
  deleteWeldLogEntry(id: string, userId: string): Promise<void>;

  // Subscription operations
  upgradeSubscription(userId: string): Promise<User>;

  // Beta feedback operations
  submitBetaFeedback(feedback: InsertBetaFeedback): Promise<BetaFeedback>;

  // Whitelist operations
  getWhitelist(): Promise<WhitelistEntry[]>;
  addToWhitelist(email: string, addedBy?: string): Promise<WhitelistEntry>;
  removeFromWhitelist(id: string): Promise<void>;
  isEmailInWhitelist(email: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: any): Promise<User> {
    const [user] = await db.update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return project;
  }

  // Analysis operations
  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db
      .insert(analyses)
      .values(analysisData)
      .returning();
    return analysis;
  }

  async getUserAnalyses(userId: string): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }

  // WPS operations
  async createWps(wpsData: InsertWps): Promise<WpsDocument> {
    const [wps] = await db
      .insert(wpsDocuments)
      .values(wpsData)
      .returning();
    return wps;
  }

  async getUserWpsDocuments(userId: string): Promise<WpsDocument[]> {
    return await db
      .select()
      .from(wpsDocuments)
      .where(eq(wpsDocuments.userId, userId))
      .orderBy(desc(wpsDocuments.updatedAt));
  }

  // Usage tracking
  async getTodayUsage(userId: string): Promise<UsageTracking | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.date, today)
        )
      );

    return usage;
  }

  async getMonthlyUsage(userId: string): Promise<UsageTracking | undefined> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.date, startOfMonth)
        )
      );

    return usage;
  }

  async incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports' | 'calculations'): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.getTodayUsage(userId);

    if (existing) {
      const updates: any = {};
      switch (type) {
        case 'analyses':
          updates.analysesCount = (existing.analysesCount || 0) + 1;
          break;
        case 'wps':
          updates.wpsCount = (existing.wpsCount || 0) + 1;
          break;
        case 'exports':
          updates.exportsCount = (existing.exportsCount || 0) + 1;
          break;
        case 'calculations':
          updates.calculationsCount = (existing.calculationsCount || 0) + 1;
          break;
      }

      await db
        .update(usageTracking)
        .set(updates)
        .where(eq(usageTracking.id, existing.id));
    } else {
      const initialData: any = {
        userId,
        date: today,
        analysesCount: 0,
        wpsCount: 0,
        exportsCount: 0,
        calculationsCount: 0,
      };

      switch (type) {
        case 'analyses':
          initialData.analysesCount = 1;
          break;
        case 'wps':
          initialData.wpsCount = 1;
          break;
        case 'exports':
          initialData.exportsCount = 1;
          break;
        case 'calculations':
          initialData.calculationsCount = 1;
          break;
      }

      await db.insert(usageTracking).values(initialData);
    }
  }

  // Calculation operations
  async saveCalculation(data: {
    userId: string;
    calculatorType: string;
    inputs: any;
    results: any;
    title: string;
    projectId?: string;
  }): Promise<any> {
    const [calculation] = await db.insert(calculatorResults).values({
      userId: data.userId,
      projectId: data.projectId,
      calculatorType: data.calculatorType,
      inputs: data.inputs,
      results: data.results,
      title: data.title
    }).returning();
    return calculation;
  }

  async getUserCalculations(userId: string): Promise<any[]> {
    return await db.query.calculatorResults.findMany({
      where: eq(calculatorResults.userId, userId),
      orderBy: desc(calculatorResults.createdAt),
      limit: 50
    });
  }

  // Weld log operations
  async createWeldLogEntry(entryData: InsertWeldLog): Promise<WeldLogEntry> {
    const [entry] = await db.insert(weldLogEntries).values(entryData).returning();
    return entry;
  }

  async getUserWeldLogEntries(userId: string, projectId?: string): Promise<WeldLogEntry[]> {
    const conditions = [eq(weldLogEntries.userId, userId)];
    if (projectId) conditions.push(eq(weldLogEntries.projectId, projectId));
    return await db
      .select()
      .from(weldLogEntries)
      .where(and(...conditions))
      .orderBy(desc(weldLogEntries.entryDate));
  }

  async deleteWeldLogEntry(id: string, userId: string): Promise<void> {
    await db
      .delete(weldLogEntries)
      .where(and(eq(weldLogEntries.id, id), eq(weldLogEntries.userId, userId)));
  }

  // Subscription operations
  async upgradeSubscription(userId: string): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async submitBetaFeedback(feedback: InsertBetaFeedback): Promise<BetaFeedback> {
    const [entry] = await db.insert(betaFeedback).values(feedback).returning();
    return entry;
  }

  // Whitelist operations
  async getWhitelist(): Promise<WhitelistEntry[]> {
    return await db.select().from(whitelist).orderBy(whitelist.addedAt);
  }

  async addToWhitelist(email: string, addedBy?: string): Promise<WhitelistEntry> {
    const [entry] = await db
      .insert(whitelist)
      .values({ email: email.toLowerCase().trim(), addedBy: addedBy ?? "admin" })
      .returning();
    return entry;
  }

  async removeFromWhitelist(id: string): Promise<void> {
    await db.delete(whitelist).where(eq(whitelist.id, id));
  }

  async isEmailInWhitelist(email: string): Promise<boolean> {
    const [entry] = await db
      .select()
      .from(whitelist)
      .where(eq(whitelist.email, email.toLowerCase().trim()));
    return !!entry;
  }
}

class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private projects = new Map<string, Project>();
  private analyses = new Map<string, Analysis>();
  private wpsDocuments = new Map<string, WpsDocument>();
  private usageTracking = new Map<string, UsageTracking>();
  private calculations = new Map<string, any>();
  private weldLog = new Map<string, WeldLogEntry>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      ...existing,
      ...userData,
      id: userData.id || crypto.randomUUID(),
      updatedAt: new Date(),
      createdAt: existing?.createdAt || new Date(),
    } as User;
    this.users.set(user.id, user);
    return user;
  }

  async updateUserProfile(userId: string, profileData: any): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...profileData, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const project: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Project;
    this.projects.set(project.id, project);
    return project;
  }

  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const analysis: Analysis = {
      ...analysisData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as Analysis;
    this.analyses.set(analysis.id, analysis);
    return analysis;
  }

  async getUserAnalyses(userId: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createWps(wpsData: InsertWps): Promise<WpsDocument> {
    const wps: WpsDocument = {
      ...wpsData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WpsDocument;
    this.wpsDocuments.set(wps.id, wps);
    return wps;
  }

  async getUserWpsDocuments(userId: string): Promise<WpsDocument[]> {
    return Array.from(this.wpsDocuments.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async getTodayUsage(userId: string): Promise<UsageTracking | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.usageTracking.values())
      .find(u => u.userId === userId && u.date!.getTime() >= today.getTime());
  }

  async getMonthlyUsage(userId: string): Promise<UsageTracking | undefined> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return Array.from(this.usageTracking.values())
      .find(u => u.userId === userId && u.date!.getTime() >= startOfMonth.getTime());
  }

  async incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports' | 'calculations'): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let usage = await this.getTodayUsage(userId);
    
    if (!usage) {
      usage = {
        id: crypto.randomUUID(),
        userId,
        date: today,
        analysesCount: 0,
        wpsCount: 0,
        exportsCount: 0,
        calculationsCount: 0,
        templatesUsed: 0,
      } as UsageTracking;
    }

    switch (type) {
      case 'analyses': usage.analysesCount = (usage.analysesCount || 0) + 1; break;
      case 'wps': usage.wpsCount = (usage.wpsCount || 0) + 1; break;
      case 'exports': usage.exportsCount = (usage.exportsCount || 0) + 1; break;
      case 'calculations': usage.calculationsCount = (usage.calculationsCount || 0) + 1; break;
    }

    this.usageTracking.set(usage.id, usage);
  }

  async saveCalculation(data: {
    userId: string;
    calculatorType: string;
    inputs: any;
    results: any;
    title: string;
    projectId?: string;
  }): Promise<any> {
    const calculation = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.calculations.set(calculation.id, calculation);
    return calculation;
  }

  async getUserCalculations(userId: string): Promise<any[]> {
    return Array.from(this.calculations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }

  async createWeldLogEntry(entryData: InsertWeldLog): Promise<WeldLogEntry> {
    const entry: WeldLogEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    } as WeldLogEntry;
    this.weldLog.set(entry.id, entry);
    return entry;
  }

  async getUserWeldLogEntries(userId: string, projectId?: string): Promise<WeldLogEntry[]> {
    return Array.from(this.weldLog.values())
      .filter(e => e.userId === userId && (!projectId || e.projectId === projectId))
      .sort((a, b) => new Date(b.entryDate!).getTime() - new Date(a.entryDate!).getTime());
  }

  async deleteWeldLogEntry(id: string, userId: string): Promise<void> {
    const entry = this.weldLog.get(id);
    if (entry && entry.userId === userId) this.weldLog.delete(id);
  }

  async upgradeSubscription(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    const updated = {
      ...user,
      subscriptionTier: 'premium' as const,
      subscriptionStatus: 'active' as const,
      subscriptionExpiresAt: expiresAt,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    return updated;
  }

  async submitBetaFeedback(feedback: InsertBetaFeedback): Promise<BetaFeedback> {
    const id = Math.random().toString(36).substring(7);
    const feedbackEntry: BetaFeedback = {
      id,
      ...feedback,
      createdAt: new Date(),
    };
    this.feedbackData.set(id, feedbackEntry);
    return feedbackEntry;
  }

  private feedbackData = new Map<string, BetaFeedback>();
  private whitelistData = new Map<string, WhitelistEntry>();

  async getWhitelist(): Promise<WhitelistEntry[]> {
    return Array.from(this.whitelistData.values());
  }

  async addToWhitelist(email: string, addedBy?: string): Promise<WhitelistEntry> {
    const id = crypto.randomUUID();
    const entry: WhitelistEntry = { id, email: email.toLowerCase().trim(), addedBy: addedBy ?? "admin", addedAt: new Date() };
    this.whitelistData.set(id, entry);
    return entry;
  }

  async removeFromWhitelist(id: string): Promise<void> {
    this.whitelistData.delete(id);
  }

  async isEmailInWhitelist(email: string): Promise<boolean> {
    return Array.from(this.whitelistData.values()).some(e => e.email === email.toLowerCase().trim());
  }
}

export const storage = new DatabaseStorage();