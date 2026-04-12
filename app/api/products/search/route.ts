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
    const radius = parseInt(searchParams.get("radius") || "5000", 10); // metres — default 5km
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
      
      // Escape regex special characters
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Split query into words to support multi-keyword search
      const words = escapedQuery.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length === 0) return null;

      // Create a regex that matches if ANY of the fields contain ALL the words
      // (This is more inclusive than searching for the exact phrase)
      const buildWordMatch = (word: string) => {
        const regex = new RegExp(word, "i");
        return {
          $or: [
            { name: regex },
            { brand: regex },
            { subcategory: regex },
            { tags: regex },
            { keywords: regex },
            { shortDescription: regex },
            { fullDescription: regex },
          ],
        };
      };

      if (words.length === 1) {
        return buildWordMatch(words[0]);
      }

      // For multiple words, we want to match products that have ALL words 
      // somewhere in their indexed fields (similar to $text search behavior)
      return {
        $and: words.map(word => buildWordMatch(word))
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
        // Search by exact subcategory OR regex (broad match)
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { subcategory: subcategory },
            { subcategory: new RegExp(subcategory, "i") }
          ]
        });
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
          // Merge textFilter (which could be $or or $and) into geoQuery
          Object.assign(geoQuery, textFilter);
        }

        // Add category/subcategory filter into $geoNear.query
        const catFilter = buildCategoryFilter();
        if (catFilter) {
          // If we have an existing $or/$and from text search, we MUST use $and to combine
          if (geoQuery.$or || geoQuery.$and) {
            const existingFilters = [];
            if (geoQuery.$or) { existingFilters.push({ $or: geoQuery.$or }); delete geoQuery.$or; }
            if (geoQuery.$and) { existingFilters.push(...geoQuery.$and); delete geoQuery.$and; }
            
            geoQuery.$and = existingFilters;
          }

          // Merge catFilter into geoQuery
          Object.entries(catFilter).forEach(([key, val]) => {
            if (key === "$and") {
              geoQuery.$and = geoQuery.$and || [];
              geoQuery.$and.push(...(val as any[]));
            } else if (key === "$or") {
              // If we already have something in $and, push the $or into it
              if (geoQuery.$and) {
                geoQuery.$and.push({ $or: val });
              } else {
                geoQuery.$or = val;
              }
            } else {
              geoQuery[key] = val;
            }
          });
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
        
        // Use regex-based filter for more inclusive search (name, subcategory, brand, etc.)
        const textFilter = buildTextFilter();
        if (textFilter) {
          // Merge textFilter (which could be $or or $and) into matchStage
          Object.assign(matchStage, textFilter);
        }
        
        pipeline.push({ $match: matchStage });

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
