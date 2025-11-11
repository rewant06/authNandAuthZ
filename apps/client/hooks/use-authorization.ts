"use client";

import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "@/store/auth.store";
import { JwtPayload } from "@iam-project/types";
import { logger } from "@/lib/logger";

interface AuthInfo {
  roles: string[];
  permissions: string[];
}

const emptyAuthInfo: AuthInfo = {
  roles: [],
  permissions: [],
};

export const useAuthorization = (): AuthInfo => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const authInfo = useMemo((): AuthInfo => {
    if (!accessToken) {
      return emptyAuthInfo;
    }

    try {
      const payload: JwtPayload = jwtDecode(accessToken);
      return {
        roles: payload.roles || [],
        permissions: payload.permissions || [],
      };
    } catch (error) {
      logger.error("Failed to decode JWT:", error);
      return emptyAuthInfo;
    }
  }, [accessToken]);
  return authInfo;
};
