import { requirePermission } from "@/lib/permissions";
import { getJson, batchCommit, withConflictRetry } from "@/lib/github";
import { ok, fail } from "@/lib/http";
import type { Product, InventoryMovement } from "@/lib/types";

export async function POST(req: Request) {
  try {
    await requirePermission("inventory.adjust");
    const body = await req.json();
    const quantity = Number(body.quantity);

    if (!body.productId || !Number.isFinite(quantity) || quantity === 0) {
      throw new Error("VALIDATION_ERROR");
    }

    return ok(await withConflictRetry(async () => {
      const [productsFile, inventoryFile, logsFile] = await Promise.all([
        getJson<Product[]>("products.json", [], { cache: false }),
        getJson<InventoryMovement[]>("inventory.json", [], { cache: false }),
        getJson<Record<string, unknown>[]>("activity-logs.json", [], { cache: false }),
      ]);

      const index = productsFile.data.findIndex((item) => item.id === body.productId);
      if (index < 0) throw new Error("PRODUCT_NOT_FOUND");

      const now = new Date().toISOString();
      const nextProducts = [...productsFile.data];
      nextProducts[index] = {
        ...nextProducts[index],
        stock: Number(nextProducts[index].stock || 0) + quantity,
        updatedAt: now,
      };

      const nextInventory = [...inventoryFile.data];
      const row = nextInventory.find((item) => item.productId === body.productId);
      if (row) {
        row.quantity = Number(row.quantity || 0) + quantity;
        row.reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 200) : row.reason;
        row.updatedAt = now;
      } else {
        nextInventory.push({
          id: crypto.randomUUID(),
          productId: body.productId,
          quantity,
          reason: typeof body.reason === "string" ? body.reason.trim().slice(0, 200) : "MANUAL_ADJUSTMENT",
          updatedAt: now,
        });
      }

      await batchCommit([
        { path: "products.json", data: nextProducts, message: "Inventory adjustment", expectedSha: productsFile.sha || undefined },
        { path: "inventory.json", data: nextInventory, message: "Inventory movement", expectedSha: inventoryFile.sha || undefined },
        {
          path: "activity-logs.json",
          data: [
            ...logsFile.data,
            {
              id: crypto.randomUUID(),
              action: "INVENTORY_ADJUSTED",
              entityId: body.productId,
              quantity,
              reason: body.reason || "",
              createdAt: now,
            },
          ],
          message: "Inventory audit",
          expectedSha: logsFile.sha || undefined,
        },
      ]);

      return nextProducts[index];
    }));
  } catch (e) {
    return fail(e);
  }
}
