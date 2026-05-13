(function () {
  /**
   * Minimal InsForge Records API client (anon JWT).
   * Response shape: { value: Row[] } per InsForge REST.
   */
  function getConfig() {
    return window.__INSFORGE_CONFIG || {};
  }

  function normalizeRows(body) {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.value)) return body.value;
    if (Array.isArray(body.data)) return body.data;
    return [];
  }

  /**
   * @param {string} table
   * @param {Record<string, string>} filters PostgREST-style, e.g. { reference: "eq.FOO", tab_key: "eq.awb" }
   * @returns {Promise<object[]>}
   */
  window.insforgeQueryRecords = async function insforgeQueryRecords(table, filters) {
    const cfg = getConfig();
    if (!cfg.baseUrl || !cfg.anonAccessToken) {
      return [];
    }
    const base = cfg.baseUrl.replace(/\/$/, "");
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, v);
    });
    const url = `${base}/api/database/records/${encodeURIComponent(table)}?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cfg.anonAccessToken}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`InsForge ${res.status}: ${errText || res.statusText}`);
    }
    const body = await res.json();
    return normalizeRows(body);
  };

  window.insforgeIsEnabled = function insforgeIsEnabled() {
    const cfg = getConfig();
    return !!(cfg.enabled && cfg.baseUrl && cfg.anonAccessToken);
  };
})();
