(function () {
  if (document.body.dataset.ordersPage !== "1") return;

  var errEl = document.getElementById("ordersError");
  var retryBtn = document.getElementById("ordersRetryBtn");
  var table = document.getElementById("ordersTable");
  var tbody = document.getElementById("ordersTableBody");
  var emptyState = document.getElementById("ordersEmptyState");

  function readDemoSession() {
    try {
      var raw = sessionStorage.getItem("shiprocket_demo_session");
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o.displayName !== "string" || !o.displayName.trim()) return null;
      return o;
    } catch (e) {
      return null;
    }
  }

  function showErr(msg, opts) {
    opts = opts || {};
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
    if (retryBtn) retryBtn.hidden = !opts.retry;
  }

  function clearErr() {
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
    if (retryBtn) retryBtn.hidden = true;
  }

  function hideEmpty() {
    if (emptyState) emptyState.hidden = true;
  }

  function showEmptySignedIn() {
    var t = document.getElementById("ordersEmptyTitle");
    var p = document.getElementById("ordersEmptyText");
    var loginL = document.getElementById("ordersEmptyLinkLogin");
    if (!emptyState || !t) return;
    t.textContent = "No orders yet";
    if (p) {
      p.textContent =
        "This preview account has no saved orders. Track any AWB, Order ID, or mobile from Track shipment on your profile, or place a test order when your store is connected.";
      p.hidden = false;
    }
    if (loginL) loginL.hidden = true;
    emptyState.hidden = false;
  }

  function parseTime(row) {
    var t = row.created_at || row.createdAt || "";
    var n = Date.parse(t);
    return Number.isFinite(n) ? n : 0;
  }

  function formatCreated(raw) {
    var n = Date.parse(raw);
    if (Number.isFinite(n)) {
      try {
        return new Date(n).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      } catch (e) {
        return String(raw);
      }
    }
    return raw ? String(raw) : "—";
  }

  function statusBadgeClass(status) {
    var s = String(status || "").toLowerCase();
    if (/deliver|completed|complete|handover|pod/i.test(s)) return "orders-status-badge orders-status-badge--success";
    if (/cancel|fail|return|lost|rto/i.test(s)) return "orders-status-badge orders-status-badge--danger";
    if (/pack|transit|ship|out|pick|dispatched|in transit|picked/i.test(s)) return "orders-status-badge orders-status-badge--info";
    return "orders-status-badge orders-status-badge--neutral";
  }

  function renderOrderRows(list) {
    if (!tbody || !table) return;
    tbody.textContent = "";
    if (!list.length) {
      table.hidden = true;
      showEmptySignedIn();
      return;
    }
    hideEmpty();
    table.hidden = false;
    list.forEach(function (r) {
      var ref = r.order_ref || r.orderRef || "";
      var status = r.status_text || r.statusText || "";
      var courier = r.courier || "";
      var created = r.created_at || r.createdAt || "";
      var tr = document.createElement("tr");
      var i;
      for (i = 0; i < 5; i++) {
        tr.appendChild(document.createElement("td"));
      }
      tr.cells[0].textContent = ref;
      var badge = document.createElement("span");
      badge.className = statusBadgeClass(status);
      badge.textContent = status || "—";
      tr.cells[1].appendChild(badge);
      tr.cells[2].textContent = courier;
      tr.cells[3].textContent = formatCreated(created);
      var a = document.createElement("a");
      a.href =
        "profile.html?" +
        new URLSearchParams({ type: "order", prefill: ref, return: "orders" }).toString() +
        "#track-shipment";
      a.className = "orders-track-link";
      a.textContent = "Track";
      tr.cells[4].appendChild(a);
      tbody.appendChild(tr);
    });
  }

  if (typeof window.insforgeAuthHasSession !== "function" || !window.insforgeAuthHasSession()) {
    var demoSess = readDemoSession();
    if (demoSess) {
      clearErr();
      var demoOrders = Array.isArray(demoSess.orders) ? demoSess.orders.slice() : [];
      demoOrders.sort(function (a, b) {
        return parseTime(b) - parseTime(a);
      });
      renderOrderRows(demoOrders);
      return;
    }
    window.location.href = "login.html";
    return;
  }

  if (typeof window.insforgeQueryRecords !== "function") {
    showErr("Orders cannot load right now. Refresh the page, or sign out and sign in again.", {});
    return;
  }

  var loadingEl = document.getElementById("ordersLoading");

  function showLoading() {
    if (loadingEl) {
      loadingEl.hidden = false;
      loadingEl.setAttribute("aria-busy", "true");
    }
    if (table) table.hidden = true;
    hideEmpty();
  }

  function hideLoading() {
    if (loadingEl) {
      loadingEl.hidden = true;
      loadingEl.setAttribute("aria-busy", "false");
    }
  }

  function loadInsForgeOrders() {
    clearErr();
    showLoading();
    window
      .insforgeQueryRecords("user_orders", { limit: "100" })
      .then(function (rows) {
        hideLoading();
        var list = Array.isArray(rows) ? rows.slice() : [];
        list.sort(function (a, b) {
          return parseTime(b) - parseTime(a);
        });
        renderOrderRows(list);
      })
      .catch(function (e) {
        hideLoading();
        hideEmpty();
        if (table) table.hidden = true;
        var msg = e && e.message ? String(e.message) : "";
        var name = e && e.name ? String(e.name) : "";
        var netFail =
          (typeof navigator !== "undefined" && navigator.onLine === false) ||
          /network|failed to fetch|load failed|timeout|timed out|econnreset|enotfound|etimedout/i.test(msg) ||
          (name === "TypeError" && /fetch/i.test(msg));
        if (netFail) {
          showErr("Network issue while loading orders. Check your connection and tap Retry below.", { retry: true });
        } else if (/^InsForge\s(401|403)\b/.test(msg)) {
          showErr("Session expired or not allowed. Sign out, sign in again, then tap Retry.", { retry: true });
        } else {
          showErr(
            "We could not load your orders. Try again in a moment, or open Profile and confirm you are still signed in.",
            { retry: true }
          );
        }
      });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      loadInsForgeOrders();
    });
  }

  loadInsForgeOrders();
})();
