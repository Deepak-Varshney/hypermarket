import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "VENDOR") {
      return NextResponse.json({ success: false, message: "Forbidden. Vendor access required." }, { status: 403 });
    }

    const shop = await prisma.shop.findUnique({
      where: { vendorId: decoded.id }
    });

    if (!shop) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await prisma.product.findMany({
      where: { shopId: shop.id },
      orderBy: { id: "desc" }
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "VENDOR") {
      return NextResponse.json({ success: false, message: "Forbidden. Vendor access required." }, { status: 403 });
    }

    const { title, imageUrl, price, isAvailable } = await req.json();

    if (!title || price === undefined) {
      return NextResponse.json({ success: false, message: "Title and price are required" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { vendorId: decoded.id }
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: "Create a shop first before adding products" }, { status: 400 });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ success: false, message: "Price must be a positive number" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        title,
        imageUrl: imageUrl || "",
        price: priceNum,
        isAvailable: isAvailable !== false
      }
    });

    return NextResponse.json({ success: true, message: "Product created successfully", data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
