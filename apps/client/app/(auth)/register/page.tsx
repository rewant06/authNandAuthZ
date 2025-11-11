"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";

import { registerSchema } from "@/lib/validators/auth.schema";
import { registerUser } from "@/lib/auth.service";
import { logger } from "@/lib/logger";
import { isAxiosError } from 'axios';

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
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
      logger.log('Registration successful.');
      setIsSuccess(true);
    } catch (error: unknown) {
      let errorMsg = 'An unknown error occurred.';
      if(isAxiosError(error)){
        errorMsg = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      logger.error('Registration failed', error);
      setApiError(errorMsg);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2> Registration Sucessful!</h2>
        <p> Please check your email to verify your account before loggin in.</p>
        <p>
          <a href="/login">Back to Login</a>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <h2> Create Account </h2>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} style={{ width: "100%" }} />
        {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
      </div>

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
        {errors.password && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}
      </div>

      <div></div>

      {apiError && <p style={{ color: "red" }}>{apiError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </form>
  );
}
