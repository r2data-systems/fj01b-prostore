'use server';

import { ShippingAddress } from '@/types/index';
import { shippingAddressSchema, signInFormSchema, signUpFormSchema, paymentMethodSchema } from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatError } from "../utils";
import { z } from 'zod';
import { PAGE_SIZE } from '../constants';


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

		return {success: false, message: formatError(error)};
	}
};

export async function getUserByID(userID: string) {
	const user = await prisma.user.findFirst({
		where: {id: userID}
	})
	if (!user) throw new Error('User NOT found');

	return user;
}

export async function updateUserAddress(data: ShippingAddress) {
	try {
		const session = await auth();

		const currentUser = await prisma.user.findFirst({
			where: {id: session?.user?.id}
		})

		if (!currentUser) {
			throw new Error('User NOT found');
		};

		const address = shippingAddressSchema.parse(data);

		await prisma.user.update({
			where: {id: currentUser.id},
			data: {address}
		});

		return {success: true, message: 'User Address Updated'};
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
	console.log('updateUserPaymentMethod data', data);

	try {
		const session = await auth();
		const currentUser = await prisma.user.findFirst({
			where: { id: session?.user?.id}
		})

		if (!currentUser) {
			throw new Error('User NOT found');
		}

		const paymentMethod = paymentMethodSchema.parse(data);
		await prisma.user.update({
			where: {id: currentUser.id},
			data: {paymentMethod: paymentMethod.type}
		});

		return {
			success: true,
			message: 'User updated successfully!'
		}
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
	
} 

// Update the user profile
export async function updateProfile(user: {name: string; email: string;}) {
	try {
		const session = await auth();

		const currentUser = await prisma.user.findFirst({
			where: { id: session?.user?.id}
		})

		if (!currentUser) { throw new Error('User NOT found'); }

		await prisma.user.update({
			where: {id: currentUser.id},
			data: {name: user.name}
		});

		return {success: true, message: 'User updated successfully'};

	} catch (error) {
		return {success: false, message: formatError(error)}
	}
}

// Get ALL users
export async function getAllUsers({
	limit = PAGE_SIZE,
	page,
}: {
	limit?: number;
	page: number;
}) {
	const data = await prisma.user.findMany({
		orderBy: {createdAt: 'desc'},
		take: limit,
		skip: (page - 1) * limit,
	});

	const dataCount = await prisma.user.count();

	return({
		data,
		totalPages: Math.ceil(dataCount / limit),
	})
}