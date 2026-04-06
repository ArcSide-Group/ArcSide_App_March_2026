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
import { eq, and, desc, gte, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: any): Promise<User>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getUserAnalyses(userId: string): Promise<Analysis[]>;
  createWps(wps: InsertWps): Promise<WpsDocument>;
  getUserWpsDocuments(userId: string): Promise<WpsDocument[]>;
  getTodayUsage(userId: string): Promise<UsageTracking | undefined>;
  getMonthlyUsage(userId: string): Promise<UsageTracking | undefined>;
  incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports' | 'calculations'): Promise<void>;
  saveCalculation(data: {
    userId: string;
    calculatorType: string;
    inputs: any;
    results: any;
    title: string;
    projectId?: string;
  }): Promise<any>;
  getUserCalculations(userId: string): Promise<any[]>;
  createWeldLogEntry(entry: InsertWeldLog): Promise<WeldLogEntry>;
  getUserWeldLogEntries(userId: string, projectId?: string): Promise<WeldLogEntry[]>;
  deleteWeldLogEntry(id: string, userId: string): Promise<void>;
  upgradeSubscription(userId: string): Promise<User>;
  submitBetaFeedback(feedback: InsertBetaFeedback): Promise<BetaFeedback>;
  getWhitelist(): Promise<WhitelistEntry[]>;
  addToWhitelist(email: any, addedBy?: string): Promise<WhitelistEntry>;
  removeFromWhitelist(id: string): Promise<void>;
  isEmailInWhitelist(email: any): Promise<boolean>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
}

const normalizeEmail = (email: any): string => (String(email || '')).toLowerCase().trim();

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(email)));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: { ...userData, updatedAt: new Date() }
    }).returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: any): Promise<User> {
    const [user] = await db.update(users).set({ ...profileData, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(analysisData).returning();
    return analysis;
  }

  async getUserAnalyses(userId: string): Promise<Analysis[]> {
    return await db.select().from(analyses).where(eq(analyses.userId, userId)).orderBy(desc(analyses.createdAt));
  }

  async createWps(wpsData: InsertWps): Promise<WpsDocument> {
    const [wps] = await db.insert(wpsDocuments).values(wpsData).returning();
    return wps;
  }

  async getUserWpsDocuments(userId: string): Promise<WpsDocument[]> {
    return await db.select().from(wpsDocuments).where(eq(wpsDocuments.userId, userId)).orderBy(desc(wpsDocuments.updatedAt));
  }

  async getTodayUsage(userId: string): Promise<UsageTracking | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [usage] = await db.select().from(usageTracking).where(and(eq(usageTracking.userId, userId), gte(usageTracking.date, today)));
    return usage;
  }

  async getMonthlyUsage(userId: string): Promise<UsageTracking | undefined> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [usage] = await db.select().from(usageTracking).where(and(eq(usageTracking.userId, userId), gte(usageTracking.date, startOfMonth)));
    return usage;
  }

  async incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports' | 'calculations'): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await this.getTodayUsage(userId);
    if (existing) {
      const updates: any = {};
      switch (type) {
        case 'analyses': updates.analysesCount = (existing.analysesCount || 0) + 1; break;
        case 'wps': updates.wpsCount = (existing.wpsCount || 0) + 1; break;
        case 'exports': updates.exportsCount = (existing.exportsCount || 0) + 1; break;
        case 'calculations': updates.calculationsCount = (existing.calculationsCount || 0) + 1; break;
      }
      await db.update(usageTracking).set(updates).where(eq(usageTracking.id, existing.id));
    } else {
      const initialData: any = { userId, date: today, analysesCount: 0, wpsCount: 0, exportsCount: 0, calculationsCount: 0 };
      switch (type) {
        case 'analyses': initialData.analysesCount = 1; break;
        case 'wps': initialData.wpsCount = 1; break;
        case 'exports': initialData.exportsCount = 1; break;
        case 'calculations': initialData.calculationsCount = 1; break;
      }
      await db.insert(usageTracking).values(initialData);
    }
  }

  async saveCalculation(data: { userId: string; calculatorType: string; inputs: any; results: any; title: string; projectId?: string; }): Promise<any> {
    const [calculation] = await db.insert(calculatorResults).values({ userId: data.userId, calculatorType: data.calculatorType, inputs: data.inputs, results: data.results, title: data.title, projectId: data.projectId }).returning();
    return calculation;
  }

  async getUserCalculations(userId: string): Promise<any[]> {
    return await db.query.calculatorResults.findMany({ where: eq(calculatorResults.userId, userId), orderBy: desc(calculatorResults.createdAt), limit: 50 });
  }

  async createWeldLogEntry(entryData: InsertWeldLog): Promise<WeldLogEntry> {
    const [entry] = await db.insert(weldLogEntries).values(entryData).returning();
    return entry;
  }

  async getUserWeldLogEntries(userId: string, projectId?: string): Promise<WeldLogEntry[]> {
    const conditions = [eq(weldLogEntries.userId, userId)];
    if (projectId) conditions.push(eq(weldLogEntries.projectId, projectId));
    return await db.select().from(weldLogEntries).where(and(...conditions)).orderBy(desc(weldLogEntries.entryDate));
  }

  async deleteWeldLogEntry(id: string, userId: string): Promise<void> {
    await db.delete(weldLogEntries).where(and(eq(weldLogEntries.id, id), eq(weldLogEntries.userId, userId)));
  }

  async upgradeSubscription(userId: string): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    const [user] = await db.update(users).set({ subscriptionTier: 'premium', subscriptionStatus: 'active', subscriptionExpiresAt: expiresAt, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }

  async submitBetaFeedback(feedback: InsertBetaFeedback): Promise<BetaFeedback> {
    const [entry] = await db.insert(betaFeedback).values(feedback).returning();
    return entry;
  }

  async getWhitelist(): Promise<WhitelistEntry[]> {
    return await db.select().from(whitelist).orderBy(desc(whitelist.addedAt));
  }

  async addToWhitelist(email: any, addedBy?: string): Promise<WhitelistEntry> {
    const normalized = normalizeEmail(email);
    if (!normalized) throw new Error("Email required");
    const [existing] = await db.select().from(whitelist).where(eq(whitelist.email, normalized));
    if (existing) return existing;
    const [entry] = await db.insert(whitelist).values({ email: normalized as string, addedBy: addedBy ?? 'admin' }).returning();
    return entry;
  }

  async removeFromWhitelist(id: string): Promise<void> {
    await db.delete(whitelist).where(eq(whitelist.id, id));
  }

  async isEmailInWhitelist(email: any): Promise<boolean> {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;
    const [entry] = await db.select().from(whitelist).where(eq(whitelist.email, normalized));
    return !!entry;
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db.update(users).set({ passwordResetToken: token, passwordResetExpires: expires }).where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.passwordResetToken, token), gt(users.passwordResetExpires, new Date())));
    return user;
  }
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private projects = new Map<string, Project>();
  private analyses = new Map<string, Analysis>();
  private wpsDocuments = new Map<string, WpsDocument>();
  private usageTracking = new Map<string, UsageTracking>();
  private calculatorResults = new Map<string, any>();
  private weldLogEntries = new Map<string, WeldLogEntry>();
  private feedbackData = new Map<string, BetaFeedback>();
  private whitelistData = new Map<string, WhitelistEntry>();

  async getUser(id: string) { return this.users.get(id); }
  async getUserByEmail(email: string) { return Array.from(this.users.values()).find(user => user.email?.toLowerCase() === normalizeEmail(email)); }
  async upsertUser(user: UpsertUser) { 
    const id = user.id as string;
    this.users.set(id, { ...(user as User) }); 
    return this.users.get(id)!; 
  }
  async updateUserProfile(userId: string, profileData: any) { const user = this.users.get(userId)!; const updated = { ...user, ...profileData, updatedAt: new Date() }; this.users.set(userId, updated); return updated; }
  async getUserProjects(userId: string) { return Array.from(this.projects.values()).filter(p => p.userId === userId); }
  async createProject(project: InsertProject) { const id = crypto.randomUUID(); const item = { id, ...project, createdAt: new Date(), updatedAt: new Date() } as Project; this.projects.set(id, item); return item; }
  async createAnalysis(analysis: InsertAnalysis) { const id = crypto.randomUUID(); const item = { id, ...analysis, createdAt: new Date() } as Analysis; this.analyses.set(id, item); return item; }
  async getUserAnalyses(userId: string) { return Array.from(this.analyses.values()).filter(a => a.userId === userId); }
  async createWps(wps: InsertWps) { const id = crypto.randomUUID(); const item = { id, ...wps, createdAt: new Date(), updatedAt: new Date() } as WpsDocument; this.wpsDocuments.set(id, item); return item; }
  async getUserWpsDocuments(userId: string) { return Array.from(this.wpsDocuments.values()).filter(w => w.userId === userId); }
  async getTodayUsage(userId: string) { return Array.from(this.usageTracking.values()).find(u => u.userId === userId); }
  async getMonthlyUsage(userId: string) { return this.getTodayUsage(userId); }
  async incrementUsage() { return; }
  async saveCalculation(data: any) { const id = crypto.randomUUID(); const item = { id, ...data, createdAt: new Date() }; this.calculatorResults.set(id, item); return item; }
  async getUserCalculations(userId: string) { return Array.from(this.calculatorResults.values()).filter((r: any) => r.userId === userId); }
  async createWeldLogEntry(entry: InsertWeldLog) { const id = crypto.randomUUID(); const item = { id, ...entry, createdAt: new Date() } as WeldLogEntry; this.weldLogEntries.set(id, item); return item; }
  async getUserWeldLogEntries(userId: string, projectId?: string) { return Array.from(this.weldLogEntries.values()).filter(e => e.userId === userId && (!projectId || e.projectId === projectId)); }
  async deleteWeldLogEntry(id: string, userId: string) { const entry = this.weldLogEntries.get(id); if (entry && entry.userId === userId) this.weldLogEntries.delete(id); }
  async upgradeSubscription(userId: string) { const user = this.users.get(userId)!; const updated = { ...user, subscriptionTier: 'premium', subscriptionStatus: 'active', updatedAt: new Date() }; this.users.set(userId, updated); return updated; }
  async submitBetaFeedback(feedback: InsertBetaFeedback) { const id = crypto.randomUUID(); const entry = { id, ...feedback, createdAt: new Date() } as BetaFeedback; this.feedbackData.set(id, entry); return entry; }
  async getWhitelist() { return Array.from(this.whitelistData.values()); }
  async addToWhitelist(email: any, addedBy?: string) { 
    const normalized = normalizeEmail(email); 
    if (!normalized) throw new Error("Email required"); 
    const id = crypto.randomUUID(); 
    const entry: WhitelistEntry = { id, email: normalized as string, addedBy: addedBy ?? 'admin', addedAt: new Date() }; 
    this.whitelistData.set(id, entry); 
    return entry; 
  }
  async removeFromWhitelist(id: string) { this.whitelistData.delete(id); }
  async isEmailInWhitelist(email: any) { return Array.from(this.whitelistData.values()).some(entry => entry.email === normalizeEmail(email)); }
  async setPasswordResetToken(userId: string, token: string, expires: Date) { const user = this.users.get(userId); if (user) this.users.set(userId, { ...user, passwordResetToken: token, passwordResetExpires: expires }); }
  async getUserByResetToken(token: string) { return Array.from(this.users.values()).find(u => u.passwordResetToken === token && (u.passwordResetExpires || new Date(0)) > new Date()); }
}

export const storage = new DatabaseStorage();