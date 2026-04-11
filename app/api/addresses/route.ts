import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";

export async function GET(req: NextRequest) {
  try {
    // 1. Get the auth token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to view addresses." },
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

    // 4. Fetch all addresses for this user
    // We sort by isDefault (desc) so the default one is first, then by createdAt (desc)
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json(
      { addresses },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching addresses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get the auth token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to add an address." },
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

    // 4. Parse and validate request body
    const body = await req.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    if (!name || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields: name, street, city, state, and pincode are required." },
        { status: 400 }
      );
    }

    // 5. Create the new address
    const newAddress = await Address.create({
      userId,
      name,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
    });

    return NextResponse.json(
      { message: "Address added successfully", address: newAddress },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message || "Internal server error while adding address."}` },
      { status: 500 }
    );
  }
}

