import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types/models";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

// Cookie helpers
function setAuthCookie(token: string) {
  // Set cookie for 7 days (matching JWT expiry)
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `auth-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: (user, token) => {
        setAuthCookie(token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        removeAuthCookie();
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);

export function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function isAdmin(): boolean {
  const user = useAuthStore.getState().user;
  return user?.role === "admin";
}

export function isStaff(): boolean {
  const user = useAuthStore.getState().user;
  return user?.role === "admin" || user?.role === "staff";
}
