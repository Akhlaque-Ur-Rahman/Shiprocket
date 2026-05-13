(function () {
  /**
   * InsForge Records API: GET/POST with anon JWT or user access token (see insforge-auth-client.js).
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

  function getDbBearer() {
    if (typeof window.insforgeAuthGetAccessToken === "function") {
      var u = window.insforgeAuthGetAccessToken();
      if (u) return u;
    }
    var cfg = getConfig();
    return cfg.anonAccessToken || "";
  }

  /**
   * @param {string} table
   * @param {Record<string, string>} filters PostgREST-style
   * @returns {Promise<object[]>}
   */
  window.insforgeQueryRecords = async function insforgeQueryRecords(table, filters) {
    const cfg = getConfig();
    if (!cfg.baseUrl) {
      return [];
    }
    const bearer = getDbBearer();
    if (!bearer) {
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
        Authorization: `Bearer ${bearer}`,
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

  /**
   * @param {string} table
   * @param {object[]} rows array of row objects (InsForge expects JSON array body)
   * @returns {Promise<object[]>}
   */
  window.insforgePostRecords = async function insforgePostRecords(table, rows) {
    const cfg = getConfig();
    if (!cfg.baseUrl) {
      throw new Error("InsForge baseUrl missing");
    }
    const bearer = getDbBearer();
    if (!bearer) {
      throw new Error("No access token for write");
    }
    const base = cfg.baseUrl.replace(/\/$/, "");
    const url = `${base}/api/database/records/${encodeURIComponent(table)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errText = typeof body === "object" && body.message ? body.message : JSON.stringify(body);
      throw new Error(`InsForge ${res.status}: ${errText || res.statusText}`);
    }
    return normalizeRows(body);
  };

  window.insforgeIsEnabled = function insforgeIsEnabled() {
    const cfg = getConfig();
    return !!(cfg.enabled && cfg.baseUrl && getDbBearer());
  };

  /** True when InsForge URL is set and anon or user bearer can call the DB API */
  window.insforgeDbReadable = function insforgeDbReadable() {
    const cfg = getConfig();
    return !!(cfg.enabled && cfg.baseUrl && getDbBearer());
  };
})();
