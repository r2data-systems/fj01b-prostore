'use server';

//import { PrismaClient } from '@/lib/generated/prisma';
import {prisma} from '@/db/prisma';
import { convert2PlainObject, formatError } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import z from 'zod';

export async function getLatestProducts() {
	// Only needs to be instantiated in prisma.ts
	//const prisma = new PrismaClient();

	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: {createdAt: 'desc'},
	});

	return convert2PlainObject(data);
}

export async function getProductBySlug(slug: string) {
	return prisma.product.findFirst({
		where: {slug: slug},
	});
}

export async function getProductByID(productID: string) {
	const data = await prisma.product.findFirst({
		where: {id: productID},
	});

	console.log(`ProductID ${productID}`);
	console.dir(data?.images, { depth: null });

	return convert2PlainObject(data);
}


// Get all products
export async function getAllProducts({
	query,
	limit = PAGE_SIZE,
	page,
	category,
	price,
	rating,
	sort
}: {
	query: string;
	limit?: number;
	page: number;
	category?: string;
	price?: string;
	rating?: string;
	sort?: string;
}) {
	const data = await prisma.product.findMany({
		orderBy: {createdAt: 'desc'},
		skip: (page - 1) * limit,
		take: limit,
	});
	
	const dataCount = await prisma.product.count();

	return({
		data,
		totalPages: Math.ceil(dataCount / limit),
	})
}

// Delete an Product
export async function deleteProduct(id: string) {
	try {
		const productExists = await prisma.product.findFirst({where: {id}});

		if (!productExists) throw new Error('Product NOT found');

		await prisma.product.delete({where: {id}});

		revalidatePath('/admin/products');

		return{success: true, message: 'Product Deleted'}
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
	try {
		const product = insertProductSchema.parse(data);
		await prisma.product.create({data: product});

		revalidatePath('/admin/products');

		return {success: true, message: 'Product created successfully!'};
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
	try {
		const product = updateProductSchema.parse(data);
		//await prisma.product.create({data: product});

		const productExists = await prisma.product.findFirst({
			where: {id: product.id}
		})

		if (!productExists) throw new Error('Product NOT found');

		revalidatePath('/admin/products');

		await prisma.product.update({
			where: {id: product.id},
			data: product
		})
		return {success: true, message: 'Product updated successfully!'};
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Get ALL categories
export async function getAllCategories() {
	const data = await prisma.product.groupBy({
		by: ['category'],
		_count: true,
	});

	return data;
}

// Get featured products
export async function getFeaturedProducts() {
	const data = await prisma.product.findMany({
		where: {isFeatured: true},
		orderBy: {createdAt: 'desc'},
		take: 4,
	})
	
	return convert2PlainObject(data);
}