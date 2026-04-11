import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const limit = Math.min(
      48,
      Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "24", 10))
    );

    const products = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "sellers",
          localField: "vendorId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $match: {
          "seller.sellerStatus": "approved",
          "seller.acceptingOrders": true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
          pipeline: [{ $project: { name: 1, slug: 1, icon: 1 } }],
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          brand: 1,
          shortDescription: 1,
          price: 1,
          discountPrice: 1,
          mrp: 1,
          images: 1,
          mainImage: 1,
          stock: 1,
          rating: 1,
          numReviews: 1,
          deliveryTime: 1,
          createdAt: 1,
          category: 1,
          vendor: {
            storeName: "$seller.storeName",
            city: "$seller.city",
            state: "$seller.state",
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      results: products,
    });
  } catch (error: any) {
    console.error("[Homepage Products Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products." },
      { status: 500 }
    );
  }
}
