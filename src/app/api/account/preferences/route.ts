import { ok, fail } from "@/lib/http";
import { getSession } from "@/lib/auth";
import { getJson, mutateJson } from "@/lib/github";
import type { UserPreferences } from "@/lib/types";

const FILE = "user-preferences.json";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHENTICATED");
    const file = await getJson<UserPreferences[]>(FILE, []);
    const mine = file.data.find((item) => item.userId === session.id);
    return ok({ theme: mine?.theme ?? null, readNotificationIds: mine?.readNotificationIds ?? [] });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHENTICATED");
    const body = (await req.json().catch(() => null)) as { theme?: unknown; readNotificationIds?: unknown } | null;
    if (!body) throw new Error("VALIDATION_ERROR");

    const patch: Partial<UserPreferences> = {};
    if (body.theme === "light" || body.theme === "dark") patch.theme = body.theme;
    if (Array.isArray(body.readNotificationIds)) {
      patch.readNotificationIds = body.readNotificationIds
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.slice(0, 120))
        .slice(-500);
    }
    if (!Object.keys(patch).length) throw new Error("VALIDATION_ERROR");

    const saved = await mutateJson<UserPreferences[], UserPreferences>(
      FILE,
      [],
      (all) => {
        const existing = all.find((item) => item.userId === session.id);
        const record: UserPreferences = { ...(existing || { userId: session.id }), ...patch, updatedAt: new Date().toISOString() };
        return { next: existing ? all.map((item) => (item === existing ? record : item)) : [...all, record], result: record };
      },
      `Preferences ${session.id}`,
    );
    return ok({ theme: saved.theme ?? null, readNotificationIds: saved.readNotificationIds ?? [] });
  } catch (error) {
    return fail(error);
  }
}
