import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Fuse from "fuse.js";
import { expandQuery } from "@/lib/search";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!q.trim()) {
      return NextResponse.json({ products: [] });
    }

    await dbConnect();

    // 1. Normalize and Expand Query
    const expandedQueries = expandQuery(q);
    
    // We'll use the original query + expanded ones to fetch a broad set of candidates from DB
    // To keep it efficient, we filter by approved sellers and active status at DB level
    
    // Get all approved and active sellers
    const approvedSellers = await Seller.find({
      sellerStatus: "approved",
      acceptingOrders: true,
    }).select("_id location");

    const sellerIds = approvedSellers.map(s => s._id);

    if (sellerIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch products belonging to these sellers
    // We use a regex for a broad initial match to limit the rows sent to Fuse.js
    const searchRegex = new RegExp(expandedQueries.join("|"), "i");
    
    const products = await Product.find({
      vendorId: { $in: sellerIds },
      isActive: true,
      $or: [
        { name: { $regex: searchRegex } },
        { shortDescription: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { tags: { $in: expandedQueries } },
        { keywords: { $in: expandedQueries } }
      ]
    }).lean();

    if (products.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 2. Fuzzy Search with Fuse.js
    const fuseOptions = {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "shortDescription", weight: 0.2 },
        { name: "category", weight: 0.2 },
        { name: "brand", weight: 0.1 }
      ],
      includeScore: true,
      threshold: 0.4, // Adjust for fuzziness
      distance: 100,
    };

    const fuse = new Fuse(products, fuseOptions);
    
    // Search using the original query primarily, but Fuse handles typos
    const fuseResults = fuse.search(q);

    // 3. Ranking and Sorting
    // Map results and add distance if coordinates are provided
    let results = fuseResults.map((result: any) => {
      const product = result.item;
      const score = result.score; // 0 is perfect match, 1 is no match
      
      let distanceScore = 0;
      if (lat && lng) {
        // Calculate a simple distance-based score or penalty
        // For now, we'll just keep it for potential sorting
        const pLat = product.location?.coordinates?.[1];
        const pLng = product.location?.coordinates?.[0];
        if (pLat && pLng) {
          const d = Math.sqrt(
            Math.pow(parseFloat(lat) - pLat, 2) + 
            Math.pow(parseFloat(lng) - pLng, 2)
          );
          distanceScore = d;
        }
      }

      return {
        ...product,
        searchScore: score,
        distance: distanceScore
      };
    });

    /**
     * Final Sorting Strategy:
     * 1. Match score (best first)
     * 2. Popularity (orderCount)
     * 3. Proximity (if coordinates provided)
     */
    results.sort((a: any, b: any) => {
      // Primary: Match Score (lower is better in Fuse.js)
      if (a.searchScore !== b.searchScore) {
        return a.searchScore - b.searchScore;
      }
      
      // Secondary: Popularity (orderCount) - higher is better
      if (b.orderCount !== a.orderCount) {
        return b.orderCount - a.orderCount;
      }

      // Tertiary: Distance (if applicable) - lower is better
      if (lat && lng) {
        return a.distance - b.distance;
      }

      return 0;
    });

    return NextResponse.json({ 
      products: results,
      total: results.length,
      query: q,
      expanded: expandedQueries
    });

  } catch (error: any) {
    console.error("Search Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
