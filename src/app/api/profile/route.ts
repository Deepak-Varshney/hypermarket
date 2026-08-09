import { cookies } from "next/headers";
import { verifyToken } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function getProfile() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return null;

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  } catch (error) {
    return null;
  }
}

export async function GET() {
  const user = await getProfile();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ success: true, message: "User fetched success", data: user }, { status: 200 });
}