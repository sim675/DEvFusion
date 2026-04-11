import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please login to review." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ error: "Invalid session. Please login again." }, { status: 401 });
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

    // Get user name
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ productId, userId: decoded.id });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
    }

    // Create review
    const newReview = await Review.create({
      productId,
      userId: decoded.id,
      userName: user.name,
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
