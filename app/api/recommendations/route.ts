import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import BrowsingHistory from "@/models/BrowsingHistory";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const currentProductId = searchParams.get("productId"); // For "You may also like"
    const limit = parseInt(searchParams.get("limit") || "10");
    const lng = searchParams.get("lng");
    const lat = searchParams.get("lat");

    let recommendedProducts: any[] = [];

    // --- MODE 1: PRODUCT-CONTEXT RECOMMENDATIONS ("You may also like") ---
    if (currentProductId && mongoose.Types.ObjectId.isValid(currentProductId)) {
      const currentProduct = await Product.findById(currentProductId).select('category subcategory categoryId');
      
      if (currentProduct) {
        // Base query for similar products
        const matchStage: any = {
          isActive: true,
          category: currentProduct.category,
          _id: { $ne: new mongoose.Types.ObjectId(currentProductId) }
        };

        const pipeline: any[] = [];

        // Hyperlocal boost if coordinates are provided
        if (lng && lat) {
          pipeline.push({
            $geoNear: {
              near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
              distanceField: "distance",
              spherical: true,
              query: matchStage
            }
          });
        } else {
          pipeline.push({ $match: matchStage });
        }

        pipeline.push(
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
          { $limit: 30 },
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
              category: 1,
              subcategory: 1,
              distance: 1,
              vendor: {
                storeName: "$seller.storeName",
                city: "$seller.city",
                state: "$seller.state",
              },
            },
          }
        );

        const candidates = await Product.aggregate(pipeline);

        const scoredCandidates = candidates.map((p: any) => {
          let score = 0;
          // High boost for same subcategory (+10)
          if (p.subcategory === currentProduct.subcategory) score += 10;
          
          // Popularity boost (+2 for high reviews/rating)
          score += (p.rating || 0);
          score += Math.min((p.numReviews || 0) / 5, 5);

          // Distance boost (+2 for being very close, e.g., < 10km)
          if (p.distance && p.distance < 10000) score += 2;

          return { ...p, score };
        });

        recommendedProducts = scoredCandidates
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }
    } 
    // --- MODE 2: USER-INTEREST RECOMMENDATIONS ("Recommended for You") ---
    else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // 1. Fetch User Data
      const [history, orders] = await Promise.all([
        BrowsingHistory.find({ userId }).sort({ viewedAt: -1 }).limit(20),
        Order.find({ userId }).sort({ createdAt: -1 }).limit(10),
      ]);

      // 2. Extract Preferences
      const categoryScores: Record<string, number> = {};
      const subcategoryScores: Record<string, number> = {};
      const purchasedProductIds = new Set<string>();

      // From History (+2 per view)
      history.forEach((h) => {
        categoryScores[h.category] = (categoryScores[h.category] || 0) + 2;
        if (h.subcategory) {
          subcategoryScores[h.subcategory] = (subcategoryScores[h.subcategory] || 0) + 2;
        }
      });

      // From Orders (+5 per purchase)
      orders.forEach((order) => {
        order.items.forEach((item: any) => {
          purchasedProductIds.add(item.productId.toString());
        });
      });

      if (purchasedProductIds.size > 0) {
        const purchasedProducts = await Product.find({
          _id: { $in: Array.from(purchasedProductIds).map(id => new mongoose.Types.ObjectId(id)) }
        }).select('category subcategory');
        
        purchasedProducts.forEach(p => {
          categoryScores[p.category] = (categoryScores[p.category] || 0) + 5;
          if (p.subcategory) {
            subcategoryScores[p.subcategory] = (subcategoryScores[p.subcategory] || 0) + 5;
          }
        });
      }

      // 3. Candidate Selection
      const topCategories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]);

      const matchStage: any = {
        isActive: true,
        _id: { $nin: Array.from(purchasedProductIds).map(id => new mongoose.Types.ObjectId(id)) }
      };

      if (topCategories.length > 0) {
        matchStage.category = { $in: topCategories };
      }

      const pipeline: any[] = [];
      if (lng && lat) {
        pipeline.push({
          $geoNear: {
            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: "distance",
            spherical: true,
            query: matchStage
          }
        });
      } else {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push(
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
        { $limit: 50 },
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
            category: 1,
            subcategory: 1,
            distance: 1,
            vendor: {
              storeName: "$seller.storeName",
              city: "$seller.city",
              state: "$seller.state",
            },
          },
        },
      );

      const candidates = await Product.aggregate(pipeline);

      const scoredCandidates = candidates.map((p: any) => {
        let score = 0;
        const catName = p.category?.name || p.category;
        if (categoryScores[catName]) score += 5;
        if (p.subcategory && subcategoryScores[p.subcategory]) score += 3;
        
        score += (p.rating || 0);
        score += Math.min((p.numReviews || 0) / 10, 5);
        if (p.distance && p.distance < 10000) score += 2;

        return { ...p, score };
      });

      recommendedProducts = scoredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // 6. Fallback Logic
    if (recommendedProducts.length < 4) {
      const fallbackQuery: any = {
        isActive: true,
        _id: { 
          $nin: [
            ...(currentProductId ? [new mongoose.Types.ObjectId(currentProductId)] : []),
            ...recommendedProducts.map(p => p._id)
          ] 
        }
      };

      const fallbackProducts = await Product.aggregate([
        { $match: fallbackQuery },
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
        { $sort: { rating: -1, numReviews: -1 } },
        { $limit: limit - recommendedProducts.length },
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
            category: 1,
            vendor: {
              storeName: "$seller.storeName",
              city: "$seller.city",
              state: "$seller.state",
            },
          },
        },
      ]);

      recommendedProducts = [...recommendedProducts, ...fallbackProducts];
    }

    return NextResponse.json(recommendedProducts);
  } catch (error: any) {
    console.error("Recommendation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
