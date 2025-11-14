"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR, { useSWRConfig } from "swr";
import { isAxiosError } from "axios";

import { getSelf } from "@/lib/auth.service";
import { updateSelf } from "@/lib/user.service";
import {
  updateProfileSchema,
  UpdateProfileInputs,
} from "@/lib/validators/user.schema";
import { User } from "@iam-project/types";
import { logger } from "@/lib/logger";

const fetcher = () => getSelf();

export default function ProfilePage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: user, error, isLoading } = useSWR<User>("/auth/me", fetcher);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInputs>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name || "" });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<UpdateProfileInputs> = async (data) => {
    setApiError(null);
    setIsSuccess(false);

    try {
      const updatedUser = await updateSelf(data);
      mutate("/auth/me", updatedUser, false);

      setIsSuccess(true);
      logger.log("Profile updated successfully.");
    } catch (err: unknown) {
      let errorMsg = "An unknown error occured";
      if (isAxiosError(err)) {
        errorMsg = err.response?.data?.message || err.message;
      }
      logger.error("Profile update failed", err);
      setApiError(errorMsg);
    }
  };

  if (isLoading) return <div> Loading profile...</div>;
  if (error) return <div> Failed to load profile.</div>;

  return (
    <div style={{ maxWidth: "500px" }}>
      <h1> Your Profile</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label htmlFor="email">Email (read-only)</label>
          <input
            id="email"
            type="email"
            value={user?.email || "N/A"}
            disabled
            style={{ width: "100%", background: "#e4e2eeff", color:'black' }}
          />
        </div>

        <div>
          <label htmlFor="name">Name</label>
          <input id="name" {...register("name")} style={{ width: "100%", background:'rgba(229, 241, 235, 1)', color: 'black' }} />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        {apiError && <p style={{ color: "red" }}> {apiError}</p>}
        {isSuccess && <p style={{ color: "green" }}> Profile updated!</p>}

        <button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
