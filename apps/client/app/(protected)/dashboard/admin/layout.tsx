"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "@/hooks/use-authorization";
import { logger } from "@/lib/logger";
import { ShieldAlert } from "lucide-react";

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
    // Optional: Render a nice "Access Denied" skeleton while redirecting
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
            <ShieldAlert className="h-12 w-12 text-destructive opacity-50" />
            <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Admin Header - Optional, as the page usually has its own header */}
      {/* <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Administration</h2>
      </div> */}
      {children}
    </div>
  );
}