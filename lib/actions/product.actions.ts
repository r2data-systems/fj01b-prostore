'use server';

//import { PrismaClient } from '@/lib/generated/prisma';
import {prisma} from '@/db/prisma';
import { convert2PlainObject } from '../utils';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';

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

// Get all products
export async function getAllProducts({
	query,
	limit = PAGE_SIZE,
	page,
	category
}: {
	query: string;
	limit?: number;
	page: number;
	category?: string;
}) {
	const data = await prisma.product.findMany({
		skip: (page - 1) * limit,
		take: limit,
	});
	
	const dataCount = await prisma.product.count();

	return({
		data,
		totalPages: Math.ceil(dataCount / limit),
	})
}