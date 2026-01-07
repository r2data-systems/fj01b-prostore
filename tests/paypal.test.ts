import { generateAccessToken } from "../lib/paypal";

// Test to generate PayPal Token
test('generate token from PayPal ',
		async () => {
			const tokenResponse = await generateAccessToken();
			console.log(tokenResponse);
			expect(typeof tokenResponse).toBe('string');
			expect(tokenResponse.length).toBeGreaterThan(0);
		}
);
