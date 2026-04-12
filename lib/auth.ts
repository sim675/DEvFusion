import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function getUserFromAuth(req: NextRequest) {
  // Check both cookies: auth_token (buyers/admins) and seller_token (sellers)
  const token = req.cookies.get("auth_token")?.value || req.cookies.get("seller_token")?.value;
  
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "fallback_development_secret_key";
    const decoded: any = jwt.verify(token, secret);
    
    // Standardize the return object
    return {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    console.error("Auth helper verification failed:", error);
    return null;
  }
}
