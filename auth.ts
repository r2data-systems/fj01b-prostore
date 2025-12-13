import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import {PrismaAdapter} from '@auth/prisma-adapter';
import {prisma} from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';

//-------------------------------------------------
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
//import { compare } from './lib/encrypt';

export const { handlers, auth, signIn, signOut } = NextAuth({
	pages: {
		signIn: '/sign-in',
		error: '/sign-in'
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			credentials: {
				email: { type: 'email' },
				password: { type: 'password' }
			},
			async authorize(credentials) {
				if (credentials === null) return null;

				// Find user in database
				const user = await prisma.user.findFirst({
					where: {
						email: credentials.email as string
					}
				});

				// Check if user exists and password matches 
				if (user && user.password) {
					const isMatch = compareSync(credentials.password as string, user.password);

					if (isMatch) {
						return {
							id: user.id,
							name: user.name,
							email: user.email,
							role: user.role
						}
					}
				}

				// If user does not exist or password does not match
				return null;
			}
		})
	],
	callbacks: {
		...authConfig.callbacks,
		async session({ session, user, trigger, token }) {
			// set the user ID from token
			session.user.id = token.sub;
			session.user.role = token.role;
			session.user.name = token.name;

			//console.log(token);

			// if there is an update, set the user name
			if (trigger === 'update') {
				session.user.name = user.name;
			}

      return session
    },
		//session: async ({ session, user, trigger, token }) => {
    //  if (session?.user) {
    //    // set the user ID from token
    //    session.user.id = token.sub;
    //  };

    //  // if there is an update, set the user name
    //  if (trigger === "update") {
    //    session.user.name = user.name;
    //  }
    //  return session;
    //},

		// different order of parameters
		async jwt({ token, user, trigger }) {
			// Assign user fields to token
			if (user) {
				token.id = user.id;
				token.role = user.role;

				// If user has no name; then use first part of email
				if (user.name === 'NO_NAME') {
					token.name = user.email!.split('@')[0];

					// Update DB to reflect the token name
					await prisma.user.update({
						where: {id: user.id},
						data: {name: token.name}
					});
				}

				// Persist session cart
				if (trigger === 'signIn' || trigger === 'signUp') {
					const cookiesObject = await cookies();
					const sessionCartID = cookiesObject.get('sessionCartID')?.value;

					if (sessionCartID) {
						const sessionCart = await prisma.cart.findFirst({
							where: {sessionCartID}
						})

						if (sessionCart) {
							// Delete current user cart
							await prisma.cart.deleteMany({
								where: {userID: user.id}
							});

							// Assign new cart to user
							await prisma.cart.update({
								where: {id: sessionCart.id},
								data: {userID: user.id}
							})
						};
					};
				};
			};
			return token;
		},
		authorized({request, auth}: any) {
			// Create an array of regex patterns which define the protected paths
			const protectedPaths = [
				/\/shipping-address/,
				/\/payment-method/,
				/\/place-order/,
				/\/profile/,
				/\/user\/(.*)/,
				/\/order\/(.*)/,
				/\/admin/,
			];

			// Get pathname from request URL object.
			//console.log(request.nextUrl);
			const {pathname} = request.nextUrl;

			// Check if user is NOT authenticated and accessing a protected path
			// !auth; user is logged in as a guest
			if (!auth && protectedPaths.some((p) => (p.test(pathname)))) {return false};

			// Check for session cart cookie
			if (!request.cookies.get('sessionCartID')) {
				// Generate new session Cart ID cookie
				const sessionCartID = crypto.randomUUID();

				// Test
				//console.log(sessionCartID);

				// Clone the request headers
				const newRequestHeaders = new Headers(request.headers)

				// Create response and add the new headers
				const response = NextResponse.next({
					request: {
						headers: newRequestHeaders
					}
				})

				// now add the sessionCartID to the response cookie
				response.cookies.set('sessionCartID', sessionCartID);

				return response;
			}
			else {
				return true;
			};
		},
	}
});

//export const {handlers, auth, signIn, signOut} = NextAuth(config);
