import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Seller from "@/models/Seller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch Seller Info to check status and active state
    const seller = await Seller.findById(product.vendorId).lean();

    if (!seller || (seller as any).sellerStatus !== "approved" || !(seller as any).acceptingOrders) {
      return NextResponse.json(
        { error: "This product is currently unavailable" },
        { status: 403 }
      );
    }

    return NextResponse.json({ product, seller });
  } catch (error: any) {
    console.error("Fetch product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
