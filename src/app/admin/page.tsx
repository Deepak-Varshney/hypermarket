import { getProfile } from "@/src/app/api/profile/route";
import prisma from "@/src/lib/prisma";
import AuthForm from "@/src/components/AuthForm";
import VendorManagement from "@/src/components/VendorManagement";
import AdminOrdersList from "@/src/components/AdminOrdersList";

export default async function AdminPage() {
  const user = await getProfile();

  if (user?.role !== "ADMIN") {
    return <AuthForm role="ADMIN" />;
  }

  const vendors = await prisma.user.findMany({
    where: { role: "VENDOR" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      shops: true
    },
    orderBy: { id: "desc" }
  });

  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      shop: { select: { id: true, name: true, address: true } },
      items: true
    },
    orderBy: { id: "desc" }
  });

  return (
    <div className="space-y-6">
      <VendorManagement vendors={vendors} />
      <AdminOrdersList orders={orders} />
    </div>
  );
}
