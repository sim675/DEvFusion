import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

async function getSellerIdFromAuth(req: NextRequest) {
  const token = req.cookies.get("seller_token")?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    const decoded: any = jwt.verify(token, secret);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const sellerId = await getSellerIdFromAuth(req);
    if (!sellerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const lowStockProducts = await Product.find({
      vendorId: sellerId,
      stock: { $lt: 5 }
    }).sort({ stock: 1 });

    return NextResponse.json(lowStockProducts);
  } catch (err: any) {
    console.error("Inventory alerts API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
