import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;

    const limit = Math.min(
      48,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10))
    );

    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    // Default radius 10 km (10,000 metres) for homepage hyperlocal filter
    const radius = parseInt(searchParams.get("radius") || "10000", 10);
    const hasLocation = !isNaN(lat) && !isNaN(lng);

    // Seller join + approval filter (shared by both paths)
    const sellerLookup = [
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
          distanceMeters: 1,
          location: 1,
          category: 1,
          vendor: {
            storeName: "$seller.storeName",
            city: "$seller.city",
            state: "$seller.state",
          },
        },
      },
    ];

    let pipeline: any[];

    if (hasLocation) {
      // ── Hyperlocal path: $geoNear → seller join → filter approved ──
      pipeline = [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            maxDistance: radius,
            spherical: true,
            key: "location.coordinates",
            query: { isActive: true },
          },
        },
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
        ...sellerLookup,
      ];
    } else {
      // ── Standard path: all active products, newest first ──
      pipeline = [
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
        { $sort: { createdAt: -1 } },
        ...sellerLookup,
      ];
    }

    const products = await Product.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      locationUsed: hasLocation,
      radiusUsedM: hasLocation ? radius : null,
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
