import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

/**
 * GET /api/seed/categories
 *
 * One-time seed route — populates the Category collection with the
 * 12 marketplace categories shown on the landing page.
 *
 * ⚠️  Remove or protect this route before going to production.
 */

const CATEGORIES = [
  { 
    name: "Fashion",     
    slug: "fashion",     
    icon: "Shirt",      
    description: "Clothing, footwear, and accessories from local boutiques",
    subcategories: ["Men's Wear", "Women's Wear", "Kid's Wear", "Footwear", "Accessories"]
  },
  { 
    name: "Mobiles",     
    slug: "mobiles",     
    icon: "Smartphone", 
    description: "Mobile phones and accessories from nearby stores",
    subcategories: ["Smartphones", "Tablets", "Accessories", "Refurbished"]
  },
  { 
    name: "Beauty",      
    slug: "beauty",      
    icon: "Sparkles",   
    description: "Skincare, makeup, and personal care products",
    subcategories: ["Skincare", "Makeup", "Haircare", "Fragrance", "Personal Care"]
  },
  { 
    name: "Electronics", 
    slug: "electronics", 
    icon: "Monitor",    
    description: "Gadgets, laptops, and electronic accessories",
    subcategories: ["Laptops", "Cameras", "Audio", "Gaming", "Smart Home"]
  },
  { 
    name: "Home",        
    slug: "home",        
    icon: "Home",       
    description: "Home décor, kitchen essentials, and daily utilities",
    subcategories: ["Décor", "Kitchen", "Furniture", "Lighting", "Storage"]
  },
  { 
    name: "Appliances",  
    slug: "appliances",  
    icon: "Tv",         
    description: "Kitchen and household appliances",
    subcategories: ["Refrigerator", "Washing Machine", "Microwave", "Air Conditioner"]
  },
  { 
    name: "Toys",        
    slug: "toys",        
    icon: "Gamepad2",   
    description: "Toys, games, and hobby supplies for all ages",
    subcategories: ["Action Figures", "Puzzles", "Educational", "Soft Toys", "Outdoor"]
  },
  { 
    name: "Food",        
    slug: "food",        
    icon: "Utensils",   
    description: "Fresh and packaged food from local vendors",
    subcategories: ["Snacks", "Beverages", "Groceries", "Bakery", "Organic"]
  },
  { 
    name: "Sports",      
    slug: "sports",      
    icon: "Bike",       
    description: "Sports gear, fitness equipment, and outdoor supplies",
    subcategories: ["Fitness", "Outdoor", "Indoor Games", "Team Sports", "Sportswear"]
  },
  { 
    name: "Books",       
    slug: "books",       
    icon: "Book",       
    description: "Books, stationery, and educational material",
    subcategories: ["Fiction", "Non-Fiction", "Academic", "Children", "Comics"]
  },
  { 
    name: "Furniture",   
    slug: "furniture",   
    icon: "Armchair",   
    description: "Furniture and home furnishing from local craftsmen",
    subcategories: ["Living Room", "Bedroom", "Dining", "Office", "Outdoor"]
  },
];

export async function GET(req: NextRequest) {
  // Basic guard — only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seed route is disabled in production." },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const results: { name: string; status: string }[] = [];

    for (const cat of CATEGORIES) {
      const existing = await Category.findOne({ slug: cat.slug });

      if (existing) {
        existing.subcategories = cat.subcategories;
        await existing.save();
        results.push({ name: cat.name, status: "updated (subcategories added)" });
        continue;
      }

      await Category.create({ ...cat, isActive: true });
      results.push({ name: cat.name, status: "created" });
    }

    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status.startsWith("skipped")).length;

    return NextResponse.json(
      {
        success: true,
        message: `Seeding complete. ${created} created, ${skipped} skipped.`,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Seed Error]", error);
    return NextResponse.json(
      { error: `Seeding failed: ${error.message}` },
      { status: 500 }
    );
  }
}
