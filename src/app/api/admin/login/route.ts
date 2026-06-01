import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  checkAdminPassword,
  isAdminPasswordConfigured,
  signAdminToken,
} from "@/lib/admin-auth";
import {
  clearLoginAttempts,
  getClientIp,
  isLoginRateLimited,
  recordFailedLogin,
} from "@/lib/admin-login-limit";
import { jsonError } from "@/lib/admin-api";

const MIN_PASSWORD_LEN = 12;

export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return jsonError(
      "Admin chưa cấu hình. Đặt ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET trong .env",
      503,
    );
  }

  if (!process.env.ADMIN_SESSION_SECRET) {
    return jsonError("ADMIN_SESSION_SECRET chưa cấu hình trên server", 503);
  }

  const ip = getClientIp(req);
  if (isLoginRateLimited(ip)) {
    return jsonError("Quá nhiều lần thử. Thử lại sau 15 phút.", 429);
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return jsonError("Dữ liệu không hợp lệ", 400);
  }

  const password = body.password ?? "";
  if (password.length < MIN_PASSWORD_LEN) {
    recordFailedLogin(ip);
    return jsonError("Mật khẩu không đúng", 401);
  }

  if (!checkAdminPassword(password)) {
    recordFailedLogin(ip);
    return jsonError("Mật khẩu không đúng", 401);
  }

  clearLoginAttempts(ip);
  const token = signAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions(token));
  return res;
}
