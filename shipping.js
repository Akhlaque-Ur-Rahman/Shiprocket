(function () {
  const input = document.getElementById("trackingInput");
  const trackBtn = document.getElementById("trackingTrackBtn");
  const errorEl = document.getElementById("trackingTrackError");
  const trackingDialog = document.getElementById("trackingResultDialog");
  const mockRef = document.getElementById("trackingMockRef");
  const mockCourier = document.getElementById("trackingMockCourier");
  const mockIdLabel = document.getElementById("trackingMockIdLabel");
  const mockStatusText = document.getElementById("trackingMockStatusText");
  const mockSteps = document.getElementById("trackingMockSteps");
  const mockFallbackNote = document.getElementById("trackingMockFallbackNote");
  const tabButtons = document.querySelectorAll(".tracking-tabs .tab-btn");
  const modalClose = document.getElementById("trackingModalClose");
  const modalDone = document.getElementById("trackingModalDone");

  if (
    !input ||
    !trackBtn ||
    !errorEl ||
    !trackingDialog ||
    !mockRef ||
    !mockCourier ||
    !mockIdLabel ||
    !mockStatusText ||
    !mockSteps
  ) {
    return;
  }

  const TAB_CONFIG = {
    awb: { placeholder: "Enter your AWB Tracking Number", inputmode: null },
    order: { placeholder: "Enter your Order ID", inputmode: null },
    mobile: { placeholder: "Enter your registered mobile number", inputmode: "tel" },
  };

  const TAB_PRESENTATION = {
    awb: {
      idLabel: "Reference",
      statusText: "Latest scan: out for delivery",
      partner: "Blue Dart",
    },
    order: {
      idLabel: "Order ID",
      statusText: "Latest update: packed at seller hub",
      partner: "Delhivery",
    },
    mobile: {
      idLabel: "Mobile",
      statusText: "Multi-order lookup: 3 active parcels",
      partner: "Xpressbees",
    },
  };

  let activeTabKey = "awb";
  let staggerTimers = [];
  /** @type {Element | null} */
  let preDialogFocusEl = null;

  function setActiveTab(tab) {
    if (!TAB_CONFIG[tab]) return;
    activeTabKey = tab;
    const cfg = TAB_CONFIG[tab];
    tabButtons.forEach((btn) => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    input.placeholder = cfg.placeholder;
    if (cfg.inputmode) {
      input.setAttribute("inputmode", cfg.inputmode);
    } else {
      input.removeAttribute("inputmode");
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(btn.dataset.tab);
      input.focus();
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const urlPrefill = urlParams.get("prefill");
  const urlType = urlParams.get("type");
  if (urlPrefill && urlType && TAB_CONFIG[urlType]) {
    setActiveTab(urlType);
    try {
      input.value = decodeURIComponent(urlPrefill);
    } catch {
      input.value = urlPrefill;
    }
    input.focus();
  }

  const urlReturn = urlParams.get("return");
  if (urlReturn === "orders") {
    const trackReturnBar = document.getElementById("trackReturnBar");
    const shippingCtxBar = document.getElementById("shippingAccountContextBar");
    const ctxLabel = document.getElementById("shippingAccountContextLabel");
    if (trackReturnBar) trackReturnBar.hidden = false;
    if (shippingCtxBar) shippingCtxBar.hidden = false;
    if (ctxLabel) {
      ctxLabel.hidden = false;
      ctxLabel.textContent = "Opened from your order history.";
    }
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
    input.removeAttribute("aria-invalid");
  }

  function isLikelyPastedUrl(s) {
    const t = s.trim();
    return /^https?:\/\//i.test(t) || /^www\./i.test(t) || /:\/\/\S/.test(t);
  }

  function isLikelyNetworkFailure(err) {
    if (!err) return false;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
    const name = String(err.name || "");
    const msg = String(err.message || err).toLowerCase();
    if (name === "TypeError" && /fetch|network|failed to load|load failed/i.test(msg)) return true;
    if (/networkerror/i.test(name)) return true;
    if (/abort|timeout|timed out|econnreset|enotfound|etimedout|failed to fetch/i.test(msg)) return true;
    return false;
  }

  function setFallbackNote(mode) {
    if (!mockFallbackNote) return;
    if (mode === "no_match") {
      mockFallbackNote.hidden = false;
      mockFallbackNote.textContent =
        "No demo record matched this ID. The steps below are a layout preview only, not a real shipment.";
    } else if (mode === "offline") {
      mockFallbackNote.hidden = false;
      mockFallbackNote.textContent =
        "Network or server reachability issue. Showing a placeholder timeline instead of live data.";
    } else if (mode === "preview_disabled") {
      mockFallbackNote.hidden = false;
      mockFallbackNote.textContent =
        "Live InsForge URL or access token is not set in this build. Preview timeline only, not live tracking.";
    } else if (mode === "error") {
      mockFallbackNote.hidden = false;
      mockFallbackNote.textContent =
        "Could not load the demo catalog. Showing a placeholder timeline instead.";
    } else {
      mockFallbackNote.hidden = true;
      mockFallbackNote.textContent = "";
    }
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute("aria-invalid", "true");
    closeTrackingModal();
  }

  function clearStaggerTimers() {
    staggerTimers.forEach((id) => clearTimeout(id));
    staggerTimers = [];
  }

  function closeTrackingModal() {
    clearStaggerTimers();
    if (trackingDialog.open) {
      trackingDialog.close();
    }
  }

  const MOCK_STEPS = [
    {
      title: "Order received",
      time: "May 10, 2026 · 9:12 AM",
      detail: "Manifest created at origin hub.",
    },
    {
      title: "Picked up",
      time: "May 10, 2026 · 2:40 PM",
      detail: "Courier collected from seller.",
    },
    {
      title: "In transit",
      time: "May 11, 2026 · 6:05 AM",
      detail: "In sort facility, moving to destination city.",
    },
    {
      title: "Out for delivery",
      time: "May 11, 2026 · 12:30 PM",
      detail: "Delivery executive assigned.",
    },
  ];

  function createStepLi(step) {
    const li = document.createElement("li");
    li.className = "tracking-mock-step tracking-mock-step--pending";

    const marker = document.createElement("span");
    marker.className = "tracking-mock-step-marker";
    marker.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "tracking-mock-step-body";

    const title = document.createElement("span");
    title.className = "tracking-mock-step-title";
    title.textContent = step.title;

    const time = document.createElement("span");
    time.className = "tracking-mock-step-time";
    time.textContent = step.time;

    const detail = document.createElement("span");
    detail.className = "tracking-mock-step-detail";
    detail.textContent = step.detail;

    body.appendChild(title);
    body.appendChild(time);
    body.appendChild(detail);
    li.appendChild(marker);
    li.appendChild(body);
    return li;
  }

  function renderStepsPending(customSteps) {
    const steps = customSteps && customSteps.length ? customSteps : MOCK_STEPS;
    mockSteps.textContent = "";
    steps.forEach((step) => {
      mockSteps.appendChild(createStepLi(step));
    });
    return Array.from(mockSteps.querySelectorAll(".tracking-mock-step"));
  }

  function applyStepProgress(stepElements, activeIndexInclusive) {
    const last = stepElements.length - 1;
    stepElements.forEach((el, j) => {
      el.classList.remove("tracking-mock-step--pending", "tracking-mock-step--done", "tracking-mock-step--current");
      if (j < activeIndexInclusive) {
        el.classList.add("tracking-mock-step--done");
      } else if (j === activeIndexInclusive) {
        if (j === last) {
          el.classList.add("tracking-mock-step--current");
        } else {
          el.classList.add("tracking-mock-step--done");
        }
      } else {
        el.classList.add("tracking-mock-step--pending");
      }
    });
  }

  function runStaggerAnimation(stepElements) {
    clearStaggerTimers();
    const STEP_MS = 580;
    stepElements.forEach((_, i) => {
      const timeoutId = setTimeout(() => {
        applyStepProgress(stepElements, i);
      }, (i + 1) * STEP_MS);
      staggerTimers.push(timeoutId);
    });
  }

  function openModal() {
    const ae = document.activeElement;
    preDialogFocusEl =
      ae instanceof HTMLElement && ae !== document.body ? ae : trackBtn;
    if (typeof trackingDialog.showModal === "function") {
      trackingDialog.showModal();
    } else {
      trackingDialog.setAttribute("open", "");
    }
    const toFocus = modalClose || trackingDialog.querySelector("button");
    if (toFocus && typeof toFocus.focus === "function") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => toFocus.focus());
      });
    }
  }

  function pickDemoShipmentRow(rows, reference, tabKey) {
    if (!Array.isArray(rows) || !rows.length) return undefined;
    return rows.find((r) => {
      const ref = r.reference;
      const tk = r.tab_key ?? r.tabKey;
      return ref === reference && tk === tabKey;
    });
  }

  function populateHeader(reference, tabKey, dbRow) {
    if (dbRow) {
      mockIdLabel.textContent = dbRow.id_label ?? dbRow.idLabel ?? "Reference";
      mockRef.textContent = reference;
      mockCourier.textContent = dbRow.courier || "";
      mockStatusText.textContent = dbRow.status_text ?? dbRow.statusText ?? "";
      return;
    }
    const pres = TAB_PRESENTATION[tabKey] || TAB_PRESENTATION.awb;
    mockIdLabel.textContent = pres.idLabel;
    mockRef.textContent = reference;
    mockCourier.textContent = pres.partner;
    mockStatusText.textContent = pres.statusText;
  }

  function showMock(reference, dbRow, noteMode) {
    clearError();
    populateHeader(reference, activeTabKey, dbRow);
    setFallbackNote(dbRow ? null : noteMode || null);
    const stepElements = renderStepsPending(dbRow && Array.isArray(dbRow.steps) ? dbRow.steps : null);
    openModal();
    runStaggerAnimation(stepElements);
  }

  async function tryInsForgeThenMock(reference) {
    const cfg = window.__INSFORGE_CONFIG || {};
    const remoteConfigured =
      typeof window.insforgeRemoteConfigured === "function"
        ? window.insforgeRemoteConfigured()
        : !!(cfg.enabled && cfg.baseUrl);

    if (!remoteConfigured) {
      if (activeTabKey === "awb" && /^ORD-/i.test(reference)) {
        setActiveTab("order");
      }
      showMock(reference, undefined, "preview_disabled");
      return;
    }

    if (typeof window.insforgeDbReadable !== "function" || !window.insforgeDbReadable()) {
      if (activeTabKey === "awb" && /^ORD-/i.test(reference)) {
        setActiveTab("order");
      }
      showMock(reference, undefined, "preview_disabled");
      return;
    }

    const table = cfg.demoTable || "demo_shipments";
    try {
      async function fetchRowForTab(tabKey) {
        const rows = await window.insforgeQueryRecords(table, {
          reference: `eq.${reference}`,
          tab_key: `eq.${tabKey}`,
        });
        return pickDemoShipmentRow(rows, reference, tabKey);
      }

      let row = await fetchRowForTab(activeTabKey);

      if (!row && activeTabKey === "awb" && /^ORD-/i.test(reference)) {
        row = await fetchRowForTab("order");
        if (row) {
          setActiveTab("order");
        }
      }

      if (row && Array.isArray(row.steps) && row.steps.length) {
        showMock(reference, row);
        return;
      }
    } catch (e) {
      console.warn("InsForge tracking fallback to mock:", e);
      if (isLikelyNetworkFailure(e)) {
        showMock(reference, undefined, "offline");
        return;
      }
      showMock(reference, undefined, "error");
      return;
    }
    showMock(reference, undefined, "no_match");
  }

  function submitTrack() {
    const raw = input.value.trim();
    if (!raw) {
      showError("Enter a value.");
      return;
    }

    if (isLikelyPastedUrl(raw)) {
      showError("Use AWB, Order ID, or mobile.");
      return;
    }

    if (activeTabKey === "mobile") {
      const digits = raw.replace(/\D/g, "");
      if (digits.length !== 10) {
        showError("Enter 10 digits.");
        return;
      }
      void tryInsForgeThenMock(digits);
      return;
    }

    void tryInsForgeThenMock(raw);
  }

  trackBtn.addEventListener("click", () => {
    submitTrack();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    submitTrack();
  });

  input.addEventListener("input", () => {
    clearError();
  });

  if (modalClose) {
    modalClose.addEventListener("click", () => closeTrackingModal());
  }
  if (modalDone) {
    modalDone.addEventListener("click", () => closeTrackingModal());
  }

  trackingDialog.addEventListener("close", () => {
    clearStaggerTimers();
    setFallbackNote(null);
    const restore =
      preDialogFocusEl && typeof preDialogFocusEl.focus === "function"
        ? preDialogFocusEl
        : trackBtn;
    preDialogFocusEl = null;
    if (restore && typeof restore.focus === "function") {
      requestAnimationFrame(() => restore.focus());
    }
  });
})();
