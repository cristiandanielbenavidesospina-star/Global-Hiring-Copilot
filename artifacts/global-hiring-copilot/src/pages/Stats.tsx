import { useGetHiringStats, getGetHiringStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import { Globe, Users, ShieldAlert, BarChart3, Activity } from "lucide-react";

export default function Stats() {
  const { data, isLoading, isError } = useGetHiringStats({
    query: {
      queryKey: getGetHiringStatsQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-destructive">
          <Activity className="w-10 h-10 mb-4 opacity-50" />
          <h3 className="text-xl font-bold">Failed to load insights</h3>
          <p className="opacity-80">We couldn't retrieve your analytics data right now.</p>
        </CardContent>
      </Card>
    );
  }

  if (data.totalAnalyses === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground mb-2">Insights</h1>
          <p className="text-muted-foreground text-lg">Aggregated analytics across all your hiring queries.</p>
        </div>
        <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground mb-2">Not enough data</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Run a few analyses first to start seeing aggregated trends and insights here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskData = [
    { name: "Low Risk", value: data.riskBreakdown.low, color: "hsl(142.1 76.2% 36.3%)" }, // green-600
    { name: "Medium Risk", value: data.riskBreakdown.medium, color: "hsl(37.7 92.1% 50.2%)" }, // amber-500
    { name: "High Risk", value: data.riskBreakdown.high, color: "hsl(346.8 77.2% 49.8%)" }, // red-600
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground mb-2">Insights</h1>
        <p className="text-muted-foreground text-lg">Aggregated analytics across all your hiring queries.</p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Queries</p>
              <h3 className="text-4xl font-extrabold font-display text-foreground">{data.totalAnalyses}</h3>
            </div>
            <div className="bg-primary/10 p-4 rounded-xl text-primary">
              <Activity className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Top Destination</p>
              <h3 className="text-2xl font-bold font-display text-foreground truncate max-w-[150px]">
                {data.topCountries[0]?.name || "N/A"}
              </h3>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl text-blue-600">
              <Globe className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Most Searched Role</p>
              <h3 className="text-2xl font-bold font-display text-foreground truncate max-w-[150px]">
                {data.topRoles[0]?.name || "N/A"}
              </h3>
            </div>
            <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Top Countries Bar Chart */}
        <Card className="shadow-sm border-border/60 flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Target Countries
            </CardTitle>
            <CardDescription>Most frequently evaluated regions</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCountries.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {data.topCountries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Breakdown Pie Chart */}
        <Card className="shadow-sm border-border/60 flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" /> Risk Profile
            </CardTitle>
            <CardDescription>Overall compliance risk distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry, index) => (
                      <PieCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Roles Bar Chart */}
        <Card className="shadow-sm border-border/60 lg:col-span-2">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Most Evaluated Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topRoles.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={48}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--chart-2))" />
                    <Cell fill="hsl(var(--chart-3))" />
                    <Cell fill="hsl(var(--chart-4))" />
                    <Cell fill="hsl(var(--chart-5))" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
