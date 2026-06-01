import { z } from "zod";

const phoneRegex = /^(0|\+84)(\d{8,10})$/;

export const purchaseOrderBodySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)")
    .max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => phoneRegex.test(v), "Số điện thoại không hợp lệ"),
  productName: z.string().trim().min(1).max(200),
  productSlug: z.string().trim().min(1).max(120),
  productPrice: z.number().int().positive().nullable().optional(),
  selectedColor: z.string().trim().max(80).optional(),
  selectedVersion: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type PurchaseOrderBody = z.infer<typeof purchaseOrderBodySchema>;

export type PurchaseOrderRecord = PurchaseOrderBody & {
  id?: string;
  created_at?: string;
};
