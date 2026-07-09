// auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts-edge";
import { cookies } from "next/headers";

import { prisma } from "@/db/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  /**
   * Override the placeholder provider defined in auth.config.ts.
   * This provider is only executed in the Node runtime, so Prisma
   * is safe to use here.
   */
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatches = compareSync(
          credentials.password as string,
          user.password
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Keep the Edge-safe callbacks (authorized)
     */
    ...authConfig.callbacks,

    /**
     * Session callback
     */
    async session({ session, token, trigger, user }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.name = token.name!;
      }

      if (trigger === "update" && user?.name) {
        session.user.name = user.name;
      }

      return session;
    },

    /**
     * JWT callback
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        /**
         * Replace default NO_NAME with email prefix.
         */
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }

        /**
         * Merge anonymous cart into user cart after login.
         */
        if (trigger === "signIn" || trigger === "signUp") {
          const cookieStore = await cookies();

          const sessionCartID =
            cookieStore.get("sessionCartID")?.value;

          if (sessionCartID) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartID,
              },
            });

            if (sessionCart) {
              /**
               * Remove any existing user cart.
               */
              await prisma.cart.deleteMany({
                where: {
                  userID: user.id,
                },
              });

              /**
               * Assign guest cart to authenticated user.
               */
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: {
                  userID: user.id,
                },
              });
            }
          }
        }
      }

      /**
       * Persist profile updates.
       */
      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },
  },
});