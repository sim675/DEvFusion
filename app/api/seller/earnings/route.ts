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

    // Aggregate product-wise sales and revenue
    const productStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendorId": vendorId, orderStatus: { $ne: "Cancelled" } } },
      { $group: { 
          _id: "$items.productId", 
          name: { $first: "$items.name" }, 
          sales: { $sum: "$items.quantity" }, 
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } 
      } },
      { $sort: { revenue: -1 } }
    ]);

    const totalGrossSales = productStats.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalOrdersCount = await Order.countDocuments({ "items.vendorId": vendorId, orderStatus: { $ne: "Cancelled" } });
    
    // 5% Commission Calculation
    const commission = totalGrossSales * 0.05;
    const netRevenue = totalGrossSales - commission;

    return NextResponse.json({
      productStats,
      totalGrossSales,
      totalOrdersCount,
      commission,
      netRevenue
    });

  } catch (err: any) {
    console.error("Seller earnings API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
