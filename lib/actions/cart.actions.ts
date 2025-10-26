"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convert2PlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

export async function addItemToCart(data: CartItem) {
  try {
    // Check for cart
    const sessionCartID = (await cookies()).get("sessionCartID")?.value;

    if (!sessionCartID) {
      throw new Error("Cart session NOT found!");
    }

    // Get session and User ID
    const session = await auth();
    const userID = session?.user?.id ? (session.user.id as string) : undefined;

		// Get cart
		const cart = await getMyCart();

		// Parse and validate item
		const item = cartItemSchema.parse(data);

		// Find product in database
		const product = await prisma.product.findFirst({
			where: {id: item.productID}
		});

    // Test
    console.log({
      "Session Cart ID": sessionCartID,
      "User ID": userID,
			"Item Requested": item,
			"Product Found": product
    });
    return {
      success: true,
      message: "Item added to Cart",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

export async function getMyCart() {
  // Check for cart
  const sessionCartID = (await cookies()).get("sessionCartID")?.value;

  if (!sessionCartID) {
    throw new Error("Cart session NOT found!");
  }

  // Get session and User ID
  const session = await auth();
  const userID = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from DB (8:41)
  const cart = await prisma.cart.findFirst({
    where: userID ? { userID: userID } : { sessionCartID: sessionCartID },
  });

  if (!cart) {
    return undefined;
  }

  // Convert decimals and return
  return convert2PlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
