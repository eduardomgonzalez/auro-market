"use client";

import { SessionProvider } from "next-auth/react";
import type { SessionProviderProps } from "next-auth/react";

export function NextAuthProvider({ children, session }: SessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
