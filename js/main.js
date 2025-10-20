/**
 * Main JavaScript functionality for Third Rock Analytics website
 * This file handles header interactions, smooth navigation scrolling, and an interactive hero map
 */

(function () {
  "use strict"; // Enforces strict mode to catch common JavaScript errors

  // ========================================================================
  // CONFIGURATION OBJECT
  // ========================================================================
  // Central configuration for easy customization of timing and assets
  const CONFIG = {
    scrollThreshold: 50, // Pixels to scroll before header changes appearance
    scrollDuration: 1200, // Milliseconds for smooth scroll animations (1.2 seconds)
    logos: {
      // Logo images that switch based on scroll position
      default: "/media/Color Logo_Text_No BG.png", // Logo when at top of page
      scrolled: "/media/Black Logo_Text_No BG.png", // Logo when scrolled down
    },
  };

  // ========================================================================
  // DOM ELEMENT CACHE
  // ========================================================================
  // Store frequently used DOM elements to avoid repeated queries
  const elements = {
    header: null,     // The fixed header element
    logo: null,       // The logo image element
    navLinks: null,   // All navigation links that start with "#"
  };

  // ========================================================================
  // MAIN INITIALIZATION FUNCTION
  // ========================================================================
  /**
   * Initialize the application
   * Called when DOM is ready - sets up all functionality
   */
  function init() {
    cacheElements();    // Store DOM references for better performance
    bindEvents();       // Attach event listeners
    
    // Initialize the hero map only if the hero-map element exists on the page
    if (document.getElementById('hero-map')) {
      initHeroMap();
    }
  }

  // ========================================================================
  // DOM ELEMENT CACHING
  // ========================================================================
  /**
   * Cache frequently used DOM elements
   * This improves performance by avoiding repeated DOM queries
   */
  function cacheElements() {
    elements.header = document.getElementById("header");           // Fixed header bar
    elements.logo = document.getElementById("header-logo");       // Logo image
    elements.navLinks = document.querySelectorAll('a[href^="#"]'); // All anchor links that start with #
  }

  // ========================================================================
  // EVENT BINDING
  // ========================================================================
  /**
   * Bind event listeners to DOM elements and window
   */
  function bindEvents() {
    // Listen for scroll events to change header appearance
    window.addEventListener("scroll", handleScroll);
    
    // Listen for window resize with debouncing to improve performance
    // Debouncing prevents the function from firing too frequently during resize
    window.addEventListener("resize", debounce(handleResize, 250));
    
    // Add smooth scroll behavior to all navigation links
    elements.navLinks.forEach(link => {
      link.addEventListener("click", handleSmoothScroll);
    });
  }

  // ========================================================================
  // SMOOTH SCROLLING FUNCTIONALITY
  // ========================================================================
  /**
   * Handle smooth scrolling for navigation links
   * Prevents default anchor behavior and implements custom smooth scrolling
   * @param {Event} event - The click event on a navigation link
   */
  function handleSmoothScroll(event) {
    event.preventDefault(); // Stop the browser's default jump-to-anchor behavior
    
    // Get the target section ID from the link's href attribute (e.g., "#about")
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Calculate how much space the fixed header takes up
      // const headerHeight = elements.header ? elements.header.offsetHeight : 100;
      const headerHeight = 100;
      const extraPadding = 0; // Additional spacing for better visual separation
      
      // Calculate final scroll position: element position minus header height minus padding
      const targetPosition = targetElement.offsetTop - headerHeight - extraPadding;
      
      // Execute the smooth scroll animation
      smoothScrollTo(targetPosition, CONFIG.scrollDuration);
    }
  }

  // ========================================================================
  // CUSTOM SMOOTH SCROLL IMPLEMENTATION
  // ========================================================================
  /**
   * Custom smooth scroll function with configurable duration and easing
   * Uses requestAnimationFrame for smooth 60fps animation
   * @param {number} targetPosition - Final scroll position in pixels
   * @param {number} duration - Animation duration in milliseconds
   */
  function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset; // Current scroll position
    const distance = targetPosition - startPosition; // How far we need to scroll
    let startTime = null; // Will store when animation started

    /**
     * Animation frame function - called every frame (60fps)
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    function animation(currentTime) {
      // Set start time on first frame
      if (startTime === null) startTime = currentTime;
      
      // Calculate how much time has passed (0 to 1)
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1); // Cap at 1 (100%)
      
      // Easing function (ease-in-out) for smooth acceleration/deceleration
      // Creates an S-curve: slow start, fast middle, slow end
      const ease = progress < 0.5 
        ? 2 * progress * progress                        // First half: accelerate
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;       // Second half: decelerate
      
      // Calculate current position and scroll to it
      window.scrollTo(0, startPosition + distance * ease);
      
      // Continue animation if we haven't reached the end
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    // Start the animation
    requestAnimationFrame(animation);
  }

  // ========================================================================
  // HEADER SCROLL EFFECTS
  // ========================================================================
  /**
   * Handle scroll events to change header appearance
   * Makes header smaller and changes logo when user scrolls down
   */
  function handleScroll() {
    // Exit early if required elements don't exist
    if (!elements.header || !elements.logo) return;

    const scrollY = window.scrollY; // Current vertical scroll position
    const isScrolled = scrollY > CONFIG.scrollThreshold; // Have we scrolled past threshold?

    if (isScrolled) {
      // User has scrolled down - apply scrolled styles
      elements.header.classList.add("scrolled");     // Add CSS class for smaller header
      elements.logo.src = CONFIG.logos.scrolled;     // Switch to black logo
    } else {
      // User is at top - apply default styles
      elements.header.classList.remove("scrolled");  // Remove scrolled class
      elements.logo.src = CONFIG.logos.default;      // Switch to color logo
    }
  }

  // ========================================================================
  // WINDOW RESIZE HANDLER
  // ========================================================================
  /**
   * Handle window resize events
   * Currently just logs resize events, but can be extended for responsive behavior
   */
  function handleResize() {
    // Placeholder for any resize-specific functionality
    console.log("Window resized");
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================
  /**
   * Debounce function to limit how often a function can be called
   * Prevents performance issues during rapid events like window resize
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately on first call
   * @returns {Function} Debounced function
   */
  function debounce(func, wait, immediate) {
    let timeout; // Store timeout ID
    
    return function executedFunction() {
      const context = this;      // Preserve 'this' context
      const args = arguments;    // Preserve arguments

      // Function to call later
      const later = function () {
        timeout = null;                              // Clear timeout
        if (!immediate) func.apply(context, args);   // Execute if not immediate
      };

      const callNow = immediate && !timeout; // Should we call immediately?
      clearTimeout(timeout);                 // Clear existing timeout
      timeout = setTimeout(later, wait);     // Set new timeout

      if (callNow) func.apply(context, args); // Execute immediately if needed
    };
  }

  // ========================================================================
  // APPLICATION STARTUP
  // ========================================================================
  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    // DOM still loading - wait for DOMContentLoaded event
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM already loaded - initialize immediately
    init();
  }

})(); // End of IIFE (Immediately Invoked Function Expression)