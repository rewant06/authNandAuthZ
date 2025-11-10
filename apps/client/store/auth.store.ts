import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "@/lib/auth.service";
import { User, LoginPayload, JwtPayload } from "@iam-project/types";


interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  _hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      login: async (credentials: LoginPayload) => {
        const { accessToken, user } = await loginUser(credentials);
        const payload: JwtPayload = jwtDecode(accessToken);
        console.log("Decode JWT Payload: ", payload);

        set({
          accessToken,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ accessToken: null, user: null, isAuthenticated: false });
        console.log("User logged out");
      },

      setToken: (token: string) => {
        set({ accessToken: token });
      },

      _hydrate: () => {
        console.log("AuthStore hydrated from localStorage");
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
