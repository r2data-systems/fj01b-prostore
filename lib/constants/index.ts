import { shippingAddressSchema } from '@/lib/validators';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Prostore';
export const APP_DESC = process.env.NEXT_PUBLIC_APP_DESC || 'A modern e-commerce site';
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
	email: 'admin@example.com',
	password: ''
};

export const signUpDefaultValues = {
	name: 'John Doe',
	email: 'admin@example.com',
	password: '',
	confirmPassword: ''
};

export const shippingAddressValues = {
	fullName: 'John Doe',
	streetAddress: '123 High Street',
	city: 'Anytown',
	postalCode: 'LU3 7XT',
	country: 'UK'
}