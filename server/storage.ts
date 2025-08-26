import {
  users,
  projects,
  analyses,
  wpsDocuments,
  usageTracking,
  type User,
  type UpsertUser,
  type InsertProject,
  type Project,
  type InsertAnalysis,
  type Analysis,
  type InsertWps,
  type WpsDocument,
  type UsageTracking,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports'): Promise<void>;
  
  // Subscription operations
  upgradeSubscription(userId: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async incrementUsage(userId: string, type: 'analyses' | 'wps' | 'exports'): Promise<void> {
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
      }
      
      await db.insert(usageTracking).values(initialData);
    }
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
}

export const storage = new DatabaseStorage();
