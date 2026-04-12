import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import Seller from "@/models/Seller";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("seller_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let payload: { id: string; email: string };
    try {
      payload = jwt.verify(token, secret) as { id: string; email: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const seller = await Seller.findById(payload.id);
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    // Find orders that have return requested and contain items from this seller
    const orders = await Order.find({
      "items.vendorId": seller._id,
      orderStatus: { $in: ["Return Requested", "Returned", "Return Rejected"] }
    }).sort({ updatedAt: -1 });

    // Filter items to only show those belonging to this seller
    const sellerReturns = orders.map(order => {
      const sellerItems = order.items.filter((item: any) => item.vendorId.toString() === seller._id.toString());
      return {
        ...order.toObject(),
        sellerItems
      };
    });

    return NextResponse.json(sellerReturns, { status: 200 });
  } catch (error: any) {
    console.error("Seller Returns GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
