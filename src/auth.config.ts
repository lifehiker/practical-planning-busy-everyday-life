import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config: no Prisma adapter, no bcrypt, no Node-only
// imports. middleware.ts builds its own NextAuth instance from this so the
// edge bundle never pulls in Prisma/fs (which crashes the edge runtime).
// src/auth.ts spreads this and adds the adapter + real providers.
export default {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [],
} satisfies NextAuthConfig;
