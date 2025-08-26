import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  certifications: text("certifications"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, premium
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  material: varchar("material"),
  process: varchar("process"),
  status: varchar("status").default("active"), // active, completed, archived
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  type: varchar("type").notNull(), // defect-analysis, wps-generation, material-check, terminology, assistant
  input: text("input").notNull(),
  result: jsonb("result").notNull(),
  severity: varchar("severity"), // low, medium, high, critical
  title: varchar("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wpsDocuments = pgTable("wps_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  wpsNumber: varchar("wps_number").notNull(),
  title: varchar("title").notNull(),
  baseMaterial: varchar("base_material"),
  fillerMetal: varchar("filler_metal"),
  process: varchar("process"),
  standard: varchar("standard"),
  thickness: decimal("thickness", { precision: 10, scale: 3 }),
  parameters: jsonb("parameters"),
  status: varchar("status").default("draft"), // draft, approved, revision
  revision: integer("revision").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageTracking = pgTable("usage_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  analysesCount: integer("analyses_count").default(0),
  wpsCount: integer("wps_count").default(0),
  exportsCount: integer("exports_count").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  analyses: many(analyses),
  wpsDocuments: many(wpsDocuments),
  usageTracking: many(usageTracking),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  analyses: many(analyses),
  wpsDocuments: many(wpsDocuments),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, {
    fields: [analyses.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [analyses.projectId],
    references: [projects.id],
  }),
}));

export const wpsDocumentsRelations = relations(wpsDocuments, ({ one }) => ({
  user: one(users, {
    fields: [wpsDocuments.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [wpsDocuments.projectId],
    references: [projects.id],
  }),
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, {
    fields: [usageTracking.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const insertWpsSchema = createInsertSchema(wpsDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertWps = z.infer<typeof insertWpsSchema>;
export type WpsDocument = typeof wpsDocuments.$inferSelect;
export type UsageTracking = typeof usageTracking.$inferSelect;
