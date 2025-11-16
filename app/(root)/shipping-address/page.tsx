import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ShippingAddress } from "@/types";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserByID } from "@/lib/actions/user.actions";

export const metadata: Metadata = {
	title: 'Shipping Address',
};

const ShippingAddressPage = async () => {
	const cart = await getMyCart();
	if (!cart || cart.items.length === 0) {
		redirect('/cart');
	}

	const session = await auth();
	const userID = session?.user?.id;

	if (!userID) {
		throw new Error ('User ID NOT found');
	}

	const user = await getUserByID(userID);
	
	return (<>Address</>);
}
 
export default ShippingAddressPage;