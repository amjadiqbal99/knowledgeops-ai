import { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "claude-ops-os-dev-secret" : undefined);

const authConfig = {
  providers: [],
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized: async ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith("/login");

      if (isAuthPage) {
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
