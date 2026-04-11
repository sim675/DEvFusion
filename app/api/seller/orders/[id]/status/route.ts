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

const statusSequence = ["Placed", "Preparing", "Out for Delivery", "Delivered"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sellerId = await getSellerIdFromAuth(req);
    if (!sellerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newStatus } = await req.json();

    if (!statusSequence.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await dbConnect();
    const vendorId = new mongoose.Types.ObjectId(sellerId);

    const order = await Order.findOne({ _id: id, "items.vendorId": vendorId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Enforce sequential progress
    const currentIndex = statusSequence.indexOf(order.orderStatus);
    const nextIndex = statusSequence.indexOf(newStatus);

    if (nextIndex <= currentIndex) {
        return NextResponse.json({ error: "Status can only progress forward" }, { status: 400 });
    }
    
    if (nextIndex !== currentIndex + 1) {
        return NextResponse.json({ error: `Must move to ${statusSequence[currentIndex + 1]} first` }, { status: 400 });
    }

    order.orderStatus = newStatus as any;
    await order.save();

    return NextResponse.json({ message: "Order status updated successfully", orderStatus: order.orderStatus });
  } catch (err: any) {
    console.error("Order status update API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
