import NextAuth from "next-auth";

import authConfig from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/knowledge/:path*",
    "/hierarchy/:path*",
    "/workflows/:path*",
    "/drafts/:path*",
    "/qa/:path*",
    "/activity/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/search/:path*",
  ],
};
