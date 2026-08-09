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

    const cart = await prisma.cart.findUnique({
      where: { customerId: decoded.id },
      include: {
        shop: true,
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart) {
      return NextResponse.json({ success: true, data: { cart: null, items: [], total: 0 } });
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: { cart, items: cart.items, total: Number(total.toFixed(2)) }
    });
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

    const { productId, quantity } = await req.json();
    const qty = parseInt(quantity || "1", 10);

    if (!productId || isNaN(qty) || qty <= 0) {
      return NextResponse.json({ success: false, message: "Valid productId and positive quantity required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId, 10) },
      include: { shop: true }
    });

    if (!product || !product.isAvailable) {
      return NextResponse.json({ success: false, message: "Product is unavailable or does not exist" }, { status: 400 });
    }

    if (product.shop.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "Shop is not approved" }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({ where: { customerId: decoded.id } });

    if (!cart) {
      // Create new cart linked to this shop
      cart = await prisma.cart.create({
        data: { customerId: decoded.id, shopId: product.shopId }
      });
    } else if (cart.shopId !== product.shopId) {
      // Single shop constraint: clear previous cart items and update cart to new shop
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { shopId: product.shopId }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: product.id }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: product.id, quantity: qty }
      });
    }

    return NextResponse.json({ success: true, message: "Product added to cart" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
