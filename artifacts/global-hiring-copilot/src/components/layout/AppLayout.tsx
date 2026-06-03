import { Link, useLocation } from "wouter";
import { Globe, LayoutDashboard, History, BarChart3, BriefcaseBusiness, ShieldAlert, BadgeCheck } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "History", href: "/history", icon: History },
    { name: "Insights", href: "/stats", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-sidebar border-r border-sidebar-border shadow-xl">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-sidebar-primary-foreground font-display font-bold text-lg">
            <div className="bg-primary/20 p-1.5 rounded-md text-sidebar-primary-foreground border border-sidebar-primary/30">
              <Globe className="h-5 w-5" />
            </div>
            Global Hiring Copilot
          </div>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto pt-6 px-4">
          <div className="space-y-1 mb-8">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-auto pb-6">
            <div className="bg-sidebar-accent/30 rounded-lg p-4 border border-sidebar-border">
              <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground mb-1">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                <span>Powered by AI</span>
              </div>
              <p className="text-[11px] text-sidebar-foreground/70">
                Evaluating global opportunities with enterprise-grade precision.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64 w-full">
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
