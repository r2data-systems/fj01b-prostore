'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convert2PlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserByID } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { paypal } from "../paypal";

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

// Get order by ID
export async function getOrderByID(orderID: string) {
	const data = await prisma.order.findFirst({
    where: { id: orderID },
    include: { orderitems: true,
			user: {select: {email: true, name: true}}
		 },
  });
	
	return convert2PlainObject(data);
}

// create new PayPal order
export async function createPayPalOrder(orderID: string) {
	try {
		// get order from db
		const order = await prisma.order.findFirst({
			where: {id: orderID}
		});

		if (order) {
			// Create paypal order
			const paypalOrder = await paypal.createOrder(Number(order.totalPrice))

			// Update order with paypal order id
			await prisma.order.update({
				where: {id: orderID},
				data: {
					paymentResult: {
						id: paypalOrder.id,
						email_address: '',
						status: '',
						pricePaid: 0
					}
				}
			})

			return {
				success: true,
				message: 'Item order created successfully',
				data: paypalOrder.id
			}

		} else {
			throw new Error('Order NOT found');
		};

	} catch (error) {
		return {success: false, message: formatError(error)}
	}
}