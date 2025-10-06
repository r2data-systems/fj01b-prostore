'use server';

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatErrors } from "../utils";

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
	try {
		const user = signInFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password'),
		})

		await signIn('credentials', user);

		return { success: true, message: 'Signed In successfully'};
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}

		return {success: false, message: 'Invalid email or password entered'}
	}
}

// Sign out user
export async function signOutUser() {
	await signOut();
}

// Sign up user
// this will use the actionState hook, parameters reflect this
export async function signUpUser(prevState: unknown, formData: FormData) {
	const fnString = 'signUpUser';

	try {
		console.log(`${fnString};Start`);

		const user = signUpFormSchema.parse({
			name: formData.get('name'),
			email: formData.get('email'),
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword'),
		});

		const plainPassword = user.password;
		user.password = hashSync(user.password, 10);

		console.log(`${fnString};PRE User Create`);

		await prisma.user.create({
			data: {
				name: user.name,
				email: user.email,
				password: user.password 
			},
		})

		console.log(`${fnString};POST User Create`);

		await signIn('credentials', {
			email: user.email,
			password: plainPassword,
		})

		return{success: true, message: 'User registered successfully'};

	} catch (error) {
		console.log(error);

		if (isRedirectError(error)) {
			throw error;
		}

		return {success: false, message: formatErrors(error)};
	}
};
