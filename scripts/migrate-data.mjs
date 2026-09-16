import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "data");
mkdirSync(root, { recursive: true });
const ensure = (name, fallback) => { const file=join(root,name); if(!existsSync(file)) writeFileSync(file, JSON.stringify(fallback,null,2)+"\n"); };
const required = [
  ["order-events.json", []], ["inventory-reservations.json", []], ["idempotency.json", []], ["refunds.json", []],
  ["shipments.json", []], ["support-tickets.json", []], ["support-messages.json", []], ["notification-deliveries.json", []],
  ["media-assets.json", []], ["security-events.json", []], ["schema-version.json", { version: 2, migratedAt: new Date().toISOString() }],
];
for (const [name, fallback] of required) ensure(name, fallback);
const versionFile=join(root,"schema-version.json");
const current=JSON.parse(readFileSync(versionFile,"utf8"));
if (current.version < 2) { current.version=2; current.migratedAt=new Date().toISOString(); writeFileSync(versionFile,JSON.stringify(current,null,2)+"\n"); }
console.log(`Data schema v${current.version} ready.`);
