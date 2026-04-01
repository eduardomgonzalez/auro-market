import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN";
  }
}

type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

const DEMO_USERS: Record<string, { password: string; role: "USER" | "ADMIN" }> = {
  "admin@auro.com": { password: "admin123", role: "ADMIN" },
  "usuario@gmail.com": { password: "user123", role: "USER" },
  "invitado@auro.com": { password: "guest123", role: "USER" },
};

function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS;
  if (!envAdmins) return [];
  return envAdmins.split(",").map((e) => e.trim().toLowerCase());
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<DemoUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const demoUser = DEMO_USERS[email];
        if (demoUser && demoUser.password === password) {
          return {
            id: crypto.randomUUID(),
            name: email.split("@")[0],
            email,
            role: demoUser.role,
          };
        }

        const isGuestLogin = !email.includes("@") || email === "invitado@auro.com";
        if (isGuestLogin && password === "guest123") {
          return {
            id: crypto.randomUUID(),
            name: "Invitado",
            email: "invitado@auro.com",
            role: "USER",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id ?? token.sub;
        const email = user.email ?? token.email as string;
        
        if (isAdminEmail(email)) {
          token.role = "ADMIN";
        } else if (account?.provider === "google") {
          token.role = "USER";
        } else {
          const demoUser = DEMO_USERS[email];
          token.role = demoUser?.role || "USER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string || token.sub as string;
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
});
