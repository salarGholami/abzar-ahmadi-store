import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, rmSync } from "node:fs";
import { join } from "node:path";

const backup = process.env.BACKUP_REPO;
if (!backup || !existsSync(backup)) { console.error("BACKUP_REPO must point to a git mirror backup."); process.exit(1); }
if (process.env.CONFIRM_RESTORE !== "YES") { console.error("Refusing restore. Set CONFIRM_RESTORE=YES explicitly."); process.exit(1); }
const targetRoot = process.env.DATA_DIR || join(process.cwd(), "data");
const tmp = join(process.cwd(), ".restore-data.tar");
mkdirSync(targetRoot, { recursive: true });
try {
  const fd = openSync(tmp, "w");
  execFileSync("git", ["--git-dir", backup, "archive", "--format=tar", "refs/heads/main", "data"], { stdio: ["ignore", fd, "inherit"] });
  execFileSync("tar", ["-xf", tmp, "--strip-components=1", "-C", targetRoot, "data"], { stdio: "inherit" });
  console.log(`Restored data from ${backup} into ${targetRoot}`);
} finally { rmSync(tmp, { force: true }); }
