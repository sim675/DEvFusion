import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

/**
 * GET /api/products/search
 *
 * Query Parameters:
 *   q        - keyword search string (searches name, tags, keywords, description)
 *   lat      - buyer latitude for proximity search
 *   lng      - buyer longitude for proximity search
 *   radius   - search radius in meters (default: 5000m = 5km)
 *   category - category slug to filter by
 *   page     - page number (default: 1)
 *   limit    - results per page (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q")?.trim() || "";
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseInt(searchParams.get("radius") || "5000", 10); // metres
    const category = searchParams.get("category")?.trim() || "";
    const subcategory = searchParams.get("subcategory")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const hasLocation = !isNaN(lat) && !isNaN(lng);
    const hasQuery = q.length > 0;
    const hasCategory = category.length > 0;
    const hasSubcategory = subcategory.length > 0;

    // Require at least one search parameter (added subcategory)
    if (!hasLocation && !hasQuery && !hasCategory && !hasSubcategory) {
      return NextResponse.json(
        { error: "Provide at least one of: q (keyword), lat+lng (location), category, or subcategory." },
        { status: 400 }
      );
    }

    // Resolve category slug → ObjectId (if provided)
    let categoryId: string | null = null;
    let categoryName: string | null = null;
    if (hasCategory) {
      // Ensure Category model is registered
      await import("@/models/Category");
      const cat = await Category.findOne({ 
        $or: [{ slug: category }, { name: category }],
        isActive: true 
      }).select("_id name").lean();
      if (!cat) {
        return NextResponse.json(
          { error: `Category "${category}" not found.` },
          { status: 404 }
        );
      }
      categoryId = (cat as any)._id.toString();
      categoryName = (cat as any).name;
    }

    // ---------------------------------------------------------------
    // Build Aggregation Pipeline
    // ---------------------------------------------------------------
    const pipeline: any[] = [];

    // Stage 1: Initial filtering and location if present
    if (hasLocation) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: radius,
          spherical: true,
          query: { isActive: true },
        },
      });
    } else {
      const matchStage: Record<string, any> = { isActive: true };
      if (hasQuery) {
        matchStage.$text = { $search: q };
      }
      pipeline.push({ $match: matchStage });
      if (hasQuery) {
        pipeline.push({
          $addFields: { score: { $meta: "textScore" } },
        });
      }
    }

    // Stage 2: Filter by Category/Subcategory (if provided)
    const filterStage: Record<string, any> = {};
    if (categoryId) {
      // Try filtering by categoryId (ObjectId) OR category (String name)
      filterStage.$or = [
        { categoryId: new mongoose.Types.ObjectId(categoryId) },
        { category: categoryName }
      ];
    }
    if (hasSubcategory) {
      filterStage.subcategory = new RegExp(subcategory, "i");
    }
    if (hasQuery && hasLocation) {
      // Text search in proximity mode
      const regex = new RegExp(q, "i");
      const searchConditions = [
        { name: regex },
        { brand: regex },
        { tags: regex },
        { keywords: regex },
        { shortDescription: regex },
        { fullDescription: regex },
      ];

      if (filterStage.$or) {
        // If category filter already exists, we must AND it with the search conditions
        // to ensure we search WITHIN the category rather than expanding the search.
        filterStage.$and = [{ $or: filterStage.$or }, { $or: searchConditions }];
        delete filterStage.$or;
      } else {
        filterStage.$or = searchConditions;
      }
    }
    if (Object.keys(filterStage).length > 0) {
      pipeline.push({ $match: filterStage });
    }

    // Stage 3: Filter by Seller Status (Must be Approved and Active)
    pipeline.push({
      $lookup: {
        from: "sellers", // Collection name
        localField: "vendorId",
        foreignField: "_id",
        as: "seller_info"
      }
    });
    pipeline.push({ $unwind: "$seller_info" });
    pipeline.push({
      $match: {
        "seller_info.sellerStatus": "approved",
        "seller_info.acceptingOrders": true
      }
    });

    // Stage 4 – Count total before pagination (facet)
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        results: [
          // Sort: proximity first (if available), then by text relevance, then newest
          {
            $sort: hasQuery && hasLocation
              ? { distanceMeters: 1, score: -1 }
              : hasLocation
                ? { distanceMeters: 1 }
                : hasQuery
                  ? { score: -1 }
                  : { createdAt: -1 },
          },
          { $skip: skip },
          { $limit: limit },
          // Join with Seller model for shop info
          {
            $lookup: {
              from: "sellers",
              localField: "vendorId",
              foreignField: "_id",
              as: "vendor",
              pipeline: [
                { $project: { storeName: 1, city: 1, state: 1, rating: 1, serviceRadius: 1 } },
              ],
            },
          },
          { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
          // Join with Category model
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
              pipeline: [
                { $project: { name: 1, slug: 1, icon: 1 } },
              ],
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          // Project only fields the frontend needs
          {
            $project: {
              name: 1,
              brand: 1,
              shortDescription: 1,
              fullDescription: 1,
              price: 1,
              discountPrice: 1,
              mrp: 1,
              images: 1,
              mainImage: 1,
              tags: 1,
              keywords: 1,
              stock: 1,
              rating: 1,
              numReviews: 1,
              location: 1,
              isActive: 1,
              createdAt: 1,
              distanceMeters: 1,
              score: 1,
              vendor: 1,
              category: 1,
              deliveryTime: 1,
              pickupAvailable: 1,
              specifications: 1,
              additionalDetails: 1,
            },
          },
        ],
      },
    });

    const [data] = await Product.aggregate(pipeline);

    const total = data?.metadata?.[0]?.total ?? 0;
    const results = data?.results ?? [];

    return NextResponse.json(
      {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Search API Error]", error);
    return NextResponse.json(
      { error: `Search failed: ${error.message || "Internal server error."}` },
      { status: 500 }
    );
  }
}
