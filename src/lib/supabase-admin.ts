import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PurchaseOrderBody } from "./purchase-order-schema";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function insertPurchaseOrder(
  order: PurchaseOrderBody,
): Promise<{ id: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({
      customer_name: order.customerName,
      phone: order.phone,
      product_name: order.productName,
      product_slug: order.productSlug,
      product_price: order.productPrice ?? null,
      selected_color: order.selectedColor ?? null,
      selected_version: order.selectedVersion ?? null,
      notes: order.notes ?? null,
      source: "yadea-showroom",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id as string };
}
