import { NextResponse } from "next/server";
import { clearAdminCookieOptions } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/admin-api";

export async function POST() {
  const res = jsonOk({});
  res.cookies.set(clearAdminCookieOptions());
  return res;
}
