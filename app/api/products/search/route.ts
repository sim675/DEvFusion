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
 *   radius   - search radius in meters (default: 50000m = 50km)
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
    const radius = parseInt(searchParams.get("radius") || "50000", 10); // metres — default 50km
    const category = searchParams.get("category")?.trim() || "";
    const subcategory = searchParams.get("subcategory")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const hasLocation = !isNaN(lat) && !isNaN(lng);
    const hasQuery = q.length > 0;
    const hasCategory = category.length > 0;
    const hasSubcategory = subcategory.length > 0;

    // Require at least one search parameter
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

    // Helper to build the text/keyword filter stage
    const buildTextFilter = () => {
      if (!hasQuery) return null;
      const regex = new RegExp(q, "i");
      return {
        $or: [
          { name: regex },
          { brand: regex },
          { tags: regex },
          { keywords: regex },
          { shortDescription: regex },
          { fullDescription: regex },
        ],
      };
    };

    // Helper to build category filter
    const buildCategoryFilter = () => {
      const filter: Record<string, any> = {};
      if (categoryId) {
        filter.$or = [
          { categoryId: new mongoose.Types.ObjectId(categoryId) },
          { category: categoryName }
        ];
      }
      if (hasSubcategory) {
        filter.subcategory = new RegExp(subcategory, "i");
      }
      return Object.keys(filter).length > 0 ? filter : null;
    };

    // Helper to build the full pipeline
    const buildPipeline = (useLocation: boolean) => {
      const pipeline: any[] = [];

      // Stage 1: $geoNear or $match
      if (useLocation) {
        const geoQuery: Record<string, any> = { isActive: true };

        // Add text filter directly into $geoNear.query for efficiency
        const textFilter = buildTextFilter();
        if (textFilter) {
          geoQuery.$or = textFilter.$or;
        }

        // Add category filter into $geoNear.query
        const catFilter = buildCategoryFilter();
        if (catFilter) {
          if (catFilter.$or && geoQuery.$or) {
            // Both text and category have $or — combine with $and
            geoQuery.$and = [{ $or: geoQuery.$or }, { $or: catFilter.$or }];
            delete geoQuery.$or;
          } else if (catFilter.$or) {
            geoQuery.$or = catFilter.$or;
          }
          if (catFilter.subcategory) {
            geoQuery.subcategory = catFilter.subcategory;
          }
        }

        pipeline.push({
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            maxDistance: radius,
            spherical: true,
            key: "location.coordinates",
            query: geoQuery,
          },
        });
      } else {
        // Non-location search
        const matchStage: Record<string, any> = { isActive: true };
        
        // Use $text index when no location (more efficient than regex)
        if (hasQuery) {
          matchStage.$text = { $search: q };
        }
        
        pipeline.push({ $match: matchStage });
        
        if (hasQuery) {
          pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
        }

        // Apply category/subcategory filter
        const catFilter = buildCategoryFilter();
        if (catFilter) {
          pipeline.push({ $match: catFilter });
        }
      }

      // Stage 2: Filter by Seller Status (Must be Approved and Active)
      pipeline.push({
        $lookup: {
          from: "sellers",
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

      // Stage 3: Facet for count + paginated results
      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          results: [
            {
              $sort: useLocation
                ? { distanceMeters: 1 }
                : hasQuery
                  ? { score: -1 }
                  : { createdAt: -1 },
            },
            { $skip: skip },
            { $limit: limit },
            // Join vendor info for display
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
            // Join category info
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
            // Project needed fields
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
                vendorId: 1,
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

      return pipeline;
    };

    // ---------------------------------------------------------------
    // Execute pipeline — location is ALWAYS respected, no silent fallback
    // ---------------------------------------------------------------
    let data: any;
    const locationUsed = hasLocation;

    if (hasLocation) {
      const pipeline = buildPipeline(true);
      [data] = await Product.aggregate(pipeline);
    } else {
      const pipeline = buildPipeline(false);
      [data] = await Product.aggregate(pipeline);
    }

    const total = data?.metadata?.[0]?.total ?? 0;
    const results = data?.results ?? [];

    // Tell the frontend whether this was a location-restricted query
    // so it can show an informative "expand radius" prompt instead of a blank page.
    const outOfRange = hasLocation && total === 0;

    return NextResponse.json(
      {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        locationUsed,
        outOfRange,   // true = there might be results if the radius is widened
        radiusUsedM: hasLocation ? radius : null,
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
