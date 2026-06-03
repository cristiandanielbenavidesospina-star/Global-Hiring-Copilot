import { useAnalyzeHiring, useGetHiringStats, getGetHiringStatsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { MapPin, Briefcase, Building2, Search, ArrowRight, Activity, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const searchSchema = z.object({
  country: z.string().min(2, "Country is required"),
  role: z.string().min(2, "Role is required"),
  companySize: z.enum(["startup", "smb", "enterprise"], {
    required_error: "Company size is required",
  }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const analyzeHiring = useAnalyzeHiring();
  
  const { data: stats, isLoading: statsLoading } = useGetHiringStats({
    query: {
      queryKey: getGetHiringStatsQueryKey()
    }
  });

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      country: "",
      role: "",
      companySize: "enterprise",
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    analyzeHiring.mutate(
      { data },
      {
        onSuccess: (report) => {
          toast({
            title: "Analysis Complete",
            description: "Hiring report generated successfully.",
          });
          setLocation(`/report/${report.id}`);
        },
        onError: () => {
          toast({
            title: "Analysis Failed",
            description: "Could not generate hiring report. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-primary-foreground p-8 md:p-12 shadow-2xl border border-primary-border">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <GlobePattern />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight mb-4">
            Evaluate global hiring <br/> opportunities with precision.
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
            Instant insights on compliance, risks, workflows, and onboarding processes for any country. Your authoritative copilot for international expansion.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm font-medium text-primary-foreground/90">
            <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" /> Compliance checks
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
              <Activity className="w-4 h-4" /> Risk assessment
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4" /> Instant workflows
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Main Search Form */}
        <Card className="md:col-span-8 shadow-md border-border/60">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
            <CardTitle className="text-2xl font-display flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> New Hiring Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Enter the target country and role to generate a comprehensive hiring report.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Target Country</FormLabel>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="e.g. Germany, Japan, Brazil" className="pl-9 h-11" {...field} data-testid="input-country" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Job Role</FormLabel>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="e.g. Senior Software Engineer" className="pl-9 h-11" {...field} data-testid="input-role" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-medium">Your Company Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                            <SelectTrigger className="pl-9 h-11" data-testid="select-company-size">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                          <SelectItem value="smb">SMB (51-500 employees)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (500+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto min-w-[200px] h-12 font-medium"
                    disabled={analyzeHiring.isPending}
                    data-testid="btn-analyze"
                  >
                    {analyzeHiring.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Generate Report <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quick Stats Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                      <p className="text-3xl font-bold text-foreground font-display mt-1">{stats?.totalAnalyses || 0}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {stats?.topCountries && stats.topCountries.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Trending Regions</p>
                      <div className="space-y-2">
                        {stats.topCountries.slice(0, 3).map((country, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{country.name}</span>
                            <span className="bg-background px-2 py-0.5 rounded text-xs border font-mono">{country.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Just a decorative SVG
function GlobePattern() {
  return (
    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
