import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

const knownErrors: Record<string, [string, string, number]> = {
  UNAUTHENTICATED: ["UNAUTHENTICATED", "برای این عملیات باید وارد حساب شوید", 401],
  FORBIDDEN: ["FORBIDDEN", "دسترسی لازم برای این عملیات را ندارید", 403],
  NOT_FOUND: ["NOT_FOUND", "مورد موردنظر یافت نشد", 404],
  PRODUCT_NOT_FOUND: ["PRODUCT_NOT_FOUND", "یکی از محصولات انتخابی یافت نشد", 404],
  INVALID_QUANTITY: ["INVALID_QUANTITY", "تعداد وارد شده نامعتبر است", 400],
  INVALID_COST: ["INVALID_COST", "قیمت واحد وارد شده نامعتبر است", 400],
  VALIDATION_ERROR: ["VALIDATION_ERROR", "اطلاعات وارد شده ناقص یا نامعتبر است", 400],
  INVALID_ROLE: ["INVALID_ROLE", "نوع حساب نامعتبر است", 400],
  DUPLICATE_PHONE: ["DUPLICATE_PHONE", "این شماره موبایل قبلاً ثبت شده است", 409],
  CANNOT_DELETE_SELF: ["CANNOT_DELETE_SELF", "امکان حذف حساب کاربری خودتان وجود ندارد", 400],
  INVALID_CREDENTIALS: ["INVALID_CREDENTIALS", "شماره موبایل یا رمز عبور اشتباه است", 401],
  IMAGE_NOT_FOUND: ["IMAGE_NOT_FOUND", "تصویر موردنظر یافت نشد", 404],
  IMAGE_ID_REQUIRED: ["IMAGE_ID_REQUIRED", "شناسه تصویر الزامی است", 400],
  USER_NOT_FOUND: ["USER_NOT_FOUND", "کاربر موردنظر یافت نشد", 404],
  RECEIPT_REQUIRED: ["RECEIPT_REQUIRED", "برای ثبت سفارش، ابتدا تصویر رسید واریز را بارگذاری کنید", 400],
  RECEIPT_MUST_BE_UPLOADED_URL: ["RECEIPT_MUST_BE_UPLOADED_URL", "آدرس رسید نامعتبر است؛ رسید را دوباره بارگذاری کنید", 400],
  ONLY_CUSTOMER_RECEIPT: ["ONLY_CUSTOMER_RECEIPT", "بارگذاری رسید فقط برای سفارش‌های آنلاین مشتری مجاز است", 403]
};

const hasPersian = (s: string) => /[\u0600-\u06FF]/.test(s);

export function fail(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  if (Object.hasOwn(knownErrors, msg)) {
    const [code, message, status] = knownErrors[msg];
    return NextResponse.json({ success: false, error: { code, message } }, { status });
  }
  if (hasPersian(msg)) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: msg } }, { status: 400 });
  }
  const message = process.env.NODE_ENV === "production" ? "خطای داخلی سرور" : msg;
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
}

export async function jsonBody(req: Request) {
  return req.json();
}
