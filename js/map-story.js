/* ==========================================================================
   map-story.js  —  Third Rock Analytics · Story Map Controller
   ========================================================================== */

// ── BASEMAPS ──────────────────────────────────────────────────────────────
const basemaps = {
  basic: "./json/basic.json",
  outlines: "./json/outlines.json",
};

// ── MAP INIT ──────────────────────────────────────────────────────────────
const map = new maplibregl.Map({
  style: basemaps.basic,
  center: [-122.489, 47.2553],
  zoom: 11,
  pitch: 40,
  bearing: 0,
  container: "map",
  maxBounds: [[-135, 18], [-60, 55]],
  attributionControl: false,
  scrollZoom: false,       // disable scroll-to-zoom on the map
});

// Attribution in bottom-right (won't clash with story panel)
// Hidden by default — remove this line to show credits
map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

// ── GLOBAL SCROLL FORWARDING ──────────────────────────────────────────────
// When the user scrolls anywhere on the page (including over the map),
// forward those wheel events to the story panel so it always scrolls.
const storyScroll = document.querySelector(".story-panel__scroll");

document.addEventListener("wheel", (e) => {
  // Don't interfere if the user is already scrolling inside the panel
  if (storyScroll.contains(e.target)) return;

  // Don't forward if we're on mobile (panel is in normal flow)
  if (window.innerWidth <= 768) return;

  // Forward the scroll delta to the story panel
  storyScroll.scrollBy({
    top: e.deltaY,
    behavior: "auto",
  });
}, { passive: true });

// ── PROJECT MARKERS ───────────────────────────────────────────────────────
const projects = [
  {
    id: "hq",
    lngLat: [-122.489, 47.2553],
    markerClass: "custom-marker--hq",
    title: "Third Rock Analytics",
    desc: "Headquartered in Tacoma, WA. We take projects from all over the country.",
  },
  {
    id: "mojave",
    lngLat: [-117.2183, 34.4851],
    markerClass: "custom-marker--amber",
    title: "Mojave Water Levels",
    desc: "USGS-sourced live groundwater levels across the Mojave Desert, visualized in a custom dashboard.",
  },
];

const markers = [];

function createMarkerElement(project) {
  const el = document.createElement("div");
  el.className = `custom-marker ${project.markerClass}`;
  el.innerHTML = '<div class="custom-marker__dot"></div>';
  return el;
}

function addMarkers() {
  projects.forEach((project) => {
    const el = createMarkerElement(project);

    const popup = new maplibregl.Popup({
      closeOnClick: true,
      offset: 16,
      maxWidth: "260px",
    }).setHTML(
      `<h3 class="popup-title">${project.title}</h3><p class="popup-content">${project.desc}</p>`
    );

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(project.lngLat)
      .setPopup(popup)
      .addTo(map);

    markers.push({ id: project.id, marker, popup });
  });
}

// ── MOJAVE GEOJSON OVERLAY ────────────────────────────────────────────────
function addMojaveLayer() {
  // Avoid double-adding if source already exists
  if (map.getSource("mojave")) return;

  map.addSource("mojave", {
    type: "geojson",
    data: "./json/mojave.geojson",
  });

  // Fill layer — starts fully transparent; fades in via setLayoutProperty/setPaintProperty
  map.addLayer({
    id: "mojave-fill",
    type: "fill",
    source: "mojave",
    paint: {
      "fill-color": "#F59E0B",   // amber — matches the Mojave marker
      "fill-opacity": 0,
      "fill-opacity-transition": { duration: 800, delay: 0 },
    },
  });

  // Stroke layer
  map.addLayer({
    id: "mojave-outline",
    type: "line",
    source: "mojave",
    paint: {
      "line-color": "#FBBF24",
      "line-width": 1.5,
      "line-opacity": 0,
      "line-opacity-transition": { duration: 800, delay: 0 },
    },
  });
}

function setMojaveVisibility(visible) {
  if (!map.getLayer("mojave-fill")) return;
  const fillOpacity = visible ? 0.18 : 0;
  const lineOpacity = visible ? 0.7 : 0;
  map.setPaintProperty("mojave-fill",    "fill-opacity", fillOpacity);
  map.setPaintProperty("mojave-outline", "line-opacity", lineOpacity);
}

// Re-add markers when style changes (setStyle removes all markers/sources)
map.on("load", addMarkers);
map.on("load", addMojaveLayer);

// ── STYLE SWITCHER ────────────────────────────────────────────────────────
const styleSwitcher = document.getElementById("style-switcher");
styleSwitcher.addEventListener("click", (e) => {
  const btn = e.target.closest(".style-btn");
  if (!btn) return;

  const styleId = btn.id;
  if (!basemaps[styleId]) return;

  // Remove old markers before style swap
  markers.forEach((m) => m.marker.remove());
  markers.length = 0;

  map.setStyle(basemaps[styleId]);

  // Update active button
  styleSwitcher.querySelectorAll(".style-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  // Re-add markers + Mojave layer when new style loads
  map.once("styledata", () => {
    addMarkers();
    addMojaveLayer();
    // Restore Mojave visibility if we're on chapter 1
    if (activeChapter === 1) setMojaveVisibility(true);
  });
});

// ── STORY CHAPTERS ────────────────────────────────────────────────────────
const chapters = document.querySelectorAll(".story-chapter");
const dots = document.querySelectorAll(".dot");
const progressBar = document.getElementById("progress-bar");
const scrollContainer = document.querySelector(".story-panel__scroll");
let activeChapter = -1;
let isFlying = false;

function flyToChapter(index) {
  const chapter = chapters[index];
  if (!chapter) return;

  const lng = parseFloat(chapter.dataset.lng);
  const lat = parseFloat(chapter.dataset.lat);
  const zoom = parseFloat(chapter.dataset.zoom);
  const pitch = parseFloat(chapter.dataset.pitch) || 0;
  const bearing = parseFloat(chapter.dataset.bearing) || 0;

  // Stop any in-progress animation so we don't queue flights
  if (isFlying) map.stop();

  // Compute padding so the camera centers in the *visible* map area,
  // not the full canvas.  On desktop the story panel covers the left side;
  // on mobile the header and floating card eat top/bottom.
  let padding = { top: 0, bottom: 0, left: 0, right: 0 };
  if (window.innerWidth <= 768) {
    const mobileStoryEl = document.getElementById("mobile-story");
    if (mobileStoryEl) {
      const cardHeight = mobileStoryEl.offsetHeight || 0;
      const headerHeight = 72;
      padding = { top: headerHeight, bottom: cardHeight, left: 0, right: 0 };
    }
  } else {
    // Story panel sits on the left; offset the center into the open map area.
    const panelEl = document.getElementById("story-panel");
    const panelWidth = panelEl ? panelEl.offsetWidth : 0;
    padding = { top: 0, bottom: 0, left: panelWidth, right: 0 };
  }

  isFlying = true;
  map.flyTo({
    center: [lng, lat],
    zoom,
    pitch,
    bearing,
    padding,
    duration: 1800,
    essential: true,
  });

  map.once("moveend", () => {
    isFlying = false;
  });
}

// ── CHAPTER-DRIVEN SIDE EFFECTS ───────────────────────────────────────────
// Maps chapter index → marker id whose popup should be shown, or null
const chapterPopupMap = {
  0: "hq",
  1: "mojave",
};

// Maps chapter index → whether the Mojave overlay should be visible
const chapterMojaveVisible = {
  1: true,
};

function applyChapterSideEffects(index) {
  // ── Popups ──────────────────────────────────────────────────────────────
  // Always close any open popups first
  markers.forEach(({ popup }) => {
    if (popup.isOpen()) popup.remove();
  });

  // Only auto-open popups on desktop — on mobile the floating card
  // already shows the chapter info, so popups just add clutter.
  if (!isMobile()) {
    const popupTargetId = chapterPopupMap[index];
    if (popupTargetId) {
      const target = markers.find((m) => m.id === popupTargetId);
      // Small delay so the popup appears after flyTo starts
      if (target) setTimeout(() => target.marker.togglePopup(), 600);
    }
  }

  // ── Mojave overlay ───────────────────────────────────────────────────────
  setMojaveVisibility(!!chapterMojaveVisible[index]);
}

function setActiveChapter(index) {
  if (index === activeChapter) return;
  activeChapter = index;

  // Update chapter cards
  chapters.forEach((ch, i) => {
    ch.classList.toggle("active", i === index);
  });

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  // Fly the map
  flyToChapter(index);

  // Popups + layer effects
  applyChapterSideEffects(index);

  // Update progress
  const progress = ((index + 1) / chapters.length) * 100;
  progressBar.style.width = `${progress}%`;
}

// ── SCROLL-TRIGGERED CHAPTER DETECTION ────────────────────────────────────

// We use a scroll listener that finds which chapter's top edge is closest
// to (but not below) an activation line near the top of the scroll container.
// This guarantees sequential detection and can't skip chapters.

let currentObserverCleanup = null;

function initScrollObserver() {
  // Clean up any previous listener
  if (currentObserverCleanup) {
    currentObserverCleanup();
    currentObserverCleanup = null;
  }

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const onScroll = () => {
      const activationY = window.innerHeight * 0.3;
      let best = 0;

      // Walk chapters top-to-bottom; pick the last one whose top is
      // above (or at) the activation line.
      for (let i = 0; i < chapters.length; i++) {
        const rect = chapters[i].getBoundingClientRect();
        if (rect.top <= activationY) {
          best = i;
        }
      }

      setActiveChapter(best);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    currentObserverCleanup = () => window.removeEventListener("scroll", onScroll);
    onScroll();
  } else {
    const onScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const activationY = containerRect.top + containerRect.height * 0.25;
      let best = 0;

      for (let i = 0; i < chapters.length; i++) {
        const rect = chapters[i].getBoundingClientRect();
        if (rect.top <= activationY) {
          best = i;
        }
      }

      setActiveChapter(best);
    };

    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    currentObserverCleanup = () => scrollContainer.removeEventListener("scroll", onScroll);
    onScroll();
  }
}

// ── DOT NAVIGATION ────────────────────────────────────────────────────────
document.getElementById("chapter-dots").addEventListener("click", (e) => {
  const dot = e.target.closest(".dot");
  if (!dot) return;

  const target = parseInt(dot.dataset.target, 10);
  const chapter = chapters[target];
  if (!chapter) return;

  // Scroll the chapter into view in the panel
  chapter.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ── MOBILE CARD CONTROLLER ────────────────────────────────────────────────
const mobileCard = document.getElementById("mobile-card");
const mobileEyebrow = document.getElementById("mobile-eyebrow");
const mobileTitle = document.getElementById("mobile-title");
const mobileBody = document.getElementById("mobile-body");
const mobileStats = document.getElementById("mobile-stats");
const mobileTags = document.getElementById("mobile-tags");
const mobileCta = document.getElementById("mobile-cta");
const mobilePips = document.getElementById("mobile-pips");
const mobilePrev = document.getElementById("mobile-prev");
const mobileNext = document.getElementById("mobile-next");
let mobileChapterIndex = 0;

function isMobile() {
  return window.innerWidth <= 768;
}

// Build pip dots
function initMobilePips() {
  mobilePips.innerHTML = "";
  chapters.forEach((_, i) => {
    const pip = document.createElement("button");
    pip.className = "mobile-story__pip" + (i === 0 ? " active" : "");
    pip.dataset.index = i;
    pip.setAttribute("aria-label", `Chapter ${i + 1}`);
    mobilePips.appendChild(pip);
  });
}

// Extract content from a desktop chapter card and populate the mobile card
function populateMobileCard(index) {
  const ch = chapters[index];
  if (!ch) return;

  // Eyebrow
  const eyebrowEl = ch.querySelector(".story-chapter__eyebrow span");
  mobileEyebrow.textContent = eyebrowEl ? eyebrowEl.textContent : "";

  // Title
  const titleEl = ch.querySelector(".story-chapter__title");
  mobileTitle.textContent = titleEl ? titleEl.textContent : "";

  // Body
  const bodyEl = ch.querySelector(".story-chapter__body");
  mobileBody.textContent = bodyEl ? bodyEl.textContent.trim() : "";

  // Stats & tags are hidden on mobile to keep the card compact
  mobileStats.innerHTML = "";
  mobileTags.innerHTML = "";

  // CTA — clone them
  const ctaEl = ch.querySelector(".story-chapter__cta");
  if (ctaEl) {
    mobileCta.innerHTML = ctaEl.innerHTML;
  } else {
    mobileCta.innerHTML = "";
  }

  // Update pips
  mobilePips.querySelectorAll(".mobile-story__pip").forEach((pip, i) => {
    pip.classList.toggle("active", i === index);
  });

  // Update prev/next button states
  mobilePrev.disabled = index === 0;
  mobileNext.disabled = index === chapters.length - 1;

  // Scroll the card back to top if it was scrolled
  mobileCard.scrollTop = 0;
}

function setMobileChapter(index) {
  if (index < 0 || index >= chapters.length) return;
  mobileChapterIndex = index;
  populateMobileCard(index);
  flyToChapter(index);

  // Update progress
  const progress = ((index + 1) / chapters.length) * 100;
  progressBar.style.width = `${progress}%`;

  // Sync the desktop active state too (for consistency)
  activeChapter = index;
  chapters.forEach((ch, i) => ch.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));

  // Popups + layer effects
  applyChapterSideEffects(index);
}

// Prev / Next buttons
mobilePrev.addEventListener("click", () => {
  setMobileChapter(mobileChapterIndex - 1);
});

mobileNext.addEventListener("click", () => {
  setMobileChapter(mobileChapterIndex + 1);
});

// Pip clicks
mobilePips.addEventListener("click", (e) => {
  const pip = e.target.closest(".mobile-story__pip");
  if (!pip) return;
  const index = parseInt(pip.dataset.index, 10);
  setMobileChapter(index);
});

// Swipe support on mobile card
let touchStartX = 0;
let touchStartY = 0;
mobileCard.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

mobileCard.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  // Only register horizontal swipes (more horizontal than vertical, min 50px)
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) {
      // Swipe left → next
      setMobileChapter(mobileChapterIndex + 1);
    } else {
      // Swipe right → prev
      setMobileChapter(mobileChapterIndex - 1);
    }
  }
}, { passive: true });


// ── INIT ──────────────────────────────────────────────────────────────────
map.on("load", () => {
  // Init mobile pips
  initMobilePips();

  if (isMobile()) {
    // On mobile, populate the first card and skip scroll observer
    populateMobileCard(0);
    activeChapter = 0;
    progressBar.style.width = `${(1 / chapters.length) * 100}%`;
    // Trigger side effects for chapter 0 (opens HQ popup)
    setTimeout(() => applyChapterSideEffects(0), 800);
  } else {
    // Init scroll observer (will also set chapter 0 active + open HQ popup)
    initScrollObserver();
  }
});

// Re-init on resize (mobile <-> desktop transition)
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (isMobile()) {
      // Clean up scroll observer if it was active
      if (currentObserverCleanup) {
        currentObserverCleanup();
        currentObserverCleanup = null;
      }
      populateMobileCard(mobileChapterIndex);
    } else {
      initScrollObserver();
    }
  }, 300);
});