import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import Seller from "@/models/Seller";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const { action, adminComment } = await req.json();

    const order = await Order.findOne({ _id: id, "items.vendorId": seller._id });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (action === "approve") {
      order.orderStatus = "Returned";
      if (order.returnDetails) {
        order.returnDetails.status = "Approved";
        order.returnDetails.adminComment = adminComment;
      }
      if (order.refundDetails) {
        order.refundDetails.status = "Initiated";
        order.refundDetails.updatedAt = new Date();
      }
    } else if (action === "reject") {
      order.orderStatus = "Return Rejected";
      if (order.returnDetails) {
        order.returnDetails.status = "Rejected";
        order.returnDetails.adminComment = adminComment;
      }
      if (order.refundDetails) {
        order.refundDetails.status = "Failed";
        order.refundDetails.updatedAt = new Date();
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await order.save();

    return NextResponse.json({ success: true, message: `Return ${action}d successfully` }, { status: 200 });
  } catch (error: any) {
    console.error("Seller Return Action PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
