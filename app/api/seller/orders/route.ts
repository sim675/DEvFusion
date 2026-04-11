import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

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
    const vendorId = new mongoose.Types.ObjectId(sellerId);

    // Fetch orders containing at least one item from this vendor
    const orders = await Order.find({ "items.vendorId": vendorId })
      .sort({ createdAt: -1 })
      .lean();

    // Map orders to only include relevant items for the seller if needed, 
    // or just return the whole order so they know what else is in it.
    // Usually, sellers only care about their own items.
    const sellerOrders = orders.map((order: any) => {
      const filteredItems = order.items.filter((item: any) => 
        item.vendorId.toString() === sellerId
      );
      return {
        ...order,
        sellerItems: filteredItems
      };
    });

    return NextResponse.json(sellerOrders);
  } catch (err: any) {
    console.error("Seller orders API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
