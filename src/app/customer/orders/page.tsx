import { getProfile } from "@/src/app/api/profile/route";
import prisma from "@/src/lib/prisma";
import AuthForm from "@/src/components/AuthForm";
import OrderHistory from "@/src/components/OrderHistory";

export default async function CustomerOrdersPage() {
  const user = await getProfile();

  if (user?.role !== "CUSTOMER") {
    return <AuthForm role="CUSTOMER" />;
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { shop: true, items: true },
    orderBy: { id: "desc" }
  });

  return <OrderHistory orders={orders} />;
}
