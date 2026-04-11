import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Seller from '@/models/Seller';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate request
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';

    // ── 0. Check Hardcoded Admin ───────────────────────────────
    if (email === 'admin@vendorhub.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin_dashboard', role: 'admin', email: 'admin@vendorhub.com' },
        secret,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        { 
          message: 'Admin login successful', 
          role: 'admin',
          redirectTo: '/admin',
          user: { _id: 'admin', name: 'Admin', email: 'admin@vendorhub.com', role: 'admin' }
        },
        { status: 200 }
      );

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // ── 1. Try regular User first ──────────────────────────────
    const user = await User.findOne({ email });
    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        secret,
        { expiresIn: '7d' }
      );

      const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      const response = NextResponse.json(
        { message: 'Login successful', user: userWithoutPassword, role: user.role },
        { status: 200 }
      );

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // ── 2. Fall back to Seller model ──────────────────────────
    const seller = await Seller.findOne({ email });
    if (!seller) {
      // Neither a User nor a Seller — give generic error
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isSellerMatch = seller.password
      ? await bcrypt.compare(password, seller.password)
      : false;

    if (!isSellerMatch || !seller.password) {
      // seller.password being falsy means they registered before the
      // password field was introduced — ask them to re-register.
      const msg = !seller.password
        ? 'This account was created before login support was added. Please register again with a new email (or contact support).'
        : 'Invalid email or password';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const sellerToken = jwt.sign(
      { id: seller._id, role: 'seller', email: seller.email },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: 'Login successful',
        role: 'seller',
        redirectTo: '/seller/dashboard',
        seller: {
          _id: seller._id,
          fullName: seller.fullName,
          email: seller.email,
          storeName: seller.storeName,
          sellerStatus: seller.sellerStatus,
        },
      },
      { status: 200 }
    );

    response.cookies.set('seller_token', sellerToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
