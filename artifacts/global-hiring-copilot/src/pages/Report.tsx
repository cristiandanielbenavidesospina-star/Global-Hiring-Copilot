import { useGetHiringReport, getGetHiringReportQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Briefcase, Building2, Calendar, ShieldAlert, CheckCircle2, ListChecks, Scale, FileText, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Report() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);

  const { data: report, isLoading, isError } = useGetHiringReport(id, {
    query: {
      enabled: !!id,
      queryKey: getGetHiringReportQueryKey(id),
    }
  });

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-destructive/10 p-4 rounded-full text-destructive mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Report Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">We couldn't load the hiring report you're looking for. It may have been deleted or doesn't exist.</p>
        <Link href="/">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const riskColors = {
    low: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    medium: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6 border-border/50">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link href="/history">
              <a className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> History</a>
            </Link>
            <span>/</span>
            <span>Report #{report.id}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-foreground flex items-center gap-3">
            {report.country}
            <Badge variant="outline" className={`ml-2 px-3 py-1 text-sm font-medium uppercase tracking-wider ${riskColors[report.riskAssessment]}`} data-testid={`badge-risk-${report.riskAssessment}`}>
              {report.riskAssessment} Risk
            </Badge>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {report.role}</div>
            <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {report.companySize}</div>
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(report.createdAt), 'MMM d, yyyy')}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="md:col-span-8 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" /> Executive Summary
            </h2>
            <div className="bg-card border border-border shadow-sm rounded-xl p-6 text-foreground/90 leading-relaxed">
              {report.summary}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-primary" /> Recommended Workflow
            </h2>
            <Card className="overflow-hidden shadow-sm border-border">
              <div className="divide-y divide-border/60">
                {report.hiringWorkflow.map((step, i) => (
                  <div key={i} className="p-5 flex items-start gap-4 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 border border-primary/20">
                      {i + 1}
                    </div>
                    <div className="pt-1 text-foreground/90">{step}</div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary" /> Compliance & Legal Notes
            </h2>
            <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl p-6 space-y-4">
              {report.complianceNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-foreground/90">{note}</p>
                </div>
              ))}
            </div>
          </section>
          
          {report.interviewProcess && report.interviewProcess.length > 0 && (
            <section>
              <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" /> Interview Process
              </h2>
              <Card className="shadow-sm border-border">
                <CardContent className="p-6 space-y-4">
                  {report.interviewProcess.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="text-foreground/90">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="md:col-span-4 space-y-6">
          
          <Card className="border-red-200 shadow-sm overflow-hidden dark:border-red-900/50">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 border-b border-red-100 dark:border-red-900/50 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-red-900 dark:text-red-300 font-display">Key Risks</h3>
            </div>
            <CardContent className="p-0">
              <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                {report.risks.map((risk, i) => (
                  <li key={i} className="p-4 text-sm text-foreground/80 flex items-start gap-3 bg-card">
                    <span className="text-red-500 shrink-0">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-sm overflow-hidden dark:border-green-900/50">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 border-b border-green-100 dark:border-green-900/50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-bold text-green-900 dark:text-green-300 font-display">Onboarding Plan</h3>
            </div>
            <CardContent className="p-0">
              <ul className="divide-y divide-green-100 dark:divide-green-900/30">
                {report.onboardingPlan.map((plan, i) => (
                  <li key={i} className="p-4 text-sm text-foreground/80 flex items-start gap-3 bg-card">
                    <div className="w-4 h-4 rounded-sm border border-green-300 dark:border-green-700 mt-0.5 shrink-0" />
                    <span>{plan}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="border-b pb-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
        <div className="md:col-span-4 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
