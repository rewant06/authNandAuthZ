"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth.service";
import { forgotPasswordSchema } from "@/lib/validators/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await requestPasswordReset(data); // <--- Use Real Service
      setIsSuccess(true);
      toast.success("Reset link sent!");
    } catch (error) {
      // Security Best Practice: Don't reveal if email exists or not,
      // but for dev we log it.
      console.error(error);
      toast.success("If an account exists, a link has been sent.");
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          If an account exists with that email, we have sent a password reset
          link.
        </p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/login")}
        >
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          className="bg-background/50"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-accent"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        <div className="glass-effect p-8 rounded-2xl border border-border/50 shadow-elevated animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Forgot Password
          </h1>
          <p className="text-muted-foreground mb-6">Enter your email to receive a reset link</p>

          <Suspense
            fallback={<div className="text-center p-4">Loading...</div>}
          >
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
