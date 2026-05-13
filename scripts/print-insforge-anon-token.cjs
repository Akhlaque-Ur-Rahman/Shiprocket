/**
 * Prints a non-expiring anonymous JWT for browser use (RLS still applies).
 * Reads admin key from .insforge/project.json (never commit that folder).
 */
const fs = require("fs");
const path = require("path");

const projectPath = path.join(__dirname, "..", ".insforge", "project.json");
if (!fs.existsSync(projectPath)) {
  console.error("Missing .insforge/project.json. Run: npx @insforge/cli link --api-base-url <url> --api-key <key>");
  process.exit(1);
}

const { api_key: apiKey, oss_host: ossHost } = JSON.parse(fs.readFileSync(projectPath, "utf8"));
if (!apiKey || !ossHost) {
  console.error(".insforge/project.json must include api_key and oss_host.");
  process.exit(1);
}

const base = ossHost.replace(/\/$/, "");

(async () => {
  const res = await fetch(`${base}/api/auth/tokens/anon`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(res.status, t);
    process.exit(1);
  }
  const data = await res.json();
  console.log(data.accessToken || data);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
