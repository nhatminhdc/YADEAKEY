import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "yadea_admin_session";
const MAX_AGE_SEC = 60 * 60 * 8;
const SCRYPT_KEYLEN = 64;

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET chưa cấu hình (tối thiểu 32 ký tự ngẫu nhiên)",
    );
  }
  return s;
}

/** Định dạng: base64(salt).base64(hash scrypt) */
export function hashAdminPassword(password: string, salt?: Buffer): string {
  const s = salt ?? randomBytes(16);
  const hash = scryptSync(password, s, SCRYPT_KEYLEN);
  return `${s.toString("base64")}.${hash.toString("base64")}`;
}

export function verifyAdminPasswordHash(
  password: string,
  stored: string,
): boolean {
  const [saltB64, hashB64] = stored.split(".");
  if (!saltB64 || !hashB64) return false;
  try {
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return verifyAdminPasswordHash(password, hash);
  }

  const legacy = process.env.ADMIN_PASSWORD;
  if (!legacy) return false;
  if (password.length !== legacy.length) return false;
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(legacy));
  } catch {
    return false;
  }
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD,
  );
}

export function signAdminToken(): string {
  const exp = String(Date.now() + MAX_AGE_SEC * 1000);
  const sig = createHmac("sha256", sessionSecret()).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;
  try {
    const expected = createHmac("sha256", sessionSecret())
      .update(exp)
      .digest("hex");
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE_NAME)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function clearAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
}

export { COOKIE_NAME };
