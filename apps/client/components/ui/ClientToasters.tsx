// apps/client/components/ui/ClientToasters.tsx
"use client";

import React from "react";
/**
 * Use the exact UI wrappers you already have in the repo:
 * - Radix-style toast UI in apps/client/components/ui/toast.tsx
 * - Sonner wrapper in apps/client/components/ui/sonner.tsx
 *
 * This file is a CLIENT component (has "use client") so it can use browser-only libs.
 */

import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export default function ClientToasters() {
  return (
    <>
      {/* Radix Toast provider + viewport (your toast.tsx exports these) */}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>

      {/* Sonner-based toaster (your sonner.tsx exports Toaster) */}
      <SonnerToaster />
    </>
  );
}
