import { getProfile } from "@/src/app/api/profile/route";
import { calculateDistance } from "@/src/lib/distance";
import prisma from "@/src/lib/prisma";
import AuthForm from "@/src/components/AuthForm";
import ShopList from "@/src/components/ShopList";

export default async function CustomerPage({
  searchParams
}: {
  searchParams: { lat?: string; lng?: string } | Promise<{ lat?: string; lng?: string }>;
}) {
  const user = await getProfile();

  if (user?.role !== "CUSTOMER") {
    return <AuthForm role="CUSTOMER" />;
  }

  const resolvedParams = await searchParams;
  const currentLat = resolvedParams?.lat ? parseFloat(resolvedParams.lat) : 28.6139;
  const currentLng = resolvedParams?.lng ? parseFloat(resolvedParams.lng) : 77.2090;

  const approvedShops = await prisma.shop.findMany({
    where: { status: "APPROVED" }
  });

  const shops = approvedShops
    .map((shop) => ({
      ...shop,
      distanceKm: calculateDistance(currentLat, currentLng, shop.latitude, shop.longitude)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return <ShopList shops={shops} />;
}
