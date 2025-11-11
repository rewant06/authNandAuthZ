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
      logger.log("Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMsg = "An unknown error occured";
      if (isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      logger.error("Login failed", error);
      setApiError(errorMsg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <h2>Login</h2>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          style={{ width: "100%" }}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          style={{ width: "100%" }}
        />
        {apiError && <p style={{ color: "red" }}> {apiError}</p>}
      </div>

      {apiError && <p style={{ color: "red" }}>{apiError} </p>}

      <button type="submit" disabled={isSubmitting}>
        {" "}
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p>
        Need an account? <a href="/register">Register</a>
      </p>
      <p>
        <a href="/forgot-password">Forgon Password</a>
      </p>
    </form>
  );
}
