// auth.config.ts

import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Placeholder provider.
   *
   * The real Credentials provider (with Prisma database lookup)
   * is defined in auth.ts.
   *
   * A provider must still exist here so middleware can initialise
   * NextAuth without importing Prisma.
   */
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize() {
        return null;
      },
    }),
  ],

  callbacks: {
    authorized({ request, auth }) {
      // Protected routes
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      const { pathname } = request.nextUrl;

      // User must be authenticated
      if (!auth && protectedPaths.some((p) => p.test(pathname))) {
        return false;
      }

      // Ensure every visitor has a session cart cookie
      if (!request.cookies.get("sessionCartID")) {
        const sessionCartID = crypto.randomUUID();

        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        response.cookies.set("sessionCartID", sessionCartID);

        return response;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;