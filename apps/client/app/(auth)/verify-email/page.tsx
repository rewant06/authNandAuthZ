"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios"; // Use direct axios or your api instance
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await api.post("/auth/verify-email", { token });
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (error) {
        console.error(error);
        setStatus("error");
        toast.error("Verification failed or token expired.");
      }
    };

    verify();
  }, [token]);

  if (status === "loading") {
    return <div className="text-center">Verifying your email...</div>;
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gradient">Email Verified!</h2>
        <p className="text-muted-foreground">You can now access your account.</p>
        <Button asChild className="w-full bg-gradient-to-r from-primary to-accent">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
      <p className="text-muted-foreground">The link is invalid or has expired.</p>
      <Button asChild variant="outline">
        <Link href="/login">Back to Login</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl border border-border/50 shadow-elevated">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}