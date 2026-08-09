import { getProfile } from "@/src/app/api/profile/route";
import prisma from "@/src/lib/prisma";
import AuthForm from "@/src/components/AuthForm";
import CartClient from "@/src/components/CartClient";

export default async function CartPage() {
  const user = await getProfile();

  if (user?.role !== "CUSTOMER") {
    return <AuthForm role="CUSTOMER" />;
  }

  const cart = await prisma.cart.findUnique({
    where: { customerId: user.id },
    include: {
      shop: true,
      items: { include: { product: true } }
    }
  });

  const cartItems = cart?.items || [];
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return <CartClient initialCart={cart} initialCartItems={cartItems} initialCartTotal={cartTotal} />;
}
