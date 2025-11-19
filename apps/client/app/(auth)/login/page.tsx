"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { loginSchema } from "@/lib/validators/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/logger";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setApiError(null);
    try {
      await login(data);
      toast.success("Welcome back!");
      logger.log("Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMsg = "An unknown error occured";
      if (isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast.error(error.message || "Invalid credentials");
      logger.error("Login failed", error);
      setApiError(errorMsg);
    }
  };


  return (

    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-effect p-8 rounded-2x1">
          <h1 className="text-3x1 font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-6"> Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                style={{ width: "100%" }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <a
                className="text-primary hover:underline"
                href="/forgot-password"
              >
                Forgon Password
              </a>
            </div>
            <Button variant="destructive" type="submit" className="w-full" disabled={isSubmitting}>
              {" "}
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>

    </div>
    
  );
}
