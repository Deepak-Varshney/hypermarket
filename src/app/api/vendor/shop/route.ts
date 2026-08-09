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

    return NextResponse.json({ success: true, data: shop });
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

    const { name, description, address, latitude, longitude } = await req.json();

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, address, latitude, longitude" },
        { status: 400 }
      );
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json({ success: false, message: "Latitude and Longitude must be numbers" }, { status: 400 });
    }

    const existingShop = await prisma.shop.findUnique({
      where: { vendorId: decoded.id }
    });

    let shop;
    if (existingShop) {
      shop = await prisma.shop.update({
        where: { id: existingShop.id },
        data: { name, description: description || "", address, latitude: latNum, longitude: lngNum }
      });
    } else {
      shop = await prisma.shop.create({
        data: {
          vendorId: decoded.id,
          name,
          description: description || "",
          address,
          latitude: latNum,
          longitude: lngNum,
          status: "PENDING"
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: existingShop ? "Shop updated successfully" : "Shop created successfully. Pending Admin approval.",
        data: shop
      },
      { status: existingShop ? 200 : 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
