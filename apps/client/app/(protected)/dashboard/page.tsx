"use client";

import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Clock } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Safely get the role name
  const roleName = user?.roles?.[0]?.name || "User";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome back, <span className="text-primary font-semibold">{user?.name || user?.email}</span>. Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect border-border/50 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Logged in via {user?.provider || "Email"}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* FIX APPLIED HERE: Added .name */}
            <div className="text-2xl font-bold uppercase">{roleName}</div>
            <p className="text-xs text-muted-foreground">Current permission level</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50 hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-xs text-muted-foreground">Connected to protected gateway</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}