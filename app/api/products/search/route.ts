import { NextRequest, NextResponse } from "next/server";
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const hasLocation = !isNaN(lat) && !isNaN(lng);
    const hasQuery = q.length > 0;
    const hasCategory = category.length > 0;

    // Require at least one search parameter
    if (!hasLocation && !hasQuery && !hasCategory) {
      return NextResponse.json(
        { error: "Provide at least one of: q (keyword), lat+lng (location), or category." },
        { status: 400 }
      );
    }

    // Resolve category slug → ObjectId (if provided)
    let categoryId: string | null = null;
    if (hasCategory) {
      // Ensure Category model is registered
      await import("@/models/Category");
      const cat = await Category.findOne({ slug: category, isActive: true }).select("_id").lean();
      if (!cat) {
        return NextResponse.json(
          { error: `Category "${category}" not found.` },
          { status: 404 }
        );
      }
      categoryId = (cat as any)._id.toString();
    }

    // ---------------------------------------------------------------
    // Build Aggregation Pipeline
    // ---------------------------------------------------------------
    const pipeline: any[] = [];

    if (hasLocation) {
      // MODE A: Hyperlocal search (Proximity prioritized)
      // $geoNear MUST be the first stage
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: radius,
          spherical: true,
          query: { isActive: true },
        },
      });

      // Match filters (keywords using regex since $text is not allowed after $geoNear)
      const matchStage: Record<string, any> = {};
      if (hasQuery) {
        const regex = new RegExp(q, "i");
        matchStage.$or = [
          { name: regex },
          { tags: { $in: [regex] } },
          { keywords: { $in: [regex] } },
          { description: regex },
        ];
      }
      if (categoryId) {
        matchStage.categoryId = { $oid: categoryId };
      }
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }
    } else {
      // MODE B: Keyword/Category search (Relevance prioritized)
      const matchStage: Record<string, any> = { isActive: true };

      if (hasQuery) {
        // $text MUST be in the first match stage if no $geoNear
        matchStage.$text = { $search: q };
      }
      if (categoryId) {
        matchStage.categoryId = { $oid: categoryId };
      }

      pipeline.push({ $match: matchStage });

      if (hasQuery) {
        pipeline.push({
          $addFields: { score: { $meta: "textScore" } },
        });
      }
    }

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
              description: 1,
              price: 1,
              images: 1,
              tags: 1,
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
