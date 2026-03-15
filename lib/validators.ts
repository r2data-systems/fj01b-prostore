import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => (
      /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
      "Price must have exactly two decimal places"
    )
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  category: z.string().min(3, "Category must be at least 3 characters long"),
  brand: z.string().min(3, "Brand must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
	stock: z
    .coerce
    .number<number>('Stock must be a number!')
    .int('Stock must be an integer!')
    .positive('Stock must be positive!'),
	numReviews: z
    .coerce
    .number<number>('Number of Reviews must be a number!')
    .int('Number of Reviews must be an integer!')
    .gte(0,'Number of Reviews must be positive!'),
	//images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  //isFeatured: z.boolean(),
  //banner: z.string().nullable(),
  price: currency,
});

export const testProductSchema = z.object({
  //name: z.string().min(3, "Name must be at least 3 characters"),
  //slug: z.string().min(3, "Slug must be at least 3 characters"),
  //category: z.string().min(3, "Category must be at least 3 characters"),
  //brand: z.string().min(3, "Brand must be at least 3 characters"),
  //description: z.string().min(3, "Description must be at least 3 characters"),
  //stock: z.coerce.number(), -- REPLACE with following
	stock: z
    .coerce
    .number<number>('Stock must be a number!')
    .int('Stock must be an integer!')
    .positive('Stock must be positive!'),
  //images: z.array(z.string()).min(1, "Product must have at least one image"),
  //isFeatured: z.boolean(),
  //banner: z.string().nullable(),
  //price: currency,
});

	

// schema for updating products
export const updateProductSchema = insertProductSchema.extend({
	id: z.string().min(1, 'ID is required'),
});

// schema for signing users in
export const signInFormSchema = z.object({
	email: z.email('Invalid e-mail address'),
	password: z.string().min(6, 'Invalid password length')
})

// schema for signing users up
export const signUpFormSchema = z.object({
	name: z.string().min(3, 'Name must be a least 3 characters'),
	email: z.email('Invalid e-mail address'),
	password: z.string().min(6, 'Password must be a least 6 characters'),
	confirmPassword: z.string().min(6, 'Confirm password must be a least 6 characters')
}).refine((data) => (data.password === data.confirmPassword), {
	message: "Password don't match",
	path: ['confirmPassword'],
})

// cart schemas
export const cartItemSchema = z.object({
	productID: z.string().min(1, 'Product ID required'),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	qty: z.number().int().nonnegative('Quantity must be a positive number'),
	image: z.string().min(1, 'Image is required'),
	price: currency
});

export const insertCartSchema = z.object({
	items: z.array(cartItemSchema),
	itemsPrice: currency,
	totalPrice: currency,
	shippingPrice: currency,
	taxPrice: currency,
	sessionCartID: z.string().min(1, 'Session Cart ID is required'),
	userID: z.string().optional().nullable()
});

// Schema for the shipping address
export const shippingAddressSchema = z.object({
	fullName: z.string().min(3, 'Name must be at least 3 characters'),
	streetAddress: z.string().min(3, 'Street must be at least 3 characters'),
	city: z.string().min(3, 'City must be at least 3 characters'),
	postalCode: z.string().min(3, 'Postal Code must be at least 3 characters'),
	country: z.string().min(2, 'Name must be at least 2 characters'),
	lat: z.number().optional(),
	lng: z.number().optional(),
});

// Schema for payment method
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Payment method is required'),
  })
  .refine((data) => (PAYMENT_METHODS.includes(data.type)), {
    path: ['type'],
    message: 'Invalid payment method',
  });

	// schema for inserting order
	export const insertOrderSchema = z.object({
		userID: z.string().min(1, 'User is required'),
		itemsPrice: currency,
		shippingPrice: currency,
		taxPrice: currency,
		totalPrice: currency,
		paymentMethod: z.string().refine((data) => (PAYMENT_METHODS.includes(data)), {
			message: 'Invalid payment method',
		}),
		shippingAddress: shippingAddressSchema,
	});

	// schema for inserting order items
	export const insertOrderItemSchema = z.object({
		productID: z.string(),
		slug: z.string(),
		image: z.string(),
		name: z.string(),
		price: currency,
		qty: z.number(),
	});

	export const paymentResultSchema = z.object({
		id: z.string(),
		status: z.string(),
		emailAddress: z.string(),
		pricePaid: z.string()
	})

	// Schema for updating the user profile
	export const updateProfileSchema = z.object({
		name: z.string().min(3, 'Name must be at least 3 characters'),
		email: z.string().min(3, 'Email must be at least 3 characters'),
	})