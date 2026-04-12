import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BrowsingHistory from "@/models/BrowsingHistory";
import Product from "@/models/Product";
import { getUserFromAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await dbConnect();

    // Fetch product details to store category/subcategory for scoring
    const product = await Product.findById(productId).select('category subcategory');
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upsert view (update viewedAt if already exists)
    await BrowsingHistory.findOneAndUpdate(
      { userId: user.id, productId },
      { 
        viewedAt: new Date(),
        category: product.category,
        subcategory: product.subcategory || "" 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("History Tracking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
