import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { shopId: string } | Promise<{ shopId: string }> }) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const shopId = parseInt(resolvedParams.shopId, 10);
    const { status } = await req.json();

    if (!["APPROVED", "REJECTED", "DISABLED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be APPROVED, REJECTED, DISABLED, or PENDING" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: `Shop status updated to ${status}`,
      data: updatedShop
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
