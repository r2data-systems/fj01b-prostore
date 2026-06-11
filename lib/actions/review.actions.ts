'use server';

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create & Update Review Action
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
	try {
		const session = await auth();
		if (!session) throw new Error('User NOT Authenticated');

		// validate and store the review
		const review = insertReviewSchema.parse({
			...data,
			userID: session?.user?.id,
		})

		// get the details of product being reviewed
		const product = await prisma.product.findFirst({
			where: {id: review.productID}
		});
		if (!product) throw new Error('Product NOT found');

		//Check if product already reviewed by user
		const reviewExists = await prisma.review.findFirst({
			where: {productID: review.productID, userID: review.userID}
		});

		await prisma.$transaction(async (tx) => {
			if (reviewExists) {
				// Update review
				await tx.review.update({
					where: {id: reviewExists.id},
					data: {
						title: review.title,
						description: review.description,
						rating: review.rating
					}
				})

			} else {
				// Create Review
				await tx.review.create({ data: review });
			}

			// Get average rating
			const averageRating = await tx.review.aggregate({
				_avg: { rating: true },
				where: { productID: review.productID }
			});

			// Get number of reviews
			const numberReviews = await tx.review.count({
				where: {productID: review.productID}
			});

			// Update the rating and numReviews fields in Product table
			await tx.product.update({
				where: {id: review.productID},
				data: {
					numReviews: numberReviews,
					rating: averageRating._avg.rating || 0}
			});
		});

		revalidatePath(`/product/${product.slug}`);

		return {
			success: true,
			message: 'Review Updated Successfully'
		}
	} catch (error) {
		return({success: false, message: formatError(error)})
	}
}