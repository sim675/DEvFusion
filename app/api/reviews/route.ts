import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import Seller from "@/models/Seller";
import mongoose from "mongoose";
import { getUserFromAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized. Please login to review." }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields (productId, rating, comment)." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Get user name (Check both models)
    let userName = "Anonymous";
    if (authUser.role === 'seller') {
      const seller = await Seller.findById(authUser.id);
      if (seller) userName = seller.fullName || seller.storeName || "Seller";
    } else {
      const user = await User.findById(authUser.id);
      if (user) userName = user.name || "Buyer";
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ productId, userId: authUser.id });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
    }

    // Create review
    const newReview = await Review.create({
      productId,
      userId: authUser.id,
      userName: userName,
      rating,
      comment
    });

    // Update Product Stats
    // Formula: NewAvg = ((OldAvg * OldCount) + NewRating) / (OldCount + 1)
    const oldNumReviews = product.numReviews || 0;
    const oldRating = product.rating || 0;
    const newNumReviews = oldNumReviews + 1;
    const newAverageRating = ((oldRating * oldNumReviews) + rating) / newNumReviews;

    await Product.findByIdAndUpdate(productId, {
      $set: { 
        rating: parseFloat(newAverageRating.toFixed(1)),
        numReviews: newNumReviews
      }
    });

    return NextResponse.json({ message: "Review submitted successfully!", review: newReview });

  } catch (error: any) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
