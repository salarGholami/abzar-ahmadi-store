const base = process.env.BASE_URL || "http://localhost:3000";

async function request(path, init) {
  const response = await fetch(`${base}${path}`, init);
  let body = null;
  try { body = await response.json(); } catch {}
  return { response, body };
}

const checks = [
  ["health", "/api/health", 200],
  ["public products", "/api/products", 200],
  ["protected dashboard", "/api/account/profile", 401],
  ["invalid login", "/api/auth/login", 400],
];

let failed = 0;
for (const [name, path, expected] of checks) {
  const init = name === "invalid login" ? { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } : undefined;
  const { response } = await request(path, init);
  const ok = response.status === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${response.status} (expected ${expected})`);
  if (!ok) failed += 1;
}

process.exitCode = failed ? 1 : 0;
