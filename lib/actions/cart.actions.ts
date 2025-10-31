"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convert2PlainObject, formatErrors, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate Cart Prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

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
      where: { id: item.productID },
    });

    if (!product) {
      throw new Error("Product NOT found");
    }

    if (!cart) {
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userID: userID,
        items: [item],
        sessionCartID: sessionCartID,
        ...calcPrice([item]),
      });

      //console.log(newCart);

      // Add to db
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to Cart`,
      };
    } else {
      // Check if cart includes product
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productID === item.productID
      );

      if (existItem) {
        // Check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productID === item.productID
        )!.qty = existItem.qty + 1;
      } else {
        // when item does NOT exist in cart
        // check stock
        if (product.stock < 1) throw new Error("Not enough stock");

        // Add item to the cart.items
        cart.items.push(item);
      }

      // Save to the DB
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

			return {
        success: true,
        message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
      };
    }

    // Test
    //console.log({
    //  "Session Cart ID": sessionCartID,
    //  "User ID": userID,
    //	"Item Requested": item,
    //	"Product Found": product,
    //});
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
