'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserByID } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";

// Create Order and OrderItems
export async function createOrder() {
	try {
		const session = await auth();
		if(!session) throw new Error('User is NOT Authenticated');

		const cart = await getMyCart();
		const userID = session?.user?.id;
		if (!userID) throw new Error('User NOT found');

		const user = await getUserByID(userID);

		if (!cart || cart.items.length === 0) {
			return {success: false, message: 'Your cart is empty!', redirectTo: '/cart'};
		};

		if (!user.address) {
			return {success: false, message: 'No shipping address', redirectTo: '/shipping-address'};
		};

		if (!user.paymentMethod) {
			return {success: false, message: 'No payment method', redirectTo: '/payment-method'};
		};

		// Create Order object
		const order = insertOrderSchema.parse({
			userID: user.id,
			shippingAddress: user.address,
			paymentMethod: user.paymentMethod,
			itemsPrice: cart.itemsPrice,
			shippingPrice: cart.shippingPrice,
			taxPrice: cart.taxPrice,
			totalPrice: cart.totalPrice,
		});

		// Create a transaction to wrap around Order & OrderItem db object creation
		const insertedOrderID = await prisma.$transaction(async(tx) => {
			// Create Order
			const insertedOrder = await tx.order.create({data: order});

			// Create Order Item for each cart item
			for (const item of cart.items as CartItem[] ) {
				await tx.orderItem.create({
					data: {
						...item,
						price: item.price,
						orderID: insertedOrder.id,
					}
				})
			}

			// CLear items[], by updating items to an empty array
			await tx.cart.update({
				where: {id: cart.id},
				data: {
					items: [],
					totalPrice: 0,
					taxPrice: 0,
					shippingPrice: 0,
					itemsPrice: 0,
				}
			});

			return insertedOrder.id;
		});

		if (!insertedOrderID) throw new Error('Order NOT created');
		
		return {success: true, message: 'Order created successfully', redirectTo: `/order/${insertedOrderID}`}
	} catch (error) {
		if (isRedirectError(error)) throw new Error;

		return ({success: false, message: formatError(error)});
	}
}