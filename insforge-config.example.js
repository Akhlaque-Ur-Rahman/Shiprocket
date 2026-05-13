/**
 * Example: copy to insforge-config.local.js (gitignored) and load it before insforge-client.js in HTML,
 * or edit insforge-config.js on your machine only (do not commit tokens).
 */
window.__INSFORGE_CONFIG = {
  enabled: true,
  baseUrl: "https://YOUR_APPKEY.YOUR_REGION.insforge.app",
  anonAccessToken: "PASTE_ANON_JWT_FROM_print-insforge-anon-token_script",
  demoTable: "demo_shipments",
};
