/**
 * Main JavaScript functionality for Third Rock Analytics website
 */

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    scrollThreshold: 50,
    logos: {
      default: "/media/Color Logo_Text_No BG.png",
      scrolled: "/media/Black Logo_Text_No BG.png",
    },
  };

  // Cache DOM elements
  const elements = {
    header: null,
    logo: null,
  };

  /**
   * Initialize the application
   */
  function init() {
    cacheElements();
    bindEvents();
  }

  /**
   * Cache frequently used DOM elements
   */
  function cacheElements() {
    elements.header = document.getElementById("header");
    elements.logo = document.getElementById("header-logo");
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", debounce(handleResize, 250));
  }

  /**
   * Handle scroll events
   */
  function handleScroll() {
    if (!elements.header || !elements.logo) return;

    const scrollY = window.scrollY;
    const isScrolled = scrollY > CONFIG.scrollThreshold;

    if (isScrolled) {
      elements.header.classList.add("scrolled");
      elements.logo.src = CONFIG.logos.scrolled;
    } else {
      elements.header.classList.remove("scrolled");
      elements.logo.src = CONFIG.logos.default;
    }
  }

  /**
   * Handle window resize events
   */
  function handleResize() {
    // Add any resize-specific functionality here if needed
    console.log("Window resized");
  }

  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;

      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
