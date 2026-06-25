import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// 🚩 เส้นทางที่ต้อง login
const protectedRoutes = ["/dashboard", "/profile"];
// 🚩 เส้นทางที่ไม่ควรเข้าเมื่อ login แล้ว
const authRoutes = ["/auth/login", "/auth"];

export async function proxy(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // 🔒 ถ้าไม่ login แล้วจะเข้า route ที่ต้อง login
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔓 ถ้า login อยู่ แล้วจะเข้า route ที่ควรเข้าแค่ตอนยังไม่ login
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ✅ กรณี: ไม่ได้ login แต่พยายามเข้า protected route
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ✅ กรณี: login แล้วแต่พยายามเข้า auth route
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
