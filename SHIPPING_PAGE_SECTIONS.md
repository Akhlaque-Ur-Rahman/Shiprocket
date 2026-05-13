# Shipping Page Section Order

This document outlines the sequential order of sections to be developed for the new product page, as per the reference image.

## 1. Tracking Hero Section
- **Description**: The main entry point featuring a "Track your orders easily" headline and a multi-tab tracking form (AWB, Order ID, Phone Number).
- **Key Elements**: 
    - Heading with gradient/colored text for "easily".
    - Tracking input box with a "Track now" primary button.
    - Floating graphics/icons of packages and map pin.
- **Visuals**: Light background with subtle gradients.

## 2. Order Status Section (Finalized Implementation)
- **Description**: A dynamic, flow-based visual journey titled "What's your order status?". It uses a synchronized looping animation to represent a live shipping process.
- **Technical Specifications**:
    - **Layout**: Horizontal flex container (`status-flow-container`) on desktop, transitioning to a vertical timeline on mobile.
    - **Connectors**: Animated dashed lines with directional arrow heads and traveling "energy dots" (`::before` pseudo-elements).
    - **Icons**: Colorful, minimalist SVGs with semi-transparent background containers and sequential checkmark badges.
- **Animation Logic (The "Alive" Feel)**:
    - **10-Second Synchronized Cycle**: All elements operate on a unified 10s master clock without individual delays to prevent timing drift.
    - **Step-by-Step Drawing**: Connectors draw themselves (`scaleX`) sequentially, followed by the next icon "lighting up" (`opacity 1`).
    - **Coordinated Reset**: At 85% of the cycle, all active elements (icons, lines, badges) reset simultaneously to their default state (0.2 opacity / 0 scale).
    - **Bursting Interaction**: On hover, icons scale by 1.25x and tilt in 3D (`rotateX`) to provide tactile feedback.
- **Visuals**: Clean white background with a vibrant, multi-colored icon palette (Green, Purple, Blue).

## 3. Delivery Tracking On-the-go Section (Finalized Implementation)
- **Description**: Highlighting the mobility and reliability of tracking, with partner social proof.
- **Technical Specifications**:
    - **Container**: `partners-card` with `#f8fbff` background, `30px` border-radius, and subtle blue border.
    - **Typography**: Uses `.gradient-tracking` for the main headline, featuring a three-stop gradient (Yellow, Pink, Indigo).
    - **Logo Grid**: 6-column grid (`partners-grid`) featuring white cards (`partner-logo-box`) with soft shadows.
- **Interactions**:
    - **Auto-Slider**: Continuous `translateX` marquee animation (25s cycle) for seamless logo movement.
    - **Edge Masks**: Linear gradients (`#f8fbff` to transparent) on both edges for a high-end "fading" entry/exit.
    - **Hover-to-Pause**: Animation pauses on hover for easier interaction with specific brands.
    - **Logo Hover**: Logo boxes lift by `8px` and shadows deepen.
- **Visuals**: Clean, corporate yet modern aesthetic emphasizing trust and scale.

## 4. Order Tracking Knowledge Section (Finalized Implementation)
- **Description**: Educational content titled "Learn everything about order tracking".
- **Technical Specifications**:
    - **Layout**: 3-column responsive grid (`knowledge-grid`).
    - **Cards**: `knowledge-card` with `16px` radius and top-accent border.
    - **Thumbnails**: Real Shiprocket Cross-Border assets from `assets/WEBP/`.
- **Interactions**:
    - **Card Lift**: Cards lift by `8px` on hover with a refined shadow.
    - **Image Zoom**: Thumbnails scale up slightly within their containers.
    - **Alignment**: Fixed title heights for consistent grid alignment.
- **Visuals**: Realistic, blog-style cards that match the official Shiprocket resources section.

## 5. Experience Optimization Section (Finalized Implementation)
- **Description**: Detailed benefits and visual proof titled "Optimize your order tracking experience".
- **Technical Specifications**:
    - **Layout**: 2-column split grid (`optimization-grid`) with `1.1fr / 0.9fr` ratio.
    - **Visual**: Integrated high-fidelity 3D "Reduce RTO" illustration with a `visual-glow` background.
    - **Benefits**: Vertical stack of `benefit-item` cards with colorful icon backgrounds (`bg-soft-green`, etc.).
- **Interactions**:
    - **Floating Animation**: `floatVisual` keyframes (6s loop) for the main illustration.
    - **Slide-in Hover**: Benefit items slide to the right (`translateX(10px)`) and gain a shadow on hover.
    - **CTA Hover**: Primary button lift and secondary link arrow animation.
- **Visuals**: Clean, modern, and data-driven aesthetic emphasizing growth and efficiency.

## 6. Frequently Asked Questions (FAQ) Section (Finalized Implementation)
- **Description**: Accordion-style FAQ to address common tracking queries.
- **Technical Specifications**:
    - **Layout**: Centered `narrow` container (800px max-width) for optimal readability.
    - **Accordions**: `faq-item` with semantic buttons for accessibility.
    - **Transitions**: `max-height` and `opacity` transitions for smooth opening/closing.
- **Interactions**:
    - **Icon Animation**: Custom-built SVG-less '+' icon that morphs into a '-' using CSS `rotate` and `opacity`.
    - **JS Logic**: Single-open policy (opening one closes the others) for a focused user experience.
    - **Hover States**: Color shifting on questions to signal interactivity.
- **Visuals**: Clean, minimalist, and authoritative design consistent with modern SaaS help centers.

---
**Note**: Existing Navbar and Footer will be retained as per instructions.
