import { JsonRepository } from "./repository";
import type {
  Product, Customer, Supplier, Sale, SaleItem, Purchase, PurchaseItem,
  FinanceEntry, CheckRecord, InventoryMovement, AppUser, Category
} from "./types";
import seedProducts from "@/data/seed/products.json";

export const productRepo = new JsonRepository<Product>("products.json", seedProducts as Product[]);
export const categoryRepo = new JsonRepository<Category>("categories.json");
export const customerRepo = new JsonRepository<Customer>("customers.json");
export const supplierRepo = new JsonRepository<Supplier>("suppliers.json");
export const saleRepo = new JsonRepository<Sale>("sales.json");
export const saleItemRepo = new JsonRepository<SaleItem>("sale-items.json");
export const purchaseRepo = new JsonRepository<Purchase>("purchases.json");
export const purchaseItemRepo = new JsonRepository<PurchaseItem>("purchase-items.json");
export const inventoryRepo = new JsonRepository<InventoryMovement>("inventory.json");
export const financeRepo = new JsonRepository<FinanceEntry>("finance.json");
export const checkRepo = new JsonRepository<CheckRecord>("checks.json");
export const userRepo = new JsonRepository<AppUser>("users.json");
export const activityRepo = new JsonRepository<{ id: string; action: string; entityId?: string; createdAt: string; [k: string]: unknown }>("activity-logs.json");
