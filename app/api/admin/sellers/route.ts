import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Seller from "@/models/Seller";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await dbConnect();

    const sellers = await Seller.find().sort({ createdAt: -1 });

    const analytics = {
      total: sellers.length,
      pending: sellers.filter((s) => s.sellerStatus === "pending_verification").length,
      approved: sellers.filter((s) => s.sellerStatus === "approved").length,
      rejected: sellers.filter((s) => s.sellerStatus === "rejected").length,
    };

    return NextResponse.json({ sellers, analytics }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch sellers error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
