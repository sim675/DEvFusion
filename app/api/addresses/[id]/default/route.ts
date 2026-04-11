import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get the auth token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to perform this action." },
        { status: 401 }
      );
    }

    // 2. Verify the JWT Token
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please login again." },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 3. Connect to the database
    await dbConnect();

    // 4. Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found or unauthorized access." },
        { status: 404 }
      );
    }

    // 5. Set as default
    address.isDefault = true;

    // 6. Save the address
    // The pre-save hook in models/Address.ts will automatically handle resetting other addresses to false
    await address.save();

    return NextResponse.json(
      { message: "Address set as default successfully", address },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Internal server error while updating default address." },
      { status: 500 }
    );
  }
}
