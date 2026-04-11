import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

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

    const user = await User.findById(payload.id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

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

    const body = await req.json();
    const { name, email, phone } = body;

    await dbConnect();

    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const trimmedPhone = String(phone || '').trim();
    const currentEmail = String(payload.email || '').trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: payload.id },
    }).select('_id');

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already used by another account.' }, { status: 409 });
    }

    const existingSeller = trimmedEmail !== currentEmail
      ? await Seller.findOne({ email: trimmedEmail }).select('_id')
      : null;

    if (existingSeller) {
      return NextResponse.json({ error: 'This email is already used by a seller account.' }, { status: 409 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      payload.id,
      { name: trimmedName, email: trimmedEmail, phone: trimmedPhone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: unknown) {
    console.error('User profile update error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
