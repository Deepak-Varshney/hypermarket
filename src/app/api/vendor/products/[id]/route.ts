import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "VENDOR") {
      return NextResponse.json({ success: false, message: "Forbidden. Vendor access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id, 10);
    const { title, imageUrl, price, isAvailable } = await req.json();

    const shop = await prisma.shop.findUnique({ where: { vendorId: decoded.id } });
    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, shopId: shop.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found or access denied" }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: title !== undefined ? title : existingProduct.title,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existingProduct.isAvailable
      }
    });

    return NextResponse.json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token");
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.role !== "VENDOR") {
      return NextResponse.json({ success: false, message: "Forbidden. Vendor access required." }, { status: 403 });
    }

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id, 10);

    const shop = await prisma.shop.findUnique({ where: { vendorId: decoded.id } });
    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, shopId: shop.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found or access denied" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
