'use server';

//import { PrismaClient } from '@/lib/generated/prisma';
import {prisma} from '@/db/prisma';
import { convert2PlainObject } from '../utils';
import { LATEST_PRODUCTS_LIMIT } from '../constants';

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