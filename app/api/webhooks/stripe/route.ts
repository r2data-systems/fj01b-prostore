import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { updateOrder2Paid } from "@/lib/actions/order.actions";

// define POST handler for Stripe webhook
export async function POST(req: NextRequest) {

	// Build the webhook event
	const event = await Stripe.webhooks.constructEvent(
		await req.text(),
		req.headers.get('stripe-signature') as string,
		process.env.STRIPE_WEBHOOK_SECRET as string,
	);

	// Check for successful payment
	if (event.type === 'charge.succeeded') {
		const { object } = event.data;

		console.log('STRIPE CHARGE:', {
				id: object.id,
				metadata: object.metadata,
				payment_intent: object.payment_intent,
				amount: object.amount,
				billing_email: object.billing_details?.email,
		});

		// Update order status
		await updateOrder2Paid({
			orderID: object.metadata.orderID,
			paymentResult: {
				id: object.id,
				status: 'COMPLETED',
				emailAddress: object.billing_details.email!,
				pricePaid: (object.amount / 100).toFixed(),
			},
		});

		return NextResponse.json({
			message: 'updateOrder2Paid was successful'
		});
	}

	return NextResponse.json({
		message: 'event not charge.succeeded'
	});
}