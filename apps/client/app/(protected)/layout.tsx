"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Activity,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth.store";
import { useAuthorization } from "@/hooks/use-authorization";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { permissions } = useAuthorization();

  // Ensure permissions exist before checking
  const canAccessAdmin = permissions?.includes("MANAGE:all");

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    // Conditionally render Admin links
    ...(canAccessAdmin
      ? [
          { href: "/dashboard/admin/users", label: "Users", icon: Users },
          {
            href: "/dashboard/admin/activity-log",
            label: "Audit Logs",
            icon: Activity,
          },
        ]
      : []),
    { href: "/dashboard/profile", label: "Settings", icon: Settings },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gradient">
            Dashboard
          </h2>
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Button
                  key={link.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  asChild
                >
                  <Link href={link.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMounted, setIsMounted] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    setIsMounted(true);
    if (hasHydrated && !isAuthenticated) {
      logger.warn("Unauthenticated access to protected route. Redirecting.");
      router.replace("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);
  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Sidebar */}
      <div className="md:hidden border-b border-border p-4 flex items-center justify-between glass-effect sticky top-0 z-50">
        <div className="font-bold text-lg flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          HelpingBots
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <DashboardSidebar />
            <div className="px-4 py-4 mt-auto border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/30 min-h-screen fixed left-0 top-0 bottom-0 z-40 glass-effect">
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">HelpingBots</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardSidebar />
        </div>
        <div className="p-6 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
