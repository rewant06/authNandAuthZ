import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { loginUser, logoutUser } from "@/lib/auth.service";
import { User, LoginPayload, JwtPayload } from "@iam-project/types";
import { logger } from "@/lib/logger";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  _hydrate: () => void;
}

const clearState = (set: any) => {
  set({ accessToken: null, user: null, isAuthenticated: false });
  logger.log("User logged out and state cleared");
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      login: async (credentials: LoginPayload) => {
        const { accessToken, user } = await loginUser(credentials);
        const payload: JwtPayload = jwtDecode(accessToken);
        logger.log("Decode JWT Payload: ", payload);

        set({
          accessToken,
          user,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await logoutUser();
          logger.log("Server logout successful.");
        } catch (error) {
          logger.error(
            "Logout API call failed, but logging out locally.",
            error
          );
        } finally {
          clearState(set);
        }
      },

      setToken: (token: string) => {
        set({ accessToken: token });
        logger.log("Access token has been set");
      },

      _hydrate: () => {
        logger.log("AuthStore hydrated from localStorage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrate();
        }
      },
    }
  )
);
