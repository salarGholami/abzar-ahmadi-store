import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
const output = process.env.BACKUP_DIR || join(process.cwd(), "backups");

if (!owner || !repo || !token) {
  console.error("GITHUB_OWNER, GITHUB_REPO and GITHUB_TOKEN are required.");
  process.exit(1);
}

mkdirSync(output, { recursive: true });
const target = join(output, `${repo}-${new Date().toISOString().replace(/[:.]/g, "-")}.git`);
const url = `https://github.com/${owner}/${repo}.git`;

console.log(`Creating repository backup: ${target}`);
execFileSync("git", [
  "-c", `http.extraHeader=Authorization: Bearer ${token}`,
  "clone", "--mirror", url, target,
], { stdio: "inherit" });
console.log("Backup completed.");
