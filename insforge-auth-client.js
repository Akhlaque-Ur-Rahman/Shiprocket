(function () {
  var ACCESS = "insforge_access_token";
  var REFRESH = "insforge_refresh_token";
  var USER = "insforge_user";

  function getConfig() {
    return window.__INSFORGE_CONFIG || {};
  }

  function baseUrl() {
    var cfg = getConfig();
    return (cfg.baseUrl || "").replace(/\/$/, "");
  }

  function authClientType() {
    var t = getConfig().authClientType;
    return t && typeof t === "string" ? t : "mobile";
  }

  function authQuery() {
    return "client_type=" + encodeURIComponent(authClientType());
  }

  window.insforgeAuthConfigured = function insforgeAuthConfigured() {
    var cfg = getConfig();
    return !!(cfg.enabled && cfg.baseUrl);
  };

  window.insforgeAuthGetAccessToken = function insforgeAuthGetAccessToken() {
    try {
      return sessionStorage.getItem(ACCESS) || "";
    } catch {
      return "";
    }
  };

  window.insforgeAuthGetRefreshToken = function insforgeAuthGetRefreshToken() {
    try {
      return sessionStorage.getItem(REFRESH) || "";
    } catch {
      return "";
    }
  };

  window.insforgeAuthGetStoredUser = function insforgeAuthGetStoredUser() {
    try {
      var raw = sessionStorage.getItem(USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  window.insforgeAuthHasSession = function insforgeAuthHasSession() {
    return !!window.insforgeAuthGetAccessToken();
  };

  function persistSession(accessToken, refreshToken, user) {
    try {
      if (accessToken) sessionStorage.setItem(ACCESS, accessToken);
      else sessionStorage.removeItem(ACCESS);
      if (refreshToken) sessionStorage.setItem(REFRESH, refreshToken);
      else sessionStorage.removeItem(REFRESH);
      if (user) sessionStorage.setItem(USER, JSON.stringify(user));
      else sessionStorage.removeItem(USER);
    } catch (e) {
      console.warn("insforgeAuth persistSession", e);
    }
    if (typeof window.__shiprocketDemoNavRefresh === "function") {
      window.__shiprocketDemoNavRefresh();
    }
  }

  window.insforgeAuthClearSession = function insforgeAuthClearSession() {
    persistSession(null, null, null);
  };

  async function parseJsonSafe(res) {
    var t = await res.text();
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return { raw: t };
    }
  }

  window.insforgeAuthRegister = async function insforgeAuthRegister(email, password, name) {
    var b = baseUrl();
    if (!b) throw new Error("InsForge baseUrl missing");
    var res = await fetch(b + "/api/auth/users?" + authQuery(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
        name: name || undefined,
      }),
    });
    var data = await parseJsonSafe(res);
    if (!res.ok) {
      var msg = (data && (data.message || data.error)) || res.statusText;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    if (data.requireEmailVerification) {
      return { requireEmailVerification: true, user: data.user || null };
    }
    persistSession(data.accessToken, data.refreshToken, data.user);
    return data;
  };

  window.insforgeAuthSignIn = async function insforgeAuthSignIn(email, password) {
    var b = baseUrl();
    if (!b) throw new Error("InsForge baseUrl missing");
    var res = await fetch(b + "/api/auth/sessions?" + authQuery(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    var data = await parseJsonSafe(res);
    if (!res.ok) {
      var msg = (data && (data.message || data.error)) || res.statusText;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    persistSession(data.accessToken, data.refreshToken, data.user);
    return data;
  };

  window.insforgeAuthRefresh = async function insforgeAuthRefresh() {
    var b = baseUrl();
    var rt = window.insforgeAuthGetRefreshToken();
    if (!b || !rt) return null;
    var res = await fetch(b + "/api/auth/refresh?" + authQuery(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    var data = await parseJsonSafe(res);
    if (!res.ok) {
      window.insforgeAuthClearSession();
      return null;
    }
    persistSession(data.accessToken, data.refreshToken || rt, data.user || window.insforgeAuthGetStoredUser());
    return data;
  };

  window.insforgeAuthGetCurrent = async function insforgeAuthGetCurrent() {
    var b = baseUrl();
    var token = window.insforgeAuthGetAccessToken();
    if (!b || !token) return null;
    var res = await fetch(b + "/api/auth/sessions/current", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
    });
    var data = await parseJsonSafe(res);
    if (!res.ok) {
      if (res.status === 401) {
        var refreshed = await window.insforgeAuthRefresh();
        if (refreshed && refreshed.accessToken) {
          return window.insforgeAuthGetCurrent();
        }
      }
      return null;
    }
    if (data && data.user) {
      try {
        sessionStorage.setItem(USER, JSON.stringify(data.user));
      } catch (e) {
        console.warn("insforgeAuthGetCurrent cache user", e);
      }
    }
    return data;
  };

  window.insforgeAuthUpdateProfile = async function insforgeAuthUpdateProfile(patch) {
    var b = baseUrl();
    var token = window.insforgeAuthGetAccessToken();
    if (!b || !token) throw new Error("Not signed in");
    var res = await fetch(b + "/api/auth/profiles/current", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(patch || {}),
    });
    var data = await parseJsonSafe(res);
    if (!res.ok) {
      var msg = (data && (data.message || data.error)) || res.statusText;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    if (data && data.user) {
      persistSession(token, window.insforgeAuthGetRefreshToken(), data.user);
    }
    return data;
  };

  window.insforgeAuthSignOut = async function insforgeAuthSignOut() {
    var b = baseUrl();
    var token = window.insforgeAuthGetAccessToken();
    if (b && token) {
      try {
        await fetch(b + "/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
        });
      } catch (e) {
        console.warn("insforgeAuthSignOut", e);
      }
    }
    window.insforgeAuthClearSession();
  };
})();
