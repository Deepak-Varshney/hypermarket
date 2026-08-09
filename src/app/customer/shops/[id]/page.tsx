import { getProfile } from "@/src/app/api/profile/route";
import prisma from "@/src/lib/prisma";
import Link from "next/link";
import AuthForm from "@/src/components/AuthForm";
import ShopCatalogueView from "@/src/components/ShopCatalogueView";
import { notFound } from "next/navigation";

export default async function SingleShopPage({
  params
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const user = await getProfile();

  if (user?.role !== "CUSTOMER") {
    return <AuthForm role="CUSTOMER" />;
  }

  const resolvedParams = await params;
  const shopId = parseInt(resolvedParams.id);
  if (isNaN(shopId)) notFound();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      vendor: { select: { name: true, email: true } },
      products: { where: { isAvailable: true }, orderBy: { id: "desc" } }
    }
  });

  if (!shop || shop.status !== "APPROVED") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/customer" className="text-sm font-medium text-blue-600 hover:underline inline-block">
        ← Back to Customer Portal
      </Link>

      <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{shop.name}</h2>
            <p className="text-sm text-gray-600 mt-1">📍 {shop.address}</p>
            {shop.description && <p className="text-xs text-gray-500 mt-2">{shop.description}</p>}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-green-100 text-green-800 border border-green-200">
            APPROVED STORE
          </span>
        </div>
      </div>

      <ShopCatalogueView products={shop.products} />
    </div>
  );
}
