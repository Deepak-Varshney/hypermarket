import { calculateDistance } from "@/src/lib/distance";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const maxKm = parseFloat(searchParams.get("maxDistance") || "50");

    if (!lat || !lng) {
      return NextResponse.json({ success: false, message: "Latitude (lat) and Longitude (lng) required" }, { status: 400 });
    }

    const customerLat = parseFloat(lat);
    const customerLng = parseFloat(lng);

    const approvedShops = await prisma.shop.findMany({
      where: { status: "APPROVED" }
    });

    const nearbyShops = approvedShops
      .map((shop) => {
        const distanceKm = calculateDistance(customerLat, customerLng, shop.latitude, shop.longitude);
        return { ...shop, distanceKm };
      })
      .filter((shop) => shop.distanceKm <= maxKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({ success: true, data: nearbyShops });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
