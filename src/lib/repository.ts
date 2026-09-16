import "server-only";

import { getJson, mutateJson } from "./github";

export type Entity = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export class NotFoundError extends Error {
  constructor(id: string) {
    super("NOT_FOUND");
    this.name = "NotFoundError";
    this.cause = id;
  }
}

export class JsonRepository<T extends Entity> {
  constructor(
    private readonly file: string,
    private readonly fallback: T[] = [],
  ) {}

  async all(): Promise<T[]> {
    return (await getJson<T[]>(this.file, this.fallback)).data;
  }

  async find(id: string): Promise<T | null> {
    const items = await this.all();

    return items.find((item) => item.id === id) ?? null;
  }

  async create(input: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const now = new Date().toISOString();

    const item = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;

    await mutateJson<T[], void>(
      this.file,
      this.fallback,
      (current) => ({
        next: [...current, item],
        result: undefined,
      }),
      `Create ${item.id}`,
    );

    return item;
  }

  async update(id: string, input: Partial<T>): Promise<T> {
    return mutateJson<T[], T>(
      this.file,
      this.fallback,
      (current) => {
        const index = current.findIndex((item) => item.id === id);

        if (index < 0) {
          throw new NotFoundError(id);
        }

        const updated = {
          ...current[index],
          ...input,
          id,
          updatedAt: new Date().toISOString(),
        } as T;

        const next = current.slice();

        next[index] = updated;

        return {
          next,
          result: updated,
        };
      },
      `Update ${id}`,
    );
  }

  async remove(id: string): Promise<void> {
    await mutateJson<T[], void>(
      this.file,
      this.fallback,
      (current) => {
        const next = current.filter((item) => item.id !== id);

        if (next.length === current.length) {
          throw new NotFoundError(id);
        }

        return {
          next,
          result: undefined,
        };
      },
      `Delete ${id}`,
    );
  }
}
