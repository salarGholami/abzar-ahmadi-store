import { NextResponse } from "next/server";

import { getJson, batchCommit } from "@/lib/github";
import { requirePermission } from "@/lib/permissions";
import {
  getShippingTrackingUrl,
  SHIPPING_METHODS,
  SHIPPING_STATUSES,
} from "@/lib/shipping";
import type { Sale, ShippingMethod, ShippingStatus } from "@/lib/types";

function success<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

function failure(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await requirePermission("sales.read");

    const { id } = await params;

    const salesFile = await getJson<Sale[]>("sales.json", []);

    const sale = salesFile.data.find((item) => item.id === id);

    if (!sale) {
      return failure("NOT_FOUND", "فروش موردنظر پیدا نشد.", 404);
    }

    return success({
      saleId: sale.id,
      shippingStatus: sale.shippingStatus ?? "PENDING",
      trackingCode: sale.trackingCode ?? null,
      shippingMethod: sale.shippingMethod ?? null,
      shippingCompany: sale.shippingCompany ?? null,
      shippedAt: sale.shippedAt ?? null,
      trackingUrl: sale.trackingUrl ?? null,
    });
  } catch (error) {
    console.error("GET /api/admin/sales/[id]/shipping", error);

    return failure(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "خطا در دریافت اطلاعات ارسال.",
      500,
    );
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await requirePermission("sales.update");

    const { id } = await params;

    const body = await request.json();

    const salesFile = await getJson<Sale[]>("sales.json", []);

    const index = salesFile.data.findIndex((item) => item.id === id);

    if (index === -1) {
      return failure("NOT_FOUND", "فروش موردنظر پیدا نشد.", 404);
    }

    const currentSale = salesFile.data[index];

    const shippingStatus = body.shippingStatus as ShippingStatus | undefined;

    const shippingMethod = body.shippingMethod as
      | ShippingMethod
      | null
      | undefined;

    const trackingCode = normalizeString(body.trackingCode);

    const shippingCompany = normalizeString(body.shippingCompany) || null;

    const customTrackingUrl = normalizeString(body.trackingUrl) || null;

    if (shippingStatus && !SHIPPING_STATUSES.includes(shippingStatus)) {
      return failure("INVALID_SHIPPING_STATUS", "وضعیت ارسال نامعتبر است.");
    }

    if (shippingMethod && !SHIPPING_METHODS.includes(shippingMethod)) {
      return failure("INVALID_SHIPPING_METHOD", "روش ارسال نامعتبر است.");
    }

    if (trackingCode && trackingCode.length < 4) {
      return failure(
        "INVALID_TRACKING_CODE",
        "کد رهگیری باید حداقل ۴ کاراکتر باشد.",
      );
    }

    if (trackingCode.length > 100) {
      return failure(
        "INVALID_TRACKING_CODE",
        "کد رهگیری بیش از حد طولانی است.",
      );
    }

    const nextStatus =
      shippingStatus ?? currentSale.shippingStatus ?? "PENDING";

    const nextMethod =
      shippingMethod === undefined
        ? (currentSale.shippingMethod ?? null)
        : shippingMethod;

    const nextTrackingCode = trackingCode || null;

    let trackingUrl = customTrackingUrl;

    if (!trackingUrl && nextTrackingCode) {
      trackingUrl = getShippingTrackingUrl(nextMethod, nextTrackingCode);
    }

    let shippedAt = currentSale.shippedAt ?? null;

    if (nextStatus === "SHIPPED" && currentSale.shippingStatus !== "SHIPPED") {
      shippedAt = new Date().toISOString();
    }

    if (nextStatus === "DELIVERED" && !shippedAt) {
      shippedAt = new Date().toISOString();
    }

    if (nextStatus === "PENDING" || nextStatus === "PROCESSING") {
      shippedAt = null;
    }

    const updatedSale: Sale = {
      ...currentSale,

      shippingStatus: nextStatus,

      trackingCode: nextTrackingCode,

      shippingMethod: nextMethod,

      shippingCompany: shippingCompany ?? currentSale.shippingCompany ?? null,

      shippedAt,

      trackingUrl,

      updatedAt: new Date().toISOString(),
    };

    const nextSales = [...salesFile.data];

    nextSales[index] = updatedSale;

    const logsFile = await getJson<
      {
        id: string;
        action: string;
        entityId?: string;
        createdAt: string;
      }[]
    >("activity-logs.json", []);

    const log = {
      id: crypto.randomUUID(),
      action: "SALE_SHIPPING_UPDATED",
      entityId: id,
      createdAt: new Date().toISOString(),
    };

    await batchCommit([
      {
        path: "sales.json",
        data: nextSales,
        message: `Update shipping ${id}`,
        expectedSha: salesFile.sha || undefined,
      },
      {
        path: "activity-logs.json",
        data: [...logsFile.data, log],
        message: `Audit shipping ${id}`,
        expectedSha: logsFile.sha || undefined,
      },
    ]);

    return success(updatedSale);
  } catch (error) {
    console.error("PATCH /api/admin/sales/[id]/shipping", error);

    return failure(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "خطا در ذخیره اطلاعات ارسال.",
      500,
    );
  }
}
