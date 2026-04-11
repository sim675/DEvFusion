import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error("Payment failed attempt logged:", body);
    
    // In a real production system, you might want to log this to a structured
    // logging service or a specific database collection to track failures.
    
    return NextResponse.json({ message: "Failure event logged successfully" }, { status: 200 });
  } catch (err) {
    console.error("Payment failed endpoint parsing error");
    return NextResponse.json({ error: "Error logging failure" }, { status: 500 });
  }
}
