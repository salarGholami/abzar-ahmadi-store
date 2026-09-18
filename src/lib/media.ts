import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getJsonFile } from "./github";

const MAX_BYTES = 5 * 1024 * 1024;
const allowed = new Map<string, string>([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/gif", "gif"]
]);

function githubEnabled() {
  return Boolean(process.env.GITHUB_OWNER && process.env.GITHUB_REPO && process.env.GITHUB_TOKEN);
}

function githubEnv() {
  return { owner: process.env.GITHUB_OWNER!, repo: process.env.GITHUB_REPO!, branch: process.env.GITHUB_BRANCH || "main", base: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/+|\/+$/g, "") };
}

function githubApi(relativePath: string) {
  const e = githubEnv();
  return `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${e.base}/${relativePath.replace(/^\/+/, "")}`;
}

async function githubRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export function validateImage(file: File) {
  if (!allowed.has(file.type)) throw new Error("فرمت تصویر باید JPG، PNG، WEBP یا GIF باشد.");
  if (file.size <= 0 || file.size > MAX_BYTES) throw new Error("حجم تصویر باید حداکثر ۵ مگابایت باشد.");
}

export async function uploadMedia(file: File, folder: "products" | "receipts", ownerId: string) {
  validateImage(file);
  const extension = allowed.get(file.type)!;
  const safeName = `${crypto.randomUUID()}.${extension}`;
  const relative = `media/${folder}/${ownerId}/${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!githubEnabled()) {
    const local = path.join(process.cwd(), "public", "uploads", folder, ownerId, safeName);
    await fs.mkdir(path.dirname(local), { recursive: true });
    await fs.writeFile(local, bytes);
    return { path: relative, url: `/uploads/${folder}/${ownerId}/${safeName}`, fileName: file.name };
  }

  await githubRequest(githubApi(relative), {
    method: "PUT",
    body: JSON.stringify({
      message: `Upload ${folder} media ${safeName}`,
      content: bytes.toString("base64"),
      branch: githubEnv().branch
    })
  });

  const e = githubEnv();
  return {
    path: relative,
    url: `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.branch}/${e.base}/${relative}`,
    fileName: file.name
  };
}

export async function deleteMedia(relative: string) {
  if (!relative) return;
  if (!githubEnabled()) {
    await fs.rm(path.join(process.cwd(), "public", "uploads", relative.replace(/^media\//, "")), { force: true }).catch(() => undefined);
    return;
  }
  const f = await getJsonFile<unknown>(relative);
  const e = githubEnv();
  await githubRequest(githubApi(relative), { method: "DELETE", body: JSON.stringify({ message: `Delete media ${relative}`, sha: f.sha, branch: e.branch }) });
}

export function mediaPathFromUrl(url: string) {
  if (!url) return "";
  const marker = "/media/";
  const index = url.indexOf(marker);
  if (index >= 0) return url.slice(index + 1);
  return "";
}
