"use client";

import React from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { registerSchema } from "@/lib/validators/auth.schema";
import { registerUser } from "@/lib/auth.service";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setApiError(null);
    setIsSuccess(false);
    try {
      await registerUser(data);
      logger.log("Registration successful.");
      toast.success("Account created successfully!");
      setIsSuccess(true);
    } catch (error: unknown) {
      let errorMsg = "An unknown error occurred.";
      if (isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      logger.error("Registration failed", error);
      toast.error(errorMsg);
      setApiError(errorMsg);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md text-center glass-effect p-8 rounded-2xl animate-fade-in">
          <div className="mb-4 inline-flex p-4 rounded-full bg-primary/10 text-primary">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-4">
            Registration Successful!
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Please check your email to verify your account before logging in.
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        <div className="glass-effect p-8 rounded-2xl border border-border/50 shadow-elevated animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-6">Join us today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                className="bg-background/50 border-primary/20 focus:border-primary transition-colors"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-background/50 border-primary/20 focus:border-primary transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-background/50 border-primary/20 focus:border-primary transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-primary/25"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
