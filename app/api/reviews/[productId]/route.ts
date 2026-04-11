import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// Mock Review model if not exists
const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await dbConnect();
    const { productId } = await params;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();

    // Calculate rating breakdown
    const stats = {
      average: 0,
      total: reviews.length,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    if (reviews.length > 0) {
      let sum = 0;
      reviews.forEach((r: any) => {
        sum += r.rating;
        (stats.breakdown as any)[r.rating]++;
      });
      stats.average = parseFloat((sum / reviews.length).toFixed(1));
    }

    return NextResponse.json({ reviews, stats });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
