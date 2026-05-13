const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const drawerClose = document.getElementById("drawerClose");

// Create backdrop if it doesn't exist
let backdrop = document.querySelector(".menu-backdrop");
if (!backdrop) {
  backdrop = document.createElement("div");
  backdrop.className = "menu-backdrop";
  document.body.appendChild(backdrop);
}

if (menuToggle && navLinks) {
  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle("show");
    menuToggle.classList.toggle("active");
    backdrop.classList.toggle("show");
    
    // Lock/unlock body scroll
    document.body.style.overflow = isOpen ? "hidden" : "";
    
    const isExpanded = menuToggle.classList.contains("active");
    menuToggle.setAttribute("aria-expanded", isExpanded.toString());
  };

  menuToggle.addEventListener("click", toggleMenu);
  backdrop.addEventListener("click", toggleMenu);
  if (drawerClose) {
    drawerClose.addEventListener("click", toggleMenu);
  }

  // Mobile Product Accordion
  const accordionToggle = document.querySelector(".mobile-accordion-toggle");
  if (accordionToggle) {
    accordionToggle.addEventListener("click", function() {
      this.parentElement.classList.toggle("active");
    });
  }

  // Close mobile menu after clicking any nav link (except dropdown toggle)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.classList.contains("dropdown-toggle")) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
        return;
      }
      
      // Close menu
      navLinks.classList.remove("show");
      menuToggle.classList.remove("active");
      backdrop.classList.remove("show");
      document.body.style.overflow = "";
      menuToggle.setAttribute("aria-expanded", "false");
      
      // Close all dropdowns when menu closes
      navLinks.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
    });
  });
}

// Hero image slider
const heroImage = document.getElementById("heroMainImage");
const heroPrevBtn = document.getElementById("heroPrevBtn");
const heroNextBtn = document.getElementById("heroNextBtn");
const heroDots = document.querySelectorAll(".slider-dots .dot");
const heroBadgeTopLabel = document.getElementById("heroBadgeTopLabel");
const heroBadgeTopValue = document.getElementById("heroBadgeTopValue");
const heroBadgeMiddleLabel = document.getElementById("heroBadgeMiddleLabel");
const heroBadgeMiddleValue = document.getElementById("heroBadgeMiddleValue");
const heroBadgeBottomLabel = document.getElementById("heroBadgeBottomLabel");
const heroBadgeBottomValue = document.getElementById("heroBadgeBottomValue");

if (
  heroImage &&
  heroPrevBtn &&
  heroNextBtn &&
  heroDots.length &&
  heroBadgeTopLabel &&
  heroBadgeTopValue &&
  heroBadgeMiddleLabel &&
  heroBadgeMiddleValue &&
  heroBadgeBottomLabel &&
  heroBadgeBottomValue
) {
  const heroSlides = [
    {
      src: "assets/WEBP/Desktop.webp",
      alt: "Shipping analytics dashboard mockup",
      badges: {
        top: { label: "WhatsApp Support", value: "Start Chat" },
        middle: { label: "Total orders", value: "63" },
        bottom: { label: "Ready to ship", value: "18 Active" },
      },
    },
    {
      src: "assets/WEBP/Sense-Web-RJhtf8.webp",
      alt: "Shipping product cards and order dashboard",
      badges: {
        top: { label: "Checkout speed", value: "Under 40 sec" },
        middle: { label: "Conversion uplift", value: "Up to 20%" },
        bottom: { label: "Cart recovery", value: "Live Enabled" },
      },
    },
    {
      src: "assets/WEBP/Courier-partner-Section.webp",
      alt: "Logistics operations insights dashboard",
      badges: {
        top: { label: "Courier partners", value: "42 Active" },
        middle: { label: "On-time rate", value: "96.4%" },
        bottom: { label: "NDR alerts", value: "Auto managed" },
      },
    },
    {
      src: "assets/WEBP/quick_homepage-2zFOcV.webp",
      alt: "Commerce growth and shipping metrics panel",
      badges: {
        top: { label: "Global reach", value: "220+ countries" },
        middle: { label: "Daily transactions", value: "5 Lakh+" },
        bottom: { label: "Support SLA", value: "24x7 Priority" },
      },
    },
  ];

  let activeIndex = 0;
  let autoSlideTimer;

  const renderSlide = (index) => {
    const slide = heroSlides[index];
    heroImage.src = slide.src;
    heroImage.alt = slide.alt;
    heroBadgeTopLabel.textContent = slide.badges.top.label;
    heroBadgeTopValue.textContent = slide.badges.top.value;
    heroBadgeMiddleLabel.textContent = slide.badges.middle.label;
    heroBadgeMiddleValue.textContent = slide.badges.middle.value;
    heroBadgeBottomLabel.textContent = slide.badges.bottom.label;
    heroBadgeBottomValue.textContent = slide.badges.bottom.value;

    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const goToSlide = (index) => {
    activeIndex = (index + heroSlides.length) % heroSlides.length;
    renderSlide(activeIndex);
  };

  const startAutoSlide = () => {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
      goToSlide(activeIndex + 1);
    }, 5000);
  };

  heroPrevBtn.addEventListener("click", () => {
    goToSlide(activeIndex - 1);
    startAutoSlide();
  });

  heroNextBtn.addEventListener("click", () => {
    goToSlide(activeIndex + 1);
    startAutoSlide();
  });

  heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slide || 0);
      goToSlide(targetIndex);
      startAutoSlide();
    });
  });

  renderSlide(activeIndex);
  startAutoSlide();
}

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const faqItem = button.parentElement;
    if (!faqItem || !faqItem.classList.contains("faq-item")) return;
    const isOpen = faqItem.classList.contains("active");
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("active");
    });
    if (!isOpen) {
      faqItem.classList.add("active");
    }
  });
});

(function shiprocketDemoNav() {
  const DEMO_SESSION_KEY = "shiprocket_demo_session";

  function readDemoSession() {
    try {
      const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || typeof o.displayName !== "string" || !o.displayName.trim()) return null;
      return o;
    } catch {
      return null;
    }
  }

  function readNavSession() {
    if (typeof window.insforgeAuthHasSession === "function" && window.insforgeAuthHasSession()) {
      const u = typeof window.insforgeAuthGetStoredUser === "function" ? window.insforgeAuthGetStoredUser() : null;
      if (u && (u.email || u.name)) {
        const displayName = (u.name && String(u.name).trim()) || (u.email ? u.email.split("@")[0] : "User");
        return { displayName, email: u.email || "", flow: "insforge" };
      }
    }
    return readDemoSession();
  }

  function initialsFromSession(displayName, email) {
    const s = (displayName || "").trim() || (email || "").split("@")[0] || "U";
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return s.slice(0, 2).toUpperCase();
  }

  function renderLoggedOutNav(navActions, drawer) {
    navActions.textContent = "";
    const loginA = document.createElement("a");
    loginA.href = "login.html";
    loginA.className = "login-link";
    loginA.textContent = "Login";
    const signupA = document.createElement("a");
    signupA.href = "signup.html";
    signupA.className = "btn btn-outline";
    signupA.textContent = "Get Started";
    navActions.appendChild(loginA);
    navActions.appendChild(signupA);

    if (drawer) {
      drawer.textContent = "";
      const dLogin = document.createElement("a");
      dLogin.href = "login.html";
      dLogin.className = "drawer-login";
      dLogin.textContent = "Login";
      const dGo = document.createElement("a");
      dGo.href = "signup.html";
      dGo.className = "drawer-signup";
      dGo.textContent = "Get Started";
      drawer.appendChild(dLogin);
      drawer.appendChild(dGo);
    }
  }

  function renderLoggedInNav(navActions, drawer, sess) {
    const initials = initialsFromSession(sess.displayName, sess.email);
    const shortName =
      sess.displayName.trim().length > 22
        ? `${sess.displayName.trim().slice(0, 22)}…`
        : sess.displayName.trim();

    navActions.textContent = "";
    const wrap = document.createElement("div");
    wrap.className = "nav-demo-user";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = "demoNavUserTrigger";
    trigger.className = "nav-demo-user-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "true");

    const av = document.createElement("span");
    av.className = "nav-demo-user-avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = initials;

    const nm = document.createElement("span");
    nm.className = "nav-demo-user-name";
    nm.textContent = shortName;

    trigger.appendChild(av);
    trigger.appendChild(nm);

    const dd = document.createElement("div");
    dd.id = "demoNavUserDropdown";
    dd.className = "nav-demo-user-dropdown";
    dd.hidden = true;

    const profileA = document.createElement("a");
    profileA.href = "profile.html";
    profileA.className = "nav-demo-user-dropdown__link";
    profileA.textContent = "Profile";

    const ordersA = document.createElement("a");
    ordersA.href = "orders.html";
    ordersA.className = "nav-demo-user-dropdown__link";
    ordersA.textContent = "Orders";

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.id = "demoNavLogout";
    logoutBtn.className = "nav-demo-user-dropdown__btn";
    logoutBtn.textContent = "Log out";

    dd.appendChild(profileA);
    dd.appendChild(ordersA);
    dd.appendChild(logoutBtn);
    wrap.appendChild(trigger);
    wrap.appendChild(dd);
    navActions.appendChild(wrap);

    if (drawer) {
      drawer.textContent = "";
      const dProfile = document.createElement("a");
      dProfile.href = "profile.html";
      dProfile.className = "drawer-login";
      dProfile.textContent = "Profile";
      const dOrders = document.createElement("a");
      dOrders.href = "orders.html";
      dOrders.className = "drawer-login";
      dOrders.textContent = "Orders";
      const dOut = document.createElement("button");
      dOut.type = "button";
      dOut.className = "drawer-login nav-demo-drawer-logout";
      dOut.textContent = "Log out";
      drawer.appendChild(dProfile);
      drawer.appendChild(dOrders);
      drawer.appendChild(dOut);
    }
  }

  function refreshDemoNav() {
    const navActions = document.querySelector(".site-header .nav-actions");
    if (!navActions) return;
    const drawer = document.querySelector(".site-header .drawer-actions");
    const sess = readNavSession();
    if (sess) {
      renderLoggedInNav(navActions, drawer, sess);
    } else {
      renderLoggedOutNav(navActions, drawer);
    }
  }

  document.addEventListener("click", (e) => {
    const trigger = document.getElementById("demoNavUserTrigger");
    const dd = document.getElementById("demoNavUserDropdown");
    if (!trigger || !dd) return;
    if (e.target.closest("#demoNavUserTrigger")) {
      e.preventDefault();
      const open = dd.hidden === false;
      dd.hidden = open;
      trigger.setAttribute("aria-expanded", String(!open));
      return;
    }
    if (!dd.hidden && !dd.contains(e.target) && !trigger.contains(e.target)) {
      dd.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  window.__shiprocketDemoNavRefresh = refreshDemoNav;
  refreshDemoNav();
})();
