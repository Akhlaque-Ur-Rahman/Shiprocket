(function () {
  if (document.body.dataset.ordersPage !== "1") return;

  var errEl = document.getElementById("ordersError");
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

  function showErr(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
  }

  function clearErr() {
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
  }

  function hideEmpty() {
    if (emptyState) emptyState.hidden = true;
  }

  function showEmptySignedIn() {
    var t = document.getElementById("ordersEmptyTitle");
    var p = document.getElementById("ordersEmptyText");
    var loginL = document.getElementById("ordersEmptyLinkLogin");
    if (!emptyState || !t) return;
    t.textContent = "No orders";
    if (p) {
      p.textContent = "";
      p.hidden = true;
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
      a.href = "shipping.html?" + new URLSearchParams({ type: "order", prefill: ref }).toString();
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
    showErr("Unavailable.");
    return;
  }

  clearErr();
  hideEmpty();
  window
    .insforgeQueryRecords("user_orders", { limit: "100" })
    .then(function (rows) {
      var list = Array.isArray(rows) ? rows.slice() : [];
      list.sort(function (a, b) {
        return parseTime(b) - parseTime(a);
      });
      renderOrderRows(list);
    })
    .catch(function (e) {
      hideEmpty();
      showErr((e && e.message) || "Unable to load.");
    });
})();
