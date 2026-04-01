"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import type { UserRole } from "@/types";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: User | null = session?.user
    ? {
        id: session.user.id || "",
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as User).role || "USER",
      }
    : null;

  const login = async (email: string, role: UserRole) => {
    const result = await nextAuthSignIn("credentials", {
      email,
      password: role === "ADMIN" ? "admin123" : "user123",
      redirect: false,
    });

    if (result?.ok) {
      router.push(role === "ADMIN" ? "/admin" : "/");
      router.refresh();
    }
  };

  const logout = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
