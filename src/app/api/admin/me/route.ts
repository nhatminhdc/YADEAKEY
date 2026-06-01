import { isAdminAuthenticated } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/admin-api";

export async function GET() {
  return jsonOk({ authenticated: await isAdminAuthenticated() });
}
