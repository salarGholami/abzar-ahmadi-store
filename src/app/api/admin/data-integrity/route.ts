import { ok, fail } from "@/lib/http";
import { requirePermission } from "@/lib/permissions";
import { getJson } from "@/lib/github";
import type {
  AppUser,
  Customer,
  Supplier,
  Product,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  InventoryMovement,
  PaymentTransaction,
  FinanceEntry,
} from "@/lib/types";

type Issue = {
  code: string;
  severity: "ERROR" | "WARNING";
  entity: string;
  entityId?: string;
  message: string;
};

export async function GET() {
  try {
    await requirePermission("settings.read");

    const [
      usersF, customersF, suppliersF, productsF, salesF, saleItemsF,
      purchasesF, purchaseItemsF, inventoryF, paymentsF, financeF,
    ] = await Promise.all([
      getJson<AppUser[]>("users.json", [], { cache: false }),
      getJson<Customer[]>("customers.json", [], { cache: false }),
      getJson<Supplier[]>("suppliers.json", [], { cache: false }),
      getJson<Product[]>("products.json", [], { cache: false }),
      getJson<Sale[]>("sales.json", [], { cache: false }),
      getJson<SaleItem[]>("sale-items.json", [], { cache: false }),
      getJson<Purchase[]>("purchases.json", [], { cache: false }),
      getJson<PurchaseItem[]>("purchase-items.json", [], { cache: false }),
      getJson<InventoryMovement[]>("inventory.json", [], { cache: false }),
      getJson<PaymentTransaction[]>("payment-transactions.json", [], { cache: false }),
      getJson<FinanceEntry[]>("finance.json", [], { cache: false }),
    ]);

    const issues: Issue[] = [];
    const userIds = new Set(usersF.data.map((u) => u.id));
    const customerIds = new Set(customersF.data.map((c) => c.id));
    const supplierIds = new Set(suppliersF.data.map((s) => s.id));
    const productIds = new Set(productsF.data.map((p) => p.id));
    const saleIds = new Set(salesF.data.map((s) => s.id));
    const purchaseIds = new Set(purchasesF.data.map((p) => p.id));
    const paymentIds = new Set(paymentsF.data.map((p) => p.id));

    for (const customer of customersF.data) {
      if (customer.userId && !userIds.has(customer.userId)) {
        issues.push({
          code: "CUSTOMER_ORPHAN_USER",
          severity: "WARNING",
          entity: "customers",
          entityId: customer.id,
          message: `مشتری ${customer.name} به حساب کاربری موجودی متصل نیست.`,
        });
      }
    }

    for (const supplier of suppliersF.data) {
      if (supplier.userId && !userIds.has(supplier.userId)) {
        issues.push({
          code: "SUPPLIER_ORPHAN_USER",
          severity: "WARNING",
          entity: "suppliers",
          entityId: supplier.id,
          message: `تأمین‌کننده ${supplier.name} به حساب کاربری موجودی متصل نیست.`,
        });
      }
    }

    for (const user of usersF.data.filter((u) => u.role === "CUSTOMER")) {
      const profile = customersF.data.find((c) => c.userId === user.id);
      if (!profile) {
        issues.push({
          code: "CUSTOMER_MISSING_PROFILE",
          severity: "ERROR",
          entity: "users",
          entityId: user.id,
          message: `حساب مشتری ${user.name} رکورد customers متناظر ندارد.`,
        });
      } else if (profile.name !== user.name || profile.phone !== user.phone) {
        issues.push({
          code: "CUSTOMER_PROFILE_MISMATCH",
          severity: "ERROR",
          entity: "customers",
          entityId: profile.id,
          message: `نام یا موبایل حساب ${user.name} با رکورد مشتری یکسان نیست.`,
        });
      }
    }

    for (const user of usersF.data.filter((u) => u.role === "SUPPLIER")) {
      if (!user.supplierId || !supplierIds.has(user.supplierId)) {
        issues.push({
          code: "SUPPLIER_MISSING_PROFILE",
          severity: "ERROR",
          entity: "users",
          entityId: user.id,
          message: `حساب تأمین‌کننده ${user.name} supplierId معتبر ندارد.`,
        });
      } else {
        const profile = suppliersF.data.find((s) => s.id === user.supplierId);
        if (profile && (profile.name !== user.name || profile.phone !== user.phone)) {
          issues.push({
            code: "SUPPLIER_PROFILE_MISMATCH",
            severity: "ERROR",
            entity: "suppliers",
            entityId: profile.id,
            message: `نام یا موبایل حساب ${user.name} با رکورد تأمین‌کننده یکسان نیست.`,
          });
        }
      }
    }

    for (const product of productsF.data) {
      for (const supplierId of product.supplierIds ?? []) {
        if (!supplierIds.has(supplierId)) {
          issues.push({
            code: "PRODUCT_INVALID_SUPPLIER",
            severity: "ERROR",
            entity: "products",
            entityId: product.id,
            message: `محصول ${product.title} به تأمین‌کننده‌ای متصل است که وجود ندارد.`,
          });
        }
      }
    }

    for (const item of saleItemsF.data) {
      if (!saleIds.has(item.saleId)) issues.push({ code: "ORPHAN_SALE_ITEM", severity: "ERROR", entity: "sale-items", entityId: item.id, message: "آیتم فروش بدون فروش والد." });
      if (!productIds.has(item.productId)) issues.push({ code: "SALE_ITEM_PRODUCT_MISSING", severity: "ERROR", entity: "sale-items", entityId: item.id, message: "محصول آیتم فروش وجود ندارد." });
    }

    for (const item of purchaseItemsF.data) {
      if (!purchaseIds.has(item.purchaseId)) issues.push({ code: "ORPHAN_PURCHASE_ITEM", severity: "ERROR", entity: "purchase-items", entityId: item.id, message: "آیتم خرید بدون خرید والد." });
      if (!productIds.has(item.productId)) issues.push({ code: "PURCHASE_ITEM_PRODUCT_MISSING", severity: "ERROR", entity: "purchase-items", entityId: item.id, message: "محصول آیتم خرید وجود ندارد." });
    }

    for (const movement of inventoryF.data) {
      if (!productIds.has(movement.productId)) {
        issues.push({
          code: "INVENTORY_PRODUCT_MISSING",
          severity: "ERROR",
          entity: "inventory",
          entityId: movement.id,
          message: "گردش انبار به محصول موجودی‌ندار متصل است.",
        });
      }
    }

    for (const sale of salesF.data) {
      if (sale.customerId && !customerIds.has(sale.customerId)) {
        issues.push({ code: "SALE_CUSTOMER_MISSING", severity: "WARNING", entity: "sales", entityId: sale.id, message: "فروش به مشتری حذف‌شده یا ناموجود اشاره می‌کند." });
      }
      if (sale.paymentTransactionId && !paymentIds.has(sale.paymentTransactionId)) {
        issues.push({ code: "SALE_PAYMENT_MISSING", severity: "WARNING", entity: "sales", entityId: sale.id, message: "تراکنش پرداخت فروش وجود ندارد." });
      }
    }

    const counts = {
      users: usersF.data.length,
      customers: customersF.data.length,
      suppliers: suppliersF.data.length,
      products: productsF.data.length,
      sales: salesF.data.length,
      purchases: purchasesF.data.length,
      inventory: inventoryF.data.length,
      finance: financeF.data.length,
    };

    return ok({
      healthy: issues.every((issue) => issue.severity !== "ERROR"),
      counts,
      summary: {
        errors: issues.filter((issue) => issue.severity === "ERROR").length,
        warnings: issues.filter((issue) => issue.severity === "WARNING").length,
      },
      issues,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return fail(error);
  }
}
