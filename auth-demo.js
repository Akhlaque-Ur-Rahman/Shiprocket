(function () {
  var DEMO_SESSION_KEY = "shiprocket_demo_session";
  // Academic demo only: plain passwords in localStorage. Production uses InsForge auth.
  var DEMO_REGISTRY_KEY = "shiprocket_demo_registry";
  /** Shared password for every account in the local demo registry (seeded + one-time migrated legacy rows). */
  var DEMO_SHARED_PASSWORD = "DemoPass123";
  /** Once per browser: align existing registry passwords to DEMO_SHARED_PASSWORD. New signups after that keep the password they chose. */
  var DEMO_PW_UNIFY_STORAGE_KEY = "shiprocket_demo_password_unified_v1";

  function readRegistry() {
    try {
      var raw = localStorage.getItem(DEMO_REGISTRY_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function writeRegistry(list) {
    localStorage.setItem(DEMO_REGISTRY_KEY, JSON.stringify(list));
  }

  function normalizeDemoRegistryPasswords() {
    try {
      if (localStorage.getItem(DEMO_PW_UNIFY_STORAGE_KEY)) return;
      var list = readRegistry();
      if (!list.length) {
        localStorage.setItem(DEMO_PW_UNIFY_STORAGE_KEY, "1");
        return;
      }
      var changed = false;
      var next = list.map(function (ac) {
        if (!ac || typeof ac !== "object") return ac;
        if (ac.password === DEMO_SHARED_PASSWORD) return ac;
        changed = true;
        var o = {};
        for (var k in ac) {
          if (Object.prototype.hasOwnProperty.call(ac, k)) o[k] = ac[k];
        }
        o.password = DEMO_SHARED_PASSWORD;
        return o;
      });
      if (changed) writeRegistry(next);
      localStorage.setItem(DEMO_PW_UNIFY_STORAGE_KEY, "1");
    } catch (e) {
      console.warn("normalizeDemoRegistryPasswords", e);
    }
  }

  function findAccount(email) {
    var norm = (email || "").trim().toLowerCase();
    var list = readRegistry();
    for (var i = 0; i < list.length; i++) {
      if ((list[i].email || "").trim().toLowerCase() === norm) return list[i];
    }
    return null;
  }

  function saveAccount(account) {
    var list = readRegistry();
    var norm = (account.email || "").trim().toLowerCase();
    var idx = -1;
    for (var j = 0; j < list.length; j++) {
      if ((list[j].email || "").trim().toLowerCase() === norm) {
        idx = j;
        break;
      }
    }
    if (idx >= 0) list[idx] = account;
    else list.push(account);
    writeRegistry(list);
  }

  function ensureDemoRegistrySeeded() {
    if (readRegistry().length > 0) return;
    var t1 = new Date("2026-05-10T09:00:00.000Z").toISOString();
    var t2 = new Date("2026-05-11T14:30:00.000Z").toISOString();
    writeRegistry([
      {
        email: "riya.sharma@example.com",
        password: DEMO_SHARED_PASSWORD,
        displayName: "Riya Sharma",
        phone: "9876543210",
        orders: [
          { order_ref: "ORD-2026-1001", status_text: "Packed at seller hub", courier: "Delhivery", created_at: t1 },
          { order_ref: "ORD-2026-1042", status_text: "In transit", courier: "Blue Dart", created_at: t2 },
        ],
      },
      {
        email: "arjun.m@demo.store",
        password: DEMO_SHARED_PASSWORD,
        displayName: "Arjun Mehta",
        phone: "9123456789",
        orders: [{ order_ref: "ORD-2026-2099", status_text: "Out for delivery", courier: "Xpressbees", created_at: t1 }],
      },
      {
        email: "demo.seller@shiprocket.test",
        password: DEMO_SHARED_PASSWORD,
        displayName: "Demo Seller",
        phone: "9988776655",
        orders: [{ order_ref: "ORD-2026-3001", status_text: "Order received", courier: "Blue Dart", created_at: t2 }],
      },
    ]);
  }

  function scrollProfileToHashSection() {
    if (document.body.dataset.profilePage !== "1") return;
    var hash = location.hash;
    if (hash !== "#track-shipment" && hash !== "#settings") return;
    requestAnimationFrame(function () {
      var id = hash.slice(1);
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function applyProfileSettingsNavVisibility(showSettings) {
    if (document.body.dataset.profilePage !== "1") return;
    var a = document.querySelector('.account-dashboard__sidebar a[data-dashboard-nav="settings"]');
    if (a) a.hidden = !showSettings;
  }

  function syncProfileSidebarNav() {
    if (document.body.dataset.profilePage !== "1") return;
    var hash = (location.hash || "").toLowerCase();
    var activeKey = "overview";
    if (hash === "#track-shipment") activeKey = "track";
    else if (hash === "#settings") activeKey = "settings";

    document.querySelectorAll(".account-dashboard__sidebar a[data-dashboard-nav]").forEach(function (a) {
      var key = a.getAttribute("data-dashboard-nav");
      var isActive = key === activeKey;
      a.classList.toggle("account-dashboard__link--active", isActive);
      if (isActive) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  var profileHashNavWired = false;
  function wireProfileHashNavOnce() {
    if (profileHashNavWired) return;
    profileHashNavWired = true;
    window.addEventListener("hashchange", function () {
      if (document.body.dataset.profilePage !== "1") return;
      syncProfileSidebarNav();
      scrollProfileToHashSection();
    });
  }

  function getDemoSession() {
    try {
      var raw = sessionStorage.getItem(DEMO_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setDemoSession(payload) {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(payload));
    if (typeof window.__shiprocketDemoNavRefresh === "function") {
      window.__shiprocketDemoNavRefresh();
    }
  }

  function clearDemoSession() {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    if (typeof window.__shiprocketDemoNavRefresh === "function") {
      window.__shiprocketDemoNavRefresh();
    }
  }

  function useRealInsForgeAuth() {
    return typeof window.insforgeAuthConfigured === "function" && window.insforgeAuthConfigured();
  }

  function showFieldError(errEl, input, msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
    if (input) input.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(errEl, input) {
    if (errEl) {
      errEl.textContent = "";
      errEl.hidden = true;
    }
    if (input) input.removeAttribute("aria-invalid");
  }

  function isLikelyPastedUrl(s) {
    var t = (s || "").trim();
    return /^https?:\/\//i.test(t) || /^www\./i.test(t) || /:\/\/\S/.test(t);
  }

  function profileInitials(displayName, email) {
    var s = (displayName || "").trim() || (email || "").split("@")[0] || "U";
    var parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return s.slice(0, 2).toUpperCase();
  }

  function setProfileSummary(displayName, email) {
    var wrap = document.getElementById("profileSummary");
    var av = document.getElementById("profileSummaryAvatar");
    var nm = document.getElementById("profileSummaryName");
    var em = document.getElementById("profileSummaryEmail");
    if (!wrap || !av || !nm || !em) return;
    av.textContent = profileInitials(displayName, email);
    nm.textContent = (displayName && String(displayName).trim()) || (email ? email.split("@")[0] : "User");
    em.textContent = email || "";
    wrap.hidden = false;
  }

  function wireLoginEmailForm() {
    var form = document.getElementById("loginBusinessForm");
    var emailEl = document.getElementById("loginEmail");
    var passEl = document.getElementById("loginPassword");
    var err = document.getElementById("loginBusinessError");
    if (!form || !emailEl || !passEl || !err) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldError(err, emailEl);
      clearFieldError(err, passEl);
      var email = emailEl.value.trim();
      var password = passEl.value;
      var minLen = 8;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError(err, emailEl, "Enter a valid work email.");
        return;
      }
      if (!password || password.length < minLen) {
        showFieldError(err, passEl, "Enter a password (at least " + minLen + " characters).");
        return;
      }
      if (useRealInsForgeAuth()) {
        window
          .insforgeAuthSignIn(email, password)
          .then(function () {
            window.location.href = "orders.html";
          })
          .catch(function (ex) {
            showFieldError(err, passEl, (ex && ex.message) || "Sign in failed.");
          });
        return;
      }
      ensureDemoRegistrySeeded();
      var ac = findAccount(email);
      if (!ac || ac.password !== password) {
        showFieldError(
          err,
          passEl,
          "Invalid email or password. Create an account first if you do not have one yet."
        );
        return;
      }
      setDemoSession({
        flow: "login-email",
        displayName: ac.displayName,
        email: ac.email,
        phone: ac.phone || "",
        orders: Array.isArray(ac.orders) ? ac.orders : [],
      });
      window.location.href = "orders.html";
    });
  }

  function wireSignupForm() {
    var form = document.getElementById("signupForm");
    var nameEl = document.getElementById("signupName");
    var emailEl = document.getElementById("signupEmail");
    var phoneEl = document.getElementById("signupPhone");
    var passEl = document.getElementById("signupPassword");
    var err = document.getElementById("signupFormError");
    if (!form || !nameEl || !emailEl || !phoneEl || !err) return;

    var otpStep = document.getElementById("signupOtpStep");
    var otpInput = document.getElementById("signupOtpCode");
    var otpBtn = document.getElementById("signupVerifyOtpBtn");
    var submitBtn = document.getElementById("signupSubmitBtn");
    var fieldStack = form.querySelector(".auth-field-stack");
    var signupOtpPendingEmail = "";

    function setSignupWaitingOtp(active, em) {
      signupOtpPendingEmail = active ? String(em || "").trim() : "";
      if (otpStep) otpStep.hidden = !active;
      if (submitBtn) submitBtn.hidden = !!active;
      if (fieldStack) {
        var inputs = fieldStack.querySelectorAll("input");
        var j;
        for (j = 0; j < inputs.length; j++) {
          inputs[j].disabled = !!active;
        }
      }
      if (active && otpInput) {
        otpInput.value = "";
        clearFieldError(err, otpInput);
        requestAnimationFrame(function () {
          otpInput.focus();
        });
      }
    }

    function runSignupEmailOtpVerify() {
      if (!signupOtpPendingEmail) return;
      var rawOtp = otpInput ? otpInput.value.trim() : "";
      var code = rawOtp.replace(/\D/g, "");
      clearFieldError(err, otpInput);
      if (code.length !== 6) {
        showFieldError(err, otpInput || emailEl, "Enter the 6 digit code from your email.");
        return;
      }
      if (typeof window.insforgeAuthVerifyEmailCode !== "function") {
        showFieldError(err, emailEl, "Verification is not available. Refresh the page.");
        return;
      }
      window
        .insforgeAuthVerifyEmailCode(signupOtpPendingEmail, code)
        .then(function () {
          if (typeof window.__shiprocketDemoNavRefresh === "function") {
            window.__shiprocketDemoNavRefresh();
          }
          window.location.href = "orders.html";
        })
        .catch(function (ex) {
          showFieldError(err, otpInput || emailEl, (ex && ex.message) || "Invalid or expired code.");
        });
    }

    if (otpBtn) {
      otpBtn.addEventListener("click", runSignupEmailOtpVerify);
    }
    if (otpInput) {
      otpInput.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          runSignupEmailOtpVerify();
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldError(err, nameEl);
      clearFieldError(err, emailEl);
      clearFieldError(err, phoneEl);
      if (passEl) clearFieldError(err, passEl);
      if (otpInput) clearFieldError(err, otpInput);
      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var digits = phoneEl.value.replace(/\D/g, "");
      if (!name || name.length < 2) {
        showFieldError(err, nameEl, "Enter your full name.");
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError(err, emailEl, "Enter a valid work email.");
        return;
      }
      if (digits.length !== 10) {
        showFieldError(err, phoneEl, "Enter a valid 10 digit mobile number.");
        return;
      }
      if (useRealInsForgeAuth()) {
        var pw = passEl ? passEl.value : "";
        if (!pw || pw.length < 8) {
          showFieldError(err, passEl || emailEl, "Password must be at least 8 characters.");
          return;
        }
        var blocked = false;
        window
          .insforgeAuthRegister(email, pw, name)
          .then(function (data) {
            if (data && data.requireEmailVerification) {
              clearFieldError(err, emailEl);
              clearFieldError(err, otpInput);
              if (err) {
                err.textContent = "";
                err.hidden = true;
              }
              setSignupWaitingOtp(true, email);
              blocked = true;
              return;
            }
          })
          .then(function () {
            if (blocked) return;
            window.location.href = "orders.html";
          })
          .catch(function (ex) {
            setSignupWaitingOtp(false, "");
            showFieldError(err, emailEl, (ex && ex.message) || "Sign up failed.");
          });
        return;
      }
      ensureDemoRegistrySeeded();
      var pwDemo = passEl ? passEl.value : "";
      if (!pwDemo || pwDemo.length < 8) {
        showFieldError(err, passEl || emailEl, "Password must be at least 8 characters.");
        return;
      }
      if (findAccount(email)) {
        showFieldError(err, emailEl, "An account with this email already exists. Sign in instead.");
        return;
      }
      var newAc = {
        email: email,
        password: pwDemo,
        displayName: name,
        phone: digits,
        orders: [],
      };
      saveAccount(newAc);
      setDemoSession({
        flow: "signup",
        displayName: name,
        email: email,
        phone: digits,
        orders: newAc.orders,
      });
      window.location.href = "orders.html";
    });
  }

  function wireLoginTrackNow() {
    var btn = document.getElementById("loginTrackNowBtn");
    var input = document.getElementById("loginTrackInput");
    var err = document.getElementById("loginTrackError");
    if (!btn || !input) return;

    var radios = document.querySelectorAll('input[name="login-track-type"]');
    radios.forEach(function (r) {
      r.addEventListener("change", function () {
        clearFieldError(err, input);
        var v = r.value;
        if (v === "mobile") {
          input.placeholder = "Enter mobile number";
        } else if (v === "order") {
          input.placeholder = "Enter order ID";
        } else {
          input.placeholder = "Enter AWB";
        }
      });
    });

    btn.addEventListener("click", function () {
      clearFieldError(err, input);
      var raw = input.value.trim();
      if (!raw) {
        showFieldError(err, input, "Enter a value.");
        return;
      }
      if (isLikelyPastedUrl(raw)) {
        showFieldError(err, input, "Use AWB, Order ID, or mobile.");
        return;
      }
      var selected = document.querySelector('input[name="login-track-type"]:checked');
      var tabKey = selected ? selected.value : "mobile";
      var value = raw;
      if (tabKey === "mobile") {
        value = raw.replace(/\D/g, "");
        if (value.length !== 10) {
          showFieldError(err, input, "Enter 10 digits.");
          return;
        }
      }
      var q = new URLSearchParams();
      q.set("type", tabKey);
      q.set("prefill", value);
      window.location.href = "shipping.html?" + q.toString();
    });
  }

  function fillProfileDemo(sess) {
    var intro = document.getElementById("profileIntro");
    var dl = document.getElementById("profileDl");
    if (intro) {
      intro.textContent = "You are signed in on this device for this preview build.";
    }
    setProfileSummary(sess.displayName, sess.email);
    if (dl) {
      dl.textContent = "";
      function addRow(label, val) {
        if (!val) return;
        var dt = document.createElement("dt");
        dt.textContent = label;
        var dd = document.createElement("dd");
        dd.textContent = val;
        dl.appendChild(dt);
        dl.appendChild(dd);
      }
      addRow("Display name", sess.displayName);
      addRow("Email", sess.email);
      addRow("Phone", sess.phone);
    }
  }

  function fillProfileInsForge(user) {
    var intro = document.getElementById("profileIntro");
    var dl = document.getElementById("profileDl");
    if (intro) {
      intro.textContent = "";
      intro.hidden = true;
    }
    setProfileSummary(user.name || user.email || "", user.email || "");
    if (dl) {
      dl.textContent = "";
      function addRow(label, val) {
        if (val == null || val === "") return;
        var dt = document.createElement("dt");
        dt.textContent = label;
        var dd = document.createElement("dd");
        dd.textContent = String(val);
        dl.appendChild(dt);
        dl.appendChild(dd);
      }
      addRow("Account ID", user.id);
      addRow("Email", user.email);
      addRow("Name", user.name || "");
      addRow("Email verified", user.emailVerified != null ? String(user.emailVerified) : "");
    }
    var nameInput = document.getElementById("profileNameInput");
    if (nameInput) nameInput.value = user.name || "";
  }

  function maybeProfileShipmentsHint() {
    var hint = document.getElementById("profileShipmentsHint");
    if (!hint) return;
    if (useRealInsForgeAuth() && window.insforgeAuthHasSession && window.insforgeAuthHasSession()) {
      if (typeof window.insforgeQueryRecords !== "function") return;
      window
        .insforgeQueryRecords("user_orders", { limit: "5" })
        .then(function (rows) {
          var list = Array.isArray(rows) ? rows : [];
          if (list.length === 0) return;
          hint.hidden = false;
        })
        .catch(function () {});
      return;
    }
    var sess = getDemoSession();
    var ord = sess && Array.isArray(sess.orders) ? sess.orders : [];
    if (ord.length > 0) hint.hidden = false;
  }

  function wireProfileGate() {
    if (document.body.dataset.profilePage !== "1") return;

    wireProfileHashNavOnce();

    var logoutBtn = document.getElementById("profileLogoutBtn");
    var saveBtn = document.getElementById("profileSaveNameBtn");

    function bindLogout() {
      if (!logoutBtn) return;
      logoutBtn.addEventListener("click", function () {
        Promise.resolve(
          typeof window.insforgeAuthSignOut === "function" ? window.insforgeAuthSignOut() : null
        ).finally(function () {
          clearDemoSession();
          window.location.href = "login.html";
        });
      });
    }

    if (useRealInsForgeAuth() && window.insforgeAuthHasSession && window.insforgeAuthHasSession()) {
      var settingsSec = document.getElementById("settings");
      if (settingsSec) settingsSec.hidden = false;
      var insPanel = document.getElementById("profileInsForgePanel");
      if (insPanel) insPanel.hidden = false;
      applyProfileSettingsNavVisibility(true);
      syncProfileSidebarNav();
      window.insforgeAuthGetCurrent().then(function (data) {
        if (!data || !data.user) {
          window.location.href = "login.html";
          return;
        }
        fillProfileInsForge(data.user);
        maybeProfileShipmentsHint();
        syncProfileSidebarNav();
        scrollProfileToHashSection();
      });
      bindLogout();
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          var nameInput = document.getElementById("profileNameInput");
          var name = nameInput ? nameInput.value.trim() : "";
          var err = document.getElementById("profileSaveError");
          if (err) {
            err.textContent = "";
            err.hidden = true;
          }
          window
            .insforgeAuthUpdateProfile({ name: name || undefined })
            .then(function () {
              return window.insforgeAuthGetCurrent();
            })
            .then(function (d) {
              if (d && d.user) fillProfileInsForge(d.user);
              if (typeof window.__shiprocketDemoNavRefresh === "function") {
                window.__shiprocketDemoNavRefresh();
              }
            })
            .catch(function (ex) {
              if (err) {
                err.textContent = (ex && ex.message) || "Update failed";
                err.hidden = false;
              }
            });
        });
      }
      return;
    }

    if (!getDemoSession()) {
      window.location.href = "login.html";
      return;
    }
    fillProfileDemo(getDemoSession());
    maybeProfileShipmentsHint();
    var settingsSec = document.getElementById("settings");
    if (settingsSec) settingsSec.hidden = true;
    var insPanel = document.getElementById("profileInsForgePanel");
    if (insPanel) insPanel.hidden = true;
    applyProfileSettingsNavVisibility(false);
    syncProfileSidebarNav();
    bindLogout();
    scrollProfileToHashSection();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#demoNavLogout")) {
      e.preventDefault();
      Promise.resolve(
        typeof window.insforgeAuthSignOut === "function" ? window.insforgeAuthSignOut() : null
      ).finally(function () {
        clearDemoSession();
        var tr = document.getElementById("demoNavUserTrigger");
        var dd = document.getElementById("demoNavUserDropdown");
        if (dd) dd.hidden = true;
        if (tr) tr.setAttribute("aria-expanded", "false");
      });
      return;
    }
    if (e.target.closest(".nav-demo-drawer-logout")) {
      e.preventDefault();
      Promise.resolve(
        typeof window.insforgeAuthSignOut === "function" ? window.insforgeAuthSignOut() : null
      ).finally(function () {
        clearDemoSession();
      });
    }
  });

  ensureDemoRegistrySeeded();
  normalizeDemoRegistryPasswords();
  wireLoginEmailForm();
  wireSignupForm();
  wireLoginTrackNow();
  wireProfileGate();
})();
