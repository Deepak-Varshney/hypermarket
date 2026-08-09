import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        shop: {
          select: { id: true, name: true, address: true }
        },
        items: true
      },
      orderBy: { id: "desc" }
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
