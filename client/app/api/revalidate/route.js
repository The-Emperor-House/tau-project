import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getToken } from "next-auth/jwt";
import { API_CACHE_TAG } from "@/shared/lib/serverApi";

// dashboard เรียกหลังสร้าง/แก้/ลบข้อมูล ให้หน้าเว็บสาธารณะแสดงข้อมูลใหม่ทันที ไม่ต้องรอ cache หมดอายุ
export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(API_CACHE_TAG);
  return NextResponse.json({ revalidated: true });
}
