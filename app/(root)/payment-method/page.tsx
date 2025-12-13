import { Metadata } from "next";
import { auth } from "@/auth";
import { getUserByID } from "@/lib/actions/user.actions";
import PaymentMethodForm from "./payment-method-form";
import CheckoutSteps from "@/components/shared/checkout-steps";

export const metadata: Metadata = {
	title: 'Select Payment Method',
};

const PaymentMethodPage = async () => {
	const session = await auth();
	const userID = session?.user?.id;

	if (!userID) { throw new Error('User NOT found!')};

	const user = await getUserByID(userID);
	console.log('user',user);
	//console.log(user);
	
	return ( <>
		<CheckoutSteps current={2}/>
		<PaymentMethodForm preferredPaymentMethod={user.paymentMethod}/>
	</> );
}
 
export default PaymentMethodPage;