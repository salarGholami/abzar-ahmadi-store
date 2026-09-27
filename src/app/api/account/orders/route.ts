import { NextResponse } from "next/server";

import { getJson } from "@/lib/github";
import { getSession } from "@/lib/auth";
import type { Sale, SaleItem } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "ابتدا وارد حساب کاربری شوید.",
          },
        },
        { status: 401 },
      );
    }

    const [salesFile, itemsFile] = await Promise.all([
      getJson<Sale[]>("sales.json", []),

      getJson<SaleItem[]>("sale-items.json", []),
    ]);

    const orders = salesFile.data
      .filter((sale) => sale.customerUserId === session.id)
      .map((sale) => ({
        ...sale,

        shippingStatus: sale.shippingStatus ?? "PENDING",

        trackingCode: sale.trackingCode ?? null,

        shippingMethod: sale.shippingMethod ?? null,

        shippingCompany: sale.shippingCompany ?? null,

        shippedAt: sale.shippedAt ?? null,

        trackingUrl: sale.trackingUrl ?? null,

        items: itemsFile.data.filter((item) => item.saleId === sale.id),
      }));

    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("GET /api/account/orders", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "خطا در دریافت سفارش‌ها.",
        },
      },
      { status: 500 },
    );
  }
}
