import { getProfile } from "@/src/app/api/profile/route";
import prisma from "@/src/lib/prisma";
import AuthForm from "@/src/components/AuthForm";
import VendorWorkspace from "@/src/components/VendorWorkspace";

export default async function VendorPage() {
  const user = await getProfile();

  if (user?.role !== "VENDOR") {
    return <AuthForm role="VENDOR" />;
  }

  const shop = await prisma.shop.findUnique({
    where: { vendorId: user.id }
  });

  const products = shop
    ? await prisma.product.findMany({
        where: { shopId: shop.id },
        orderBy: { id: "desc" }
      })
    : [];

  return <VendorWorkspace initialShop={shop} initialProducts={products} />;
}
