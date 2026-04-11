import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('seller_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
    let payload: { id: string; email: string };

    try {
      payload = jwt.verify(token, secret) as { id: string; email: string };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    await dbConnect();

    // Fetch the entire seller profile minus the password
    const seller = await Seller.findById(payload.id).select('-password');

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found.' }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch (error: unknown) {
    console.error('Seller profile error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
