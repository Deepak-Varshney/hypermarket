import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, message: "Forbidden. Customer access required." }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: decoded.id },
      include: {
        shop: true,
        items: true
      },
      orderBy: { id: "desc" }
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, message: "Forbidden. Customer access required." }, { status: 403 });
    }

    const { deliveryAddress } = await req.json();

    const cart = await prisma.cart.findUnique({
      where: { customerId: decoded.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerId: decoded.id,
        shopId: cart.shopId,
        totalAmount: Number(totalAmount.toFixed(2)),
        deliveryAddress: deliveryAddress || "Customer Address",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productTitle: item.product.title,
            price: item.product.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true, shop: true }
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });

    return NextResponse.json({ success: true, message: "Order placed successfully", data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
