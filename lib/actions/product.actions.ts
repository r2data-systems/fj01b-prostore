'use server';

import { PrismaClient } from '@/lib/generated/prisma';
import { convert2PlainObject } from '../utils';
import { LATEST_PRODUCTS_LIMIT } from '../constants';

export async function getLatestProducts() {
	const prisma = new PrismaClient();

	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: {createdAt: 'desc'},
	});

	return convert2PlainObject(data);
}