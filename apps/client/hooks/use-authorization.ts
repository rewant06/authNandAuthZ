"use client";

import { useAuthStore } from "@/store/auth.store";

interface AuthInfo {
  roles: string[];
  permissions: string[];
}

export const useAuthorization = (): AuthInfo => {
  // Direct access from store - no re-decoding needed
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);

  return {
    roles: roles || [],
    permissions: permissions || [],
  };
};