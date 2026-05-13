(function () {
  if (document.body.dataset.ordersPage !== "1") return;

  var intro = document.getElementById("ordersIntro");
  var errEl = document.getElementById("ordersError");
  var table = document.getElementById("ordersTable");
  var tbody = document.getElementById("ordersTableBody");

  function showErr(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
    if (intro) intro.textContent = "Could not load orders.";
  }

  function clearErr() {
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
  }

  if (typeof window.insforgeAuthHasSession !== "function" || !window.insforgeAuthHasSession()) {
    window.location.href = "login.html";
    return;
  }

  if (typeof window.insforgeQueryRecords !== "function") {
    showErr("InsForge client not loaded.");
    return;
  }

  clearErr();
  window
    .insforgeQueryRecords("user_orders", { order: "created_at.desc", limit: "50" })
    .catch(function () {
      return window.insforgeQueryRecords("user_orders", { limit: "50" });
    })
    .then(function (rows) {
      if (intro) {
        intro.textContent =
          rows && rows.length
            ? "Orders stored in InsForge for your account (RLS: your rows only)."
            : "No orders yet. Complete sign up to create a sample order, or add rows in the database.";
      }
      if (!tbody || !table) return;
      tbody.textContent = "";
      if (!rows || !rows.length) {
        table.hidden = true;
        return;
      }
      table.hidden = false;
      rows.forEach(function (r) {
        var ref = r.order_ref || r.orderRef || "";
        var status = r.status_text || r.statusText || "";
        var courier = r.courier || "";
        var created = r.created_at || r.createdAt || "";
        var tr = document.createElement("tr");
        ["td", "td", "td", "td", "td"].forEach(function () {
          tr.appendChild(document.createElement("td"));
        });
        tr.cells[0].textContent = ref;
        tr.cells[1].textContent = status;
        tr.cells[2].textContent = courier;
        tr.cells[3].textContent = String(created);
        var a = document.createElement("a");
        a.href = "shipping.html?" + new URLSearchParams({ type: "order", prefill: ref }).toString();
        a.textContent = "Track";
        tr.cells[4].appendChild(a);
        tbody.appendChild(tr);
      });
    })
    .catch(function (e) {
      showErr((e && e.message) || "Failed to load orders.");
    });
})();
