import { generateAccessToken, paypal } from "../lib/paypal";

// Test to generate PayPal Token
test('generate token from PayPal ',
		async () => {
			const tokenResponse = await generateAccessToken();
			console.log(tokenResponse);

			expect(typeof tokenResponse).toBe('string');
			expect(tokenResponse.length).toBeGreaterThan(0);
		}
);

test('create a PayPal order', async () => {
	const tokenResponse = await generateAccessToken();
	const price = 10.0;
	console.log(tokenResponse);

	const orderResponse = await paypal.createOrder(price);
	console.log(orderResponse);

	expect(orderResponse).toHaveProperty('id');
	expect(orderResponse).toHaveProperty('status');
	expect(orderResponse.status).toBe('CREATED');
});

test('simulate capturing a payment from an order', async () => {
	const orderID = 'A101';

	const mockCapturePayment = jest
		.spyOn(paypal, 'capturePayment')
		.mockResolvedValue({
			status: 'COMPLETED'
		});

	const captureResponse = await paypal.capturePayment(orderID);
	expect(captureResponse).toHaveProperty('status', 'COMPLETED');

	mockCapturePayment.mockRestore();
})