import { NextResponse } from "next/server";

import { getJson, batchCommit, withConflictRetry } from "@/lib/github";
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

    return success(await withConflictRetry(async () => {
      const [salesFile, logsFile] = await Promise.all([
        getJson<Sale[]>("sales.json", [], { cache: false }),
        getJson<{ id: string; action: string; entityId?: string; createdAt: string }[]>("activity-logs.json", [], { cache: false }),
      ]);

      const index = salesFile.data.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("NOT_FOUND");

      const currentSale = salesFile.data[index];
      const shippingStatus = body.shippingStatus as ShippingStatus | undefined;
      const shippingMethod = body.shippingMethod as ShippingMethod | null | undefined;
      const trackingCode = normalizeString(body.trackingCode);
      const shippingCompany = normalizeString(body.shippingCompany) || null;
      const customTrackingUrl = normalizeString(body.trackingUrl) || null;

      if (shippingStatus && !SHIPPING_STATUSES.includes(shippingStatus)) throw new Error("INVALID_SHIPPING_STATUS");
      if (shippingMethod && !SHIPPING_METHODS.includes(shippingMethod)) throw new Error("INVALID_SHIPPING_METHOD");
      if (trackingCode && trackingCode.length < 4) throw new Error("INVALID_TRACKING_CODE");
      if (trackingCode.length > 100) throw new Error("INVALID_TRACKING_CODE");

      const nextStatus = shippingStatus ?? currentSale.shippingStatus ?? "PENDING";
      const nextMethod = shippingMethod === undefined ? (currentSale.shippingMethod ?? null) : shippingMethod;
      const nextTrackingCode = trackingCode || null;
      let trackingUrl = customTrackingUrl;
      if (!trackingUrl && nextTrackingCode) trackingUrl = getShippingTrackingUrl(nextMethod, nextTrackingCode);

      let shippedAt = currentSale.shippedAt ?? null;
      if (nextStatus === "SHIPPED" && currentSale.shippingStatus !== "SHIPPED") shippedAt = new Date().toISOString();
      if (nextStatus === "DELIVERED" && !shippedAt) shippedAt = new Date().toISOString();
      if (nextStatus === "PENDING" || nextStatus === "PROCESSING") shippedAt = null;

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

      await batchCommit([
        {
          path: "sales.json",
          data: nextSales,
          message: `Update shipping ${id}`,
          expectedSha: salesFile.sha || undefined,
        },
        {
          path: "activity-logs.json",
          data: [
            ...logsFile.data,
            { id: crypto.randomUUID(), action: "SALE_SHIPPING_UPDATED", entityId: id, createdAt: new Date().toISOString() },
          ],
          message: `Audit shipping ${id}`,
          expectedSha: logsFile.sha || undefined,
        },
      ]);

      return updatedSale;
    }));
  } catch (error) {
    console.error("PATCH /api/admin/sales/[id]/shipping", error);
    const message = error instanceof Error ? error.message : "خطا در ذخیره اطلاعات ارسال.";
    const code = message.startsWith("INVALID_") || message === "NOT_FOUND" ? message : "SERVER_ERROR";
    return failure(code, message, message === "NOT_FOUND" ? 404 : 500);
  }
}
