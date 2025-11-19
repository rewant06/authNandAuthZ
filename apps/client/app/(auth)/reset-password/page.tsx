"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Note: Ensure authAPI is available in your lib or replace with auth service
// import { authAPI } from "@/lib/auth-api";

// Placeholder function if you don't have the service ready yet
const resetPasswordApi = async (token: string, pass: string) => {
  // Replace this with actual API call
  console.log("Resetting", token, pass);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link");
      router.push("/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!token) return;

    setIsLoading(true);

    try {
      await resetPasswordApi(token, password);
      toast.success("Password reset successful! Please sign in.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="bg-background/50 border-primary/20 focus:border-primary transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="bg-background/50 border-primary/20 focus:border-primary transition-colors"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        <div className="glass-effect p-8 rounded-2xl border border-border/50 shadow-elevated animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground mb-6">Enter your new password</p>

          <Suspense
            fallback={<div className="text-center p-4">Loading...</div>}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
