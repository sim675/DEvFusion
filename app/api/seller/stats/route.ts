import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
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

    // 1. Total Revenue (Confirmed/Completed orders)
    // We sum the price * quantity for items belonging to this vendor
    const revenueStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendorId": vendorId, orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
    ]);
    const totalRevenue = revenueStats[0]?.total || 0;

    // 2. Orders This Week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weeklyOrders = await Order.countDocuments({
      "items.vendorId": vendorId,
      createdAt: { $gte: startOfWeek }
    });

    // 3. Total Products
    const totalProducts = await Product.countDocuments({ vendorId });

    // 4. Top Selling Product
    const topProductStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendorId": vendorId, orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: "$items.productId", name: { $first: "$items.name" }, totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 1 }
    ]);
    const topProduct = topProductStats[0] || { name: "None", totalSold: 0 };

    // 5. Low Stock Count
    const lowStockCount = await Product.countDocuments({ vendorId, stock: { $lt: 5 } });

    return NextResponse.json({
      totalRevenue,
      weeklyOrders,
      totalProducts,
      topProduct: topProduct.name,
      topProductSold: topProduct.totalSold,
      lowStockCount
    });

  } catch (err: any) {
    console.error("Seller stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
