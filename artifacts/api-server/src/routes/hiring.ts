import { Router } from "express";
import { db, hiringReportsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import OpenAI from "openai";
import {
  AnalyzeHiringBody,
  ListHiringHistoryQueryParams,
  GetHiringReportParams,
  DeleteHiringReportParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateHiringReport(
  country: string,
  role: string,
  companySize: string
) {
  const companySizeLabel =
    companySize === "startup"
      ? "a startup (<50 employees)"
      : companySize === "smb"
        ? "a small/medium business (50-500 employees)"
        : "an enterprise (500+ employees)";

  const prompt = `You are an expert in international employment law, global HR, and cross-border talent acquisition.

A company that is ${companySizeLabel} wants to hire a ${role} in ${country}.

Provide a structured hiring analysis in JSON format with these exact keys:
{
  "summary": "2-3 sentence executive summary of hiring feasibility and key considerations",
  "hiringWorkflow": ["step 1", "step 2", ...] (6-8 concrete steps to hire in this country),
  "interviewProcess": ["step 1", "step 2", ...] (4-6 interview process recommendations for this country/role),
  "onboardingPlan": ["item 1", "item 2", ...] (6-8 onboarding checklist items specific to this country),
  "complianceNotes": ["note 1", "note 2", ...] (4-6 compliance and legal considerations for this country),
  "risks": ["risk 1", "risk 2", ...] (4-5 specific hiring risks for this country/role/company size),
  "riskAssessment": "low" | "medium" | "high" (overall hiring risk level)
}

Be specific and actionable. Reference actual laws, regulations, or cultural norms where relevant. Focus on practical business value.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);
  return {
    summary: parsed.summary ?? "",
    hiringWorkflow: parsed.hiringWorkflow ?? [],
    interviewProcess: parsed.interviewProcess ?? [],
    onboardingPlan: parsed.onboardingPlan ?? [],
    complianceNotes: parsed.complianceNotes ?? [],
    risks: parsed.risks ?? [],
    riskAssessment: (parsed.riskAssessment ?? "medium") as
      | "low"
      | "medium"
      | "high",
  };
}

// POST /api/hiring/analyze
router.post("/hiring/analyze", async (req, res) => {
  const parsed = AnalyzeHiringBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { country, role, companySize } = parsed.data;

  try {
    req.log.info({ country, role, companySize }, "Generating hiring report");
    const aiResult = await generateHiringReport(country, role, companySize);

    const [report] = await db
      .insert(hiringReportsTable)
      .values({
        country,
        role,
        companySize,
        ...aiResult,
      })
      .returning();

    res.status(201).json({
      ...report,
      createdAt: report.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate hiring report");
    res.status(500).json({ error: "Failed to generate hiring report" });
  }
});

// GET /api/hiring/history
router.get("/hiring/history", async (req, res) => {
  const parsed = ListHiringHistoryQueryParams.safeParse(req.query);
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  try {
    const [reports, countResult] = await Promise.all([
      db
        .select()
        .from(hiringReportsTable)
        .orderBy(desc(hiringReportsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(hiringReportsTable),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      reports: reports.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch hiring history");
    res.status(500).json({ error: "Failed to fetch hiring history" });
  }
});

// GET /api/hiring/history/:id
router.get("/hiring/history/:id", async (req, res) => {
  const parsed = GetHiringReportParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [report] = await db
      .select()
      .from(hiringReportsTable)
      .where(eq(hiringReportsTable.id, parsed.data.id))
      .limit(1);

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json({ ...report, createdAt: report.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch hiring report");
    res.status(500).json({ error: "Failed to fetch hiring report" });
  }
});

// DELETE /api/hiring/history/:id
router.delete("/hiring/history/:id", async (req, res) => {
  const parsed = DeleteHiringReportParams.safeParse({
    id: Number(req.params.id),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(hiringReportsTable)
      .where(eq(hiringReportsTable.id, parsed.data.id))
      .returning({ id: hiringReportsTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete hiring report");
    res.status(500).json({ error: "Failed to delete hiring report" });
  }
});

// GET /api/hiring/stats
router.get("/hiring/stats", async (req, res) => {
  try {
    const [totalResult, countryStats, roleStats, riskStats] = await Promise.all(
      [
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(hiringReportsTable),
        db
          .select({
            name: hiringReportsTable.country,
            count: sql<number>`count(*)::int`,
          })
          .from(hiringReportsTable)
          .groupBy(hiringReportsTable.country)
          .orderBy(desc(sql`count(*)`))
          .limit(5),
        db
          .select({
            name: hiringReportsTable.role,
            count: sql<number>`count(*)::int`,
          })
          .from(hiringReportsTable)
          .groupBy(hiringReportsTable.role)
          .orderBy(desc(sql`count(*)`))
          .limit(5),
        db
          .select({
            riskAssessment: hiringReportsTable.riskAssessment,
            count: sql<number>`count(*)::int`,
          })
          .from(hiringReportsTable)
          .groupBy(hiringReportsTable.riskAssessment),
      ]
    );

    const riskBreakdown = { low: 0, medium: 0, high: 0 };
    for (const r of riskStats) {
      if (r.riskAssessment === "low") riskBreakdown.low = r.count;
      else if (r.riskAssessment === "medium") riskBreakdown.medium = r.count;
      else if (r.riskAssessment === "high") riskBreakdown.high = r.count;
    }

    res.json({
      totalAnalyses: totalResult[0]?.count ?? 0,
      topCountries: countryStats,
      topRoles: roleStats,
      riskBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch hiring stats");
    res.status(500).json({ error: "Failed to fetch hiring stats" });
  }
});

export default router;
