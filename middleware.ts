// middleware.ts

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - Next.js internals
     * - static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};