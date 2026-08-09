import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { itemId: string } | Promise<{ itemId: string }> }
) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, message: "Forbidden. Customer access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.itemId, 10);
    const body = await req.json();
    const qty = typeof body.quantity === "number" ? body.quantity : parseInt(body.quantity, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ success: false, message: "Invalid itemId" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { customerId: decoded.id } });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id }
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Cart item not found" }, { status: 404 });
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty }
      });
    }

    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error: any) {
    console.error("PUT CartItem Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } | Promise<{ itemId: string }> }
) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, message: "Forbidden. Customer access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.itemId, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ success: false, message: "Invalid itemId" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { customerId: decoded.id } });
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true, message: "Item removed from cart" });
  } catch (error: any) {
    console.error("DELETE CartItem Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
