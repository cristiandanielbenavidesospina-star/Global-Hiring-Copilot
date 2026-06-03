import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hiringReportsTable = pgTable("hiring_reports", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  role: text("role").notNull(),
  companySize: text("company_size").notNull(),
  summary: text("summary").notNull(),
  hiringWorkflow: text("hiring_workflow").array().notNull().default([]),
  risks: text("risks").array().notNull().default([]),
  onboardingPlan: text("onboarding_plan").array().notNull().default([]),
  complianceNotes: text("compliance_notes").array().notNull().default([]),
  interviewProcess: text("interview_process").array().notNull().default([]),
  riskAssessment: text("risk_assessment").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHiringReportSchema = createInsertSchema(hiringReportsTable).omit({ id: true, createdAt: true });
export type InsertHiringReport = z.infer<typeof insertHiringReportSchema>;
export type HiringReport = typeof hiringReportsTable.$inferSelect;
