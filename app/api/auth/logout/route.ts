import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the HTTP-only auth cookie by setting it to expire immediately
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
