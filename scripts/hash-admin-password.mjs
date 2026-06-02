/**
 * Tạo ADMIN_PASSWORD_HASH + gợi ý ADMIN_SESSION_SECRET
 * Usage: node scripts/hash-admin-password.mjs "mat-khau-manh"
 */
import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error("Dùng: node scripts/hash-admin-password.mjs \"mat-khau-it-nhat-8-ky-tu\"");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const stored = `${salt.toString("base64")}.${hash.toString("base64")}`;
const sessionSecret = randomBytes(32).toString("base64url");

console.log("\nThêm vào .env (KHÔNG commit file .env):\n");
console.log(`ADMIN_PASSWORD_HASH="${stored}"`);
console.log(`ADMIN_SESSION_SECRET="${sessionSecret}"`);
console.log("\nXóa dòng ADMIN_PASSWORD=... nếu còn.\n");
