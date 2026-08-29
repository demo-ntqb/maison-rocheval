import "server-only";

import { cookies } from "next/headers";

const CART_COOKIE = "mr_cart";

export async function getCartId(): Promise<string | null> {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  if (!value) return null;

  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export async function setCartId(cartId: string): Promise<void> {
  (await cookies()).set({
    name: CART_COOKIE,
    value: encodeURIComponent(cartId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearCartId(): Promise<void> {
  (await cookies()).set({
    name: CART_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
