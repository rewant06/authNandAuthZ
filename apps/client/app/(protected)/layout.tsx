"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/logger";

export default function ProctectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      logger.warn(
        "Unauthenticated user access attempt to protected route. Redirecting."
      );
      router.replace("/login");
    }
  }, [isAuthenticated, router]);
  if (!isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
