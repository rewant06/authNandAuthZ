"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "@/hooks/use-authorization";
import { logger } from "@/lib/logger";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { permissions } = useAuthorization();
  const canAccessAdmin = permissions.includes('MANAGE:all');

  useEffect(() => {
    if (!canAccessAdmin) {
      logger.warn("Unauthorized access attempt to admin panel.");
      router.replace("/dashboard");
    }
  }, [canAccessAdmin, router]);

  if (!canAccessAdmin) {
    return null;
  }

  return (
    <div>
      <h2 style={{ borderBottom: "2px solid black", paddingBottom: "10px" }}>
        Admin Panel
      </h2>
      {children}
    </div>
  );
}
