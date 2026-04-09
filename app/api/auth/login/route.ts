import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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

    // Check if the user exists (and select password field to compare)
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Validate the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign the JWT Token
    // We use a fallback secret if an environment variable isn't set, though it really should be set in prod.
    const secret = process.env.JWT_SECRET || 'fallback_development_secret_key';
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: '7d' } // Expires in 7 days
    );

    // Remove the password securely before returning to frontend
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Construct the response
    const response = NextResponse.json(
      { message: 'Login successful', user: userWithoutPassword },
      { status: 200 }
    );

    // Set secure HTTP-only cookie automatically managed by Next.js
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
