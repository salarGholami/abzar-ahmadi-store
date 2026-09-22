import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { getJsonFile } from "./github";

/* -------------------------------------------------------------------------- */
/* Config                                                                      */
/* -------------------------------------------------------------------------- */

const MAX_BYTES = 5 * 1024 * 1024;

const allowed = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export type MediaFolder =
  | "products"
  | "receipts"
  | "banners"
  | "articles"
  | "support";

/* -------------------------------------------------------------------------- */
/* GitHub                                                                      */
/* -------------------------------------------------------------------------- */

function githubEnabled() {
  return Boolean(
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO &&
    process.env.GITHUB_TOKEN,
  );
}

function githubEnv() {
  return {
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    branch: process.env.GITHUB_BRANCH || "main",
    base: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/+|\/+$/g, ""),
  };
}

function githubApi(relativePath: string) {
  const env = githubEnv();

  return `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${env.base}/${relativePath.replace(
    /^\/+/,
    "",
  )}`;
}

async function githubRequest<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export function validateImage(file: File) {
  if (!allowed.has(file.type)) {
    throw new Error("فرمت تصویر باید JPG، PNG، WEBP یا GIF باشد.");
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("حجم تصویر باید حداکثر ۵ مگابایت باشد.");
  }
}

/* -------------------------------------------------------------------------- */
/* Upload                                                                      */
/* -------------------------------------------------------------------------- */

export async function uploadMedia(
  file: File,
  folder: MediaFolder,
  ownerId: string,
) {
  validateImage(file);

  const extension = allowed.get(file.type)!;

  const safeName = `${crypto.randomUUID()}.${extension}`;

  const relative = `media/${folder}/${ownerId}/${safeName}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  /* Local development */
  if (!githubEnabled()) {
    const local = path.join(
      process.cwd(),
      "public",
      "uploads",
      folder,
      ownerId,
      safeName,
    );

    await fs.mkdir(path.dirname(local), {
      recursive: true,
    });

    await fs.writeFile(local, bytes);

    return {
      path: relative,
      url: `/uploads/${folder}/${ownerId}/${safeName}`,
      fileName: file.name,
    };
  }

  /* GitHub storage */
  await githubRequest(githubApi(relative), {
    method: "PUT",
    body: JSON.stringify({
      message: `Upload ${folder} media ${safeName}`,
      content: bytes.toString("base64"),
      branch: githubEnv().branch,
    }),
  });

  const env = githubEnv();

  return {
    path: relative,
    url: `https://raw.githubusercontent.com/${env.owner}/${env.repo}/${env.branch}/${env.base}/${relative}`,
    fileName: file.name,
  };
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                      */
/* -------------------------------------------------------------------------- */

export async function deleteMedia(relative: string) {
  if (!relative) return;

  if (!githubEnabled()) {
    await fs
      .rm(
        path.join(
          process.cwd(),
          "public",
          "uploads",
          relative.replace(/^media\//, ""),
        ),
        { force: true },
      )
      .catch(() => undefined);

    return;
  }

  const file = await getJsonFile<unknown>(relative);

  const env = githubEnv();

  await githubRequest(githubApi(relative), {
    method: "DELETE",
    body: JSON.stringify({
      message: `Delete media ${relative}`,
      sha: file.sha,
      branch: env.branch,
    }),
  });
}

/* -------------------------------------------------------------------------- */
/* URL                                                                         */
/* -------------------------------------------------------------------------- */

export function mediaPathFromUrl(url: string) {
  if (!url) return "";

  const marker = "/media/";
  const index = url.indexOf(marker);

  if (index >= 0) {
    return url.slice(index + 1);
  }

  return "";
}
