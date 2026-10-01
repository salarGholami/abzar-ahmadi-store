import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidateTag } from "next/cache";

type GithubFile = { sha: string; content: string; encoding?: string; size?: number; download_url?: string | null };
type GithubRef = { object: { sha: string } };
type GithubCommit = { tree: { sha: string } };
type GithubBlob = { sha: string };
type GithubTree = { sha: string };
type GithubCreatedCommit = { sha: string };
type GithubWriteResult = { content?: { sha: string } | null; commit?: { sha: string } };

type ReadCacheEntry = {
  expiresAt: number;
  value: { data: unknown; sha: string; path: string };
};

const READ_CACHE_TTL_MS = 30_000;
const readCache = new Map<string, ReadCacheEntry>();

const cacheKey = (relative: string) => {
  const e = env();
  return `${e.owner}/${e.repo}/${e.branch}/${remotePath(relative)}`;
};

const invalidateReadCache = (relative: string) => {
  readCache.delete(cacheKey(relative));
};

/** Data files whose content feeds the cached public catalog. */
const CATALOG_FILES = new Set(["products.json", "categories.json", "brands.json", "sale-items.json"]);
export const CATALOG_CACHE_TAG = "catalog";

/** Called after every successful write: drops the in-process cache and expires the Next data cache for catalog files. */
const notifyWrite = (relative: string) => {
  invalidateReadCache(relative);
  if (!CATALOG_FILES.has(relative)) return;
  try {
    revalidateTag(CATALOG_CACHE_TAG, { expire: 0 });
  } catch {
    // Outside a Next request scope (scripts/tests): the short TTL still bounds staleness.
  }
};

type GithubEnv = {
  owner: string;
  repo: string;
  branch: string;
  base: string;
  token: string;
};

const localRoot = path.join(process.cwd(), "data");

const hasGithub = () => Boolean(
  process.env.GITHUB_OWNER &&
  process.env.GITHUB_REPO &&
  process.env.GITHUB_TOKEN
);

const env = (): GithubEnv => ({
  owner: process.env.GITHUB_OWNER || "",
  repo: process.env.GITHUB_REPO || "",
  branch: process.env.GITHUB_BRANCH || "main",
  base: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/+|\/+$/g, ""),
  token: process.env.GITHUB_TOKEN || "",
});

function api(p: string) {
  const e = env();
  return `https://api.github.com/repos/${e.owner}/${e.repo}/${p.replace(/^\/+/, "")}`;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const e = env();
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${e.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

const decode = (b: string) => Buffer.from(b.replace(/\n/g, ""), "base64").toString("utf8");
const encode = (s: string) => Buffer.from(s, "utf8").toString("base64");
const localPath = (relative: string) => path.join(localRoot, relative.replace(/^\/+/, ""));
const remotePath = (relative: string) => {
  const e = env();
  const clean = relative.replace(/^\/+/, "");
  return `${e.base}/${clean}`.replace(/^\/+/, "");
};

export async function getJsonFile<T>(relative: string, options: { cache?: boolean } = {}): Promise<{ data: T; sha: string; path: string }> {
  const useCache = options.cache !== false;
  const key = cacheKey(relative);

  if (useCache) {
    const cached = readCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as { data: T; sha: string; path: string };
    }
    if (cached) readCache.delete(key);
  }

  if (!hasGithub()) {
    const p = localPath(relative);
    try {
      const value = {
        data: JSON.parse(await fs.readFile(p, "utf8")) as T,
        sha: "local",
        path: p,
      };
      if (useCache) readCache.set(key, { expiresAt: Date.now() + READ_CACHE_TTL_MS, value });
      return value;
    } catch {
      throw new Error(`DATA_NOT_FOUND:${p}`);
    }
  }

  const e = env();
  const p = remotePath(relative);
  const raw = await request<GithubFile>(api(`contents/${p}`) + `?ref=${encodeURIComponent(e.branch)}`);

  // GitHub's Contents API only inlines `content` for files <= 1MB. Larger files
  // come back with content omitted (or non-base64 encoding) and a `download_url`
  // instead — decoding `content` in that case throws, so fetch the raw blob.
  if (raw.encoding !== "base64" || !raw.content) {
    if (!raw.download_url) throw new Error(`GITHUB_CONTENT_TOO_LARGE:${p}`);
    const res = await fetch(raw.download_url, { cache: "no-store" });
    if (!res.ok) throw new Error(`GitHub raw fetch ${res.status}: ${p}`);
    const value = {
      data: JSON.parse(await res.text()) as T,
      sha: raw.sha,
      path: p,
    };
    if (useCache) readCache.set(key, { expiresAt: Date.now() + READ_CACHE_TTL_MS, value });
    return value;
  }

  const value = {
    data: JSON.parse(decode(raw.content)) as T,
    sha: raw.sha,
    path: p,
  };
  if (useCache) readCache.set(key, { expiresAt: Date.now() + READ_CACHE_TTL_MS, value });
  return value;
}

export async function getJson<T>(relative: string, fallback: T, options: { cache?: boolean } = {}) {
  try {
    return await getJsonFile<T>(relative, options);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.startsWith("DATA_NOT_FOUND:") || message.startsWith("GitHub 404")) {
      return { data: fallback, sha: null as string | null, path: relative };
    }
    throw e;
  }
}

export async function writeJson<T>(relative: string, data: T, message: string, expectedSha?: string) {
  if (!hasGithub()) {
    const p = localPath(relative);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf8");
    notifyWrite(relative);
    return { local: true, path: p };
  }

  const e = env();
  const p = remotePath(relative);
  let sha = expectedSha;

  if (!sha) {
    try {
      sha = (await getJsonFile<T>(relative, { cache: false })).sha;
    } catch {
      sha = undefined;
    }
  }

  const body: Record<string, string> = {
    message,
    content: encode(JSON.stringify(data, null, 2) + "\n"),
    branch: e.branch,
  };

  if (sha && sha !== "local") body.sha = sha;

  const result = await request<GithubWriteResult>(api(`contents/${p}`), {
    method: "PUT",
    body: JSON.stringify(body),
  });
  notifyWrite(relative);
  return result;
}

export type JsonCommit<T = unknown> = {
  path: string;
  data: T;
  message?: string;
  expectedSha?: string;
};

/**
 * Atomically persists multiple JSON files in ONE GitHub commit.
 *
 * The old implementation called writeJson() once per file, producing 7+ sequential
 * GitHub commits for a single sale. That made checkout very slow and could leave
 * sales/products/inventory/finance out of sync when one request failed midway.
 */
export async function batchCommit(commits: JsonCommit[]): Promise<void> {
  if (!commits.length) return;

  if (!hasGithub()) {
    for (const commit of commits) {
      await writeJson(commit.path, commit.data, commit.message || "Update data", commit.expectedSha);
    }
    return;
  }

  const e = env();
  const ref = await request<GithubRef>(api(`git/ref/heads/${encodeURIComponent(e.branch)}`));
  const headSha = ref.object.sha;
  const headCommit = await request<GithubCommit>(api(`git/commits/${headSha}`));

  const blobs = await Promise.all(
    commits.map((commit) =>
      request<GithubBlob>(api("git/blobs"), {
        method: "POST",
        body: JSON.stringify({
          encoding: "base64",
          content: encode(JSON.stringify(commit.data, null, 2) + "\n"),
        }),
      })
    )
  );

  const tree = await request<GithubTree>(api("git/trees"), {
    method: "POST",
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: commits.map((commit, index) => ({
        path: remotePath(commit.path),
        mode: "100644",
        type: "blob",
        sha: blobs[index].sha,
      })),
    }),
  });

  const commitMessage = commits.length === 1
    ? (commits[0].message || "Update data")
    : `Update ${commits.length} data files`;

  const createdCommit = await request<GithubCreatedCommit>(api("git/commits"), {
    method: "POST",
    body: JSON.stringify({
      message: commitMessage,
      tree: tree.sha,
      parents: [headSha],
    }),
  });

  try {
    await request(api(`git/refs/heads/${encodeURIComponent(e.branch)}`), {
      method: "PATCH",
      body: JSON.stringify({
        sha: createdCommit.sha,
        force: false,
      }),
    });
  } catch (error) {
    throw new Error(`GitHub branch update failed after commit creation. ${String((error as Error).message || error)}`);
  }

  for (const commit of commits) notifyWrite(commit.path);
}

export async function deleteJson(relative: string, message: string) {
  if (!hasGithub()) {
    try {
      await fs.unlink(localPath(relative));
    } catch {
      // File is already absent.
    }
    notifyWrite(relative);
    return;
  }

  const f = await getJsonFile<unknown>(relative, { cache: false });
  const e = env();

  const result = await request<GithubWriteResult>(api(`contents/${f.path}`), {
    method: "DELETE",
    body: JSON.stringify({
      message,
      sha: f.sha,
      branch: e.branch,
    }),
  });
  notifyWrite(relative);
  return result;
}


function isConflictError(error: unknown) {
  const message = String((error as Error)?.message || error);
  return (
    message.includes("GitHub branch update failed") ||
    message.includes("GitHub 409") ||
    message.includes("GitHub 422") ||
    message.includes("does not match")
  );
}

/**
 * Read-modify-write with automatic retry on concurrent-write conflicts.
 * The mutator is re-run against fresh data on every attempt, so no update is lost.
 */
export async function mutateJson<T, R = void>(
  relative: string,
  fallback: T,
  mutator: (current: T) => { next: T; result: R },
  message: string,
  retries = 4,
): Promise<R> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const file = await getJson<T>(relative, fallback, { cache: false });
      const { next, result } = mutator(file.data);
      await batchCommit([{ path: relative, data: next, message, expectedSha: file.sha || undefined }]);
      return result;
    } catch (error) {
      lastError = error;
      if (!isConflictError(error) || attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1) + Math.random() * 200));
    }
  }
  throw lastError;
}

/** Runs an atomic multi-file operation again from scratch when a concurrent commit wins the race. */
export async function withConflictRetry<R>(operation: () => Promise<R>, retries = 4): Promise<R> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isConflictError(error) || attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1) + Math.random() * 300));
    }
  }
  throw lastError;
}
