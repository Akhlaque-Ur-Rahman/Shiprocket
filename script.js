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
