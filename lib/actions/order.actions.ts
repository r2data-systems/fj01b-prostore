'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convert2PlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserByID } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

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
		if (isRedirectError(error)) throw new Error('createOrder; redirect error');

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
		console.log('ORDER;',order?.paymentResult);

		if (order) {
			// Create paypal order
			const paypalOrder = await paypal.createOrder(Number(order.totalPrice))
			console.log('paypal.createOrder');

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

			//console.log('prisma_order_result', prisma_order_result);
			return {
				success: true,
				message: 'Item order created successfully',
				data: paypalOrder.id
			}

		} else {
			console.log('prisma_order_result; FAILED');
			throw new Error('Order NOT found');
		};

	} catch (error) {
		return {success: false, message: formatError(error)}
	}
}

// Approval PayPal Order and update order to paid
// updates db with paidAt and paymentResult
export async function approvePayPalOrder(
  orderID: string,
  data: { orderID: string }
) {
	//console.log('order.actions.ts-approvePayPalOrder', orderID, data);
	console.log('order.actions.ts-approvePayPalOrder');

  try {
    // get order from db
    const order = await prisma.order.findFirst({
      where: { id: orderID },
    });

		console.log('order', order)
		if (!order) {throw new Error('Order NOT found')};

		console.log('captureData', data.orderID)
		const captureData = await paypal.capturePayment(data.orderID);
		console.log('captureData', captureData.status);
		
		if (
			!captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
			captureData.status !== 'COMPLETED'
    ) {
			console.log('captureData Error');
			throw new Error('Error in PayPal payment');
    }
		
		console.log('PRE-updateOrder2Paid');
		// Update Order to PAID
		await updateOrder2Paid({
			orderID, 
			paymentResult:{
				id: captureData.id,
				status: captureData.status,
				emailAddress: captureData.payer.email_address,
				pricePaid: captureData.purchase_units[0]?.payments.captures[0]?.amount?.value
			}})
			
		console.log('POST-updateOrder2Paid');

		revalidatePath(`/order/${orderID}`);

		return {
			success: true,
			message: 'Your order has been paid'
		}
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update Order to paid
async function updateOrder2Paid({
	orderID,
	paymentResult
}: {
	orderID: string;
	paymentResult?: PaymentResult
}) {
  // get order from db
  const order = await prisma.order.findFirst({
    where: { id: orderID },
		include: { orderitems: true }
  });

	if (!order) {throw new Error('Order NOT found')};

	if (order.isPaid) {throw new Error('Order is already paid')};

	// trx to update order and adjust product stock numbers
	await prisma.$transaction ( async (tx) => {
		// Iterate over products and update stock
		for (const item of order.orderitems) {
			await tx.product.update({
				where: { id: item.productID },
				data: { stock: { increment: -item.qty }}
			})
		}

		// set the order tp paid
		await tx.order.update({
			where: { id: orderID },
			data: {isPaid: true, paidAt: new Date(), paymentResult }
		})
	})

	// Get updated order after trax
	const updatedOrder = await prisma.order.findFirst({
		where: {id: orderID},
		include: { 
			orderitems: true,
			user: { select: { name: true, email: true}}
		}
	})

	if (!updatedOrder) throw new Error('Order NOT found');
}

// Get users Orders
export async function getMyOrders(
	{ limit = PAGE_SIZE,
		page,
	}: {
		limit?: number;
		page: number;
	}
) {
	const session = await auth();
	if (!session) throw new Error('User NOT Authorized');

	const data = await prisma.order.findMany({
		where: {userID: session?.user?.id },
		orderBy: {createdAt: 'desc'},
		take: limit,
		skip: (page-1)*limit,
	});

	const dataCount = await prisma.order.count({
		where: {userID: session?.user?.id },
	});

	return ({
		data,
		totalPages: Math.ceil(dataCount/limit),
	})
}

type SalesDataType = {
	month: string;
	totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
	// get counts for each resource
	const ordersCount = await prisma.order.count();
	const productsCount = await prisma.product.count();
	const usersCount = await prisma.user.count();

	// calculate the total sales
	const totalSales = await prisma.order.aggregate({
		_sum: {totalPrice: true}
	})

	// get monthly sales
	// $queryRaw is used to allow raw SQL
	const salesDataRaw = await prisma.$queryRaw<Array<{month: string; totalSales: Prisma.Decimal}>>
		`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

	const salesData:SalesDataType = salesDataRaw.map((entry) => ({
		month: entry.month,
		totalSales: Number(entry.totalSales),
	}))

	// get latest sales
	const latestSales = await prisma.order.findMany({
		orderBy: {createdAt: 'desc'},
		include: {user: {select: {name: true} },},
		take: 6,
	})

	return {
		ordersCount,
		productsCount,
		usersCount,
		totalSales,
		latestSales,
		salesData,
	};
}

// Get ALL orders
export async function getAllOrders({
	limit = PAGE_SIZE,
	page
}: {
	limit?: number;
	page: number;
}) {
	const data = await prisma.order.findMany({
		orderBy: {createdAt: 'desc'},
		take: limit,
		skip: (page - 1)*limit,
		include: {user: {select: {name: true}}}
	});

	const dataCount = await prisma.order.count();

	return {
		data,
		totalPages: Math.ceil(dataCount/limit),
	}
}

// Delete an Order
export async function deleteOrder(id: string) {
	try {
		await prisma.order.delete({where: {id}});

		revalidatePath('/admin/orders');

		return{success: true, message: 'Order Deleted'}
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Update COD order to paid
export async function updateOrder2PaidCOD(orderID: string) {
	try {
		await updateOrder2Paid({orderID: orderID});

		revalidatePath(`/order/${orderID}`);

		return({success: true, message: 'Order marked as paid!'});
	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}

// Update COD order to delivered
export async function deliverOrder(orderID: string) {
	try {
		const order = prisma.order.findFirst({where: {id: orderID}})

		if (!order) throw new Error('Order NOT found!');

		if (!order.isPaid) throw new Error('Order is NOT paid');

		await prisma.order.update({
			where: {id: orderID},
			data: {
				isDelivered: true,
				deliveredAt: new Date(),
			},
		});

		revalidatePath(`/order/${orderID}`);

		return({success: true, message: 'Order has been marked as delivered!'});

	} catch (error) {
		return {success: false, message: formatError(error)};
	}
}