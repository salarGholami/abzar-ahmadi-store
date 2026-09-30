import "server-only";

import { hashPassword } from "@/lib/auth";
import { batchCommit, getJson, withConflictRetry, type JsonCommit } from "@/lib/github";
import { permissions } from "@/lib/permissions";
import type { PublicRole, Role } from "@/lib/roles";
import type { AppUser, Customer, Supplier } from "@/lib/types";

export type NewUserInput = {
  name: string;
  phone: string;
  password: string;
  role: PublicRole | "ADMIN";
  permissions?: string[];
  /**
   * Existing business profile to attach to this login.
   * This is mandatory for admin-created supplier/customer accounts.
   */
  profileId?: string;
};

export async function createUserWithProfile({
  name,
  phone,
  password,
  role,
  permissions: requestedPermissions,
  profileId,
}: NewUserInput): Promise<AppUser> {
  return withConflictRetry(async () => {
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();

    const [usersFile, customersFile, suppliersFile] = await Promise.all([
      getJson<AppUser[]>("users.json", [], { cache: false }),
      getJson<Customer[]>("customers.json", [], { cache: false }),
      getJson<Supplier[]>("suppliers.json", [], { cache: false }),
    ]);

    if (usersFile.data.some((item) => item.phone === phone)) {
      throw new Error("DUPLICATE_PHONE");
    }

    let supplierId: string | undefined;
    let customerProfileId: string | undefined;

    if (role === "SUPPLIER") {
      const profile = profileId
        ? suppliersFile.data.find((item) => item.id === profileId)
        : suppliersFile.data.find((item) => item.phone === phone);

      supplierId = profile?.id ?? userId;
    }

    if (role === "CUSTOMER") {
      const profile = profileId
        ? customersFile.data.find((item) => item.id === profileId)
        : customersFile.data.find((item) => item.phone === phone);

      customerProfileId = profile?.id;
    }

    const user: AppUser = {
      id: userId,
      name,
      phone,
      role,
      isOwner: false,
      permissions:
        role === "ADMIN"
          ? [...new Set(requestedPermissions ?? permissions.MANAGER)]
          : role === "SUPPLIER"
            ? [...permissions.SUPPLIER]
            : [...permissions.CUSTOMER],
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
      ...(supplierId ? { supplierId } : {}),
    };

    const nextUsers = [...usersFile.data, user];
    const commits: JsonCommit[] = [
      {
        path: "users.json",
        data: nextUsers,
        message: `Create ${role.toLowerCase()} user ${user.id}`,
        expectedSha: usersFile.sha || undefined,
      },
    ];

    if (role === "CUSTOMER") {
      const nextCustomers = customersFile.data.some(
        (item) => item.id === customerProfileId,
      )
        ? customersFile.data.map((item) =>
            item.id === customerProfileId
              ? { ...item, userId: user.id, name, phone, updatedAt: now }
              : item,
          )
        : [
            ...customersFile.data,
            {
              id: crypto.randomUUID(),
              userId: user.id,
              name,
              phone,
              address: "",
              balance: 0,
              createdAt: now,
              updatedAt: now,
            } satisfies Customer,
          ];

      commits.push({
        path: "customers.json",
        data: nextCustomers,
        message: `Create customer profile ${user.id}`,
        expectedSha: customersFile.sha || undefined,
      });
    }

    if (role === "SUPPLIER") {
      const exists = suppliersFile.data.some((item) => item.id === supplierId);
      const nextSuppliers = exists
        ? suppliersFile.data.map((item) =>
            item.id === supplierId
              ? { ...item, userId: user.id, name, phone, updatedAt: now }
              : item,
          )
        : [
            ...suppliersFile.data,
            {
              id: supplierId!,
              userId: user.id,
              name,
              phone,
              address: "",
              createdAt: now,
              updatedAt: now,
            } as Supplier & { userId: string },
          ];

      commits.push({
        path: "suppliers.json",
        data: nextSuppliers,
        message: `Create supplier profile ${user.id}`,
        expectedSha: suppliersFile.sha || undefined,
      });
    }

    await batchCommit(commits);
    return user;
  });
}

export async function syncUserProfile(user: AppUser) {
  const now = new Date().toISOString();

  return withConflictRetry(async () => {
    const [usersFile, customersFile, suppliersFile] = await Promise.all([
      getJson<AppUser[]>("users.json", [], { cache: false }),
      getJson<Customer[]>("customers.json", [], { cache: false }),
      getJson<Supplier[]>("suppliers.json", [], { cache: false }),
    ]);

    const commits: JsonCommit[] = [
      {
        path: "users.json",
        data: usersFile.data.map((item) =>
          item.id === user.id
            ? { ...item, name: user.name, phone: user.phone, updatedAt: now }
            : item,
        ),
        message: `Sync user profile ${user.id}`,
        expectedSha: usersFile.sha || undefined,
      },
    ];

    if (user.role === "CUSTOMER") {
      commits.push({
        path: "customers.json",
        data: customersFile.data.map((item) =>
          item.userId === user.id
            ? { ...item, name: user.name, phone: user.phone, updatedAt: now }
            : item,
        ),
        message: `Sync customer profile ${user.id}`,
        expectedSha: customersFile.sha || undefined,
      });
    }

    if (user.role === "SUPPLIER" && user.supplierId) {
      commits.push({
        path: "suppliers.json",
        data: suppliersFile.data.map((item) =>
          item.id === user.supplierId
            ? { ...item, name: user.name, phone: user.phone, updatedAt: now }
            : item,
        ),
        message: `Sync supplier profile ${user.id}`,
        expectedSha: suppliersFile.sha || undefined,
      });
    }

    await batchCommit(commits);
  });
}

export function normalizeAdminPermissions(
  role: Role,
  requested: unknown,
): string[] {
  if (role !== "ADMIN") return [];
  if (!Array.isArray(requested)) return [...permissions.MANAGER];

  return [
    ...new Set(
      requested.filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0 && value !== "*",
      ),
    ),
  ];
}
