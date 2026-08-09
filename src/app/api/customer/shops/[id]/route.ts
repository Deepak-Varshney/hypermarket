import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const shopId = parseInt(resolvedParams.id, 10);

    const shop = await prisma.shop.findFirst({
      where: { id: shopId, status: "APPROVED" }
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found or not approved" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { shopId, isAvailable: true },
      orderBy: { id: "desc" }
    });

    return NextResponse.json({ success: true, data: { shop, products } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
