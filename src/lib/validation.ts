import { z } from "zod";

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export const phoneSchema = z.string().transform((value) =>
  value
    .trim()
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .replace(/[\s-]/g, ""),
).refine((value) => /^09\d{9}$/.test(value), "شماره موبایل معتبر نیست");

export const passwordSchema = z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد").max(128);

export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
}).strict();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  password: passwordSchema,
  role: z.enum(["CUSTOMER", "SUPPLIER"]),
}).strict();

const shippingAddressSchema = z.object({
  recipientName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  province: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(5).max(500),
  postalCode: z.string().transform((value) =>
    value.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d))).replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d))),
  ).refine((value) => /^\d{10}$/.test(value), "کد پستی باید ۱۰ رقم باشد"),
});

export const createSaleSchema = z.object({
  saleId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().min(1).max(100),
    quantity: z.number().int().positive().max(100000),
    unitPrice: z.number().finite().nonnegative().optional(),
    purchaseCost: z.number().finite().nonnegative().optional(),
  }).strict()).min(1).max(100),
  discount: z.number().finite().nonnegative().optional(),
  customerId: z.string().max(100).nullable().optional(),
  paymentStatus: z.string().max(40).optional(),
  receiptImage: z.string().max(2048).nullable().optional(),
  receipt: z.object({
    id: z.string().max(64),
    url: z.string().max(2048),
    fileName: z.string().max(200),
    uploadedAt: z.string().datetime(),
  }).nullable().optional(),
  channel: z.enum(["POS", "ONLINE"]).optional(),
  shippingAddress: shippingAddressSchema.partial().nullable().optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
  couponCode: z.string().trim().max(100).nullable().optional(),
  shippingCost: z.number().finite().nonnegative().optional(),
}).strict();

export async function parseJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "VALIDATION_ERROR");
  }
  return result.data;
}

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "PAYMENT_FAILED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"]),
  reason: z.string().trim().max(500).optional(),
}).strict();

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(5000),
  category: z.enum(["ORDER", "PRODUCT", "PAYMENT", "SHIPPING", "RETURN", "OTHER"]).default("OTHER"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  orderId: z.string().max(100).nullable().optional(),
}).strict();

export const supportReplySchema = z.object({ body: z.string().trim().min(1).max(5000) }).strict();

export const returnRequestSchema = z.object({
  saleId: z.string().min(1).max(100),
  reason: z.string().trim().min(3).max(1000),
  items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int().positive().max(100000) }).strict()).min(1).max(100),
}).strict();

export const refundSchema = z.object({
  amount: z.number().finite().nonnegative(),
  method: z.enum(["MANUAL_TRANSFER", "ORIGINAL_METHOD", "CASH"]).default("MANUAL_TRANSFER"),
}).strict();
