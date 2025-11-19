import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { loginUser, logoutUser } from "@/lib/auth.service";
import { User, LoginPayload, JwtPayload } from "@iam-project/types";
import { logger } from "@/lib/logger";
import { permission } from "process";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  roles: string[];

  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearAuth: () => void;
  _hydrate: () => void;
}

const clearState = (set: any) => {
  set({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    permissions: [],
    roles: [],
  });
  logger.log("User logged out and state cleared");
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],

      login: async (credentials: LoginPayload) => {
        try {
          const { accessToken, user } = await loginUser(credentials);
          const payload = jwtDecode<JwtPayload>(accessToken);

          set({
            accessToken,
            user,
            isAuthenticated: true,
            permissions: payload.permissions || [],
            roles: payload.roles || [],
          });

          logger.log("Login successful. User:", user.email);
        } catch (error) {
          logger.error("Login flow failed", error);
          throw error; // Re-throw for UI to handle
        }
      },

      logout: async () => {
        try {
          await logoutUser();
        } catch (error: unknown) {
          logger.warn("Logout API call failed", error);
        } finally {
          clearState(set);
        }
      },

      clearAuth: () => {
        clearState(set);
      },

      setToken: (token: string) => {
        try {
          const payload = jwtDecode<JwtPayload>(token);
          set({
            accessToken: token,
            permissions: payload.permissions || [],
            roles: payload.roles || [],
          });
        } catch (e) {
          logger.error("Failed to decode token during refresh", e);
        }
      },

      _hydrate: () => {
        const state = get();
        logger.log("AuthStore hydrated from localStorage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
          state?._hydrate();
        
      },
    }
  )
);
