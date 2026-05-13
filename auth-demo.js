(function () {
  var DEMO_SESSION_KEY = "shiprocket_demo_session";

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
      var display = email.split("@")[0];
      setDemoSession({
        flow: "login-email",
        displayName: display,
        email: email,
      });
      window.location.href = "profile.html";
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldError(err, nameEl);
      clearFieldError(err, emailEl);
      clearFieldError(err, phoneEl);
      if (passEl) clearFieldError(err, passEl);
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
              showFieldError(err, emailEl, "Confirm your email to sign in.");
              blocked = true;
              return null;
            }
            var uid = data && data.user && data.user.id;
            if (uid && typeof window.insforgePostRecords === "function") {
              return window.insforgePostRecords("user_orders", [
                {
                  user_id: uid,
                  order_ref: "ORD-" + Date.now().toString(36).toUpperCase(),
                  status_text: "Packed at seller hub",
                  courier: "Blue Dart",
                },
              ]);
            }
            return null;
          })
          .then(function () {
            if (blocked) return;
            window.location.href = "orders.html";
          })
          .catch(function (ex) {
            showFieldError(err, emailEl, (ex && ex.message) || "Sign up failed.");
          });
        return;
      }
      setDemoSession({
        flow: "signup",
        displayName: name,
        email: email,
        phone: digits,
      });
      window.location.href = "profile.html";
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
    if (!window.insforgeAuthHasSession || !window.insforgeAuthHasSession()) return;
    if (typeof window.insforgeQueryRecords !== "function") return;
    window
      .insforgeQueryRecords("user_orders", { limit: "5" })
      .then(function (rows) {
        var list = Array.isArray(rows) ? rows : [];
        if (list.length === 0) return;
        hint.hidden = false;
      })
      .catch(function () {});
  }

  function wireProfileGate() {
    if (document.body.dataset.profilePage !== "1") return;

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
      window.insforgeAuthGetCurrent().then(function (data) {
        if (!data || !data.user) {
          window.location.href = "login.html";
          return;
        }
        fillProfileInsForge(data.user);
        maybeProfileShipmentsHint();
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
    var settingsSec = document.getElementById("settings");
    if (settingsSec) settingsSec.hidden = true;
    var insPanel = document.getElementById("profileInsForgePanel");
    if (insPanel) insPanel.hidden = true;
    bindLogout();
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

  wireLoginEmailForm();
  wireSignupForm();
  wireLoginTrackNow();
  wireProfileGate();
})();
