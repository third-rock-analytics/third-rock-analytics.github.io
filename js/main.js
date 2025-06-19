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
      const headerHeight = elements.header ? elements.header.offsetHeight : 100;
      const extraPadding = 20; // Additional spacing for better visual separation
      
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
  // HERO MAP INITIALIZATION
  // ========================================================================
  /**
   * Initialize the hero map with enhanced features
   * Creates an interactive map background for the hero section
   * @returns {ol.Map} The configured OpenLayers map instance
   */
  function initHeroMap() {
    
    // ========================================================================
    // MAP LOCATION CONFIGURATION
    // ========================================================================
    // Gentler zoom-based locations with smaller zoom differences to prevent motion sickness
    const heroLocations = [
      {
        name: "United States - National Overview",
        coords: [-98.5, 39.8], // Geographic center of US (longitude, latitude)
        zoom: 5, // Slightly closer starting view than typical country-level
        description: "Continental-scale geographic analysis"
      },
      {
        name: "Great Lakes Region - Cleveland",
        coords: [-81.69, 41.49], // Cleveland, Ohio coordinates
        zoom: 8, // Regional view - reduced from typical city zoom for gentler transitions
        description: "Freshwater resources and urban development"
      },
      {
        name: "Ohio Valley - Columbus",
        coords: [-82.99, 39.96], // Columbus, Ohio coordinates
        zoom: 8, // Consistent zoom level with nearby cities for smooth transitions
        description: "Regional planning and infrastructure"
      },
      {
        name: "Southwest Desert - Phoenix",
        coords: [-112.07, 33.45], // Phoenix, Arizona coordinates
        zoom: 8, // Reduced zoom for gentler transitions across country
        description: "Arid land management and urban sprawl"
      },
      {
        name: "California Coast - San Diego",
        coords: [-117.16, 32.72], // San Diego, California coordinates
        zoom: 8, // Consistent zoom level for predictable movement
        description: "Coastal development and marine ecosystems"
      },
      {
        name: "Texas Region - San Antonio", 
        coords: [-98.49, 29.42], // San Antonio, Texas coordinates
        zoom: 8, // Consistent zoom level
        description: "Water resources and regional analysis"
      },
      {
        name: "Pacific Northwest - Seattle",
        coords: [-122.33, 47.6], // Seattle, Washington coordinates
        zoom: 8, // Consistent zoom level
        description: "Environmental monitoring and urban geography"
      }
    ];

    // ========================================================================
    // MAP CREATION WITH OPTIMIZATIONS
    // ========================================================================
    // Create the hero map with aggressive preloading for the entire US region
    const heroMap = new ol.Map({
      target: "hero-map", // ID of the HTML element to render the map in
      
      // Define map layers (bottom to top)
      layers: [
        // Base layer: High-quality satellite imagery
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            // Esri World Imagery - high-quality satellite tiles
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            // Required attribution for Esri services
            attributions: 'Imagery © Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
            maxZoom: 18, // Maximum zoom level available
            crossOrigin: 'anonymous' // Enable cross-origin requests for better loading
          }),
          preload: 4, // Aggressive preloading - cache 4 zoom levels worth of tiles
          useInterimTilesOnError: false // Don't show lower-quality tiles on error
        }),
        
        // Overlay layer: Place names and boundaries
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            // Esri reference layer with labels and boundaries
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            attributions: 'Labels © Esri',
            maxZoom: 18,
            crossOrigin: 'anonymous'
          }),
          opacity: 0.6, // Semi-transparent so satellite imagery shows through
          preload: 4 // Aggressive preloading for labels too
        })
      ],
      
      // Configure the map view (camera)
      view: new ol.View({
        center: ol.proj.fromLonLat(heroLocations[0].coords), // Start with US overview
        zoom: heroLocations[0].zoom, // Initial zoom level
        maxZoom: 18, // Maximum allowed zoom
        minZoom: 3,  // Minimum allowed zoom
        enableRotation: false, // Disable map rotation for stability
        constrainResolution: true, // Snap to integer zoom levels for better caching
        
        // Constrain view to US bounds to improve tile caching
        // Transform from lat/lon to web mercator projection
        extent: ol.proj.transformExtent(
          [-130, 20, -65, 50], // Rough US bounds [west, south, east, north] in degrees
          'EPSG:4326',         // Source projection (lat/lon)
          'EPSG:3857'          // Target projection (web mercator)
        )
      }),
      
      // Performance optimizations
      loadTilesWhileAnimating: true,   // Continue loading tiles during zoom/pan animations
      loadTilesWhileInteracting: true  // Load tiles during user interactions (drag, etc.)
    });

    // ========================================================================
    // DISABLE TOUCH INTERACTIONS FOR MOBILE
    // ========================================================================
    // Disable touch interactions to prevent interference with page scrolling on mobile
    const interactions = heroMap.getInteractions(); // Get all map interactions
    interactions.forEach(function(interaction) {
      // Remove mouse wheel zoom to prevent scroll interference
      if (interaction instanceof ol.interaction.MouseWheelZoom) {
        heroMap.removeInteraction(interaction);
      }
      // Remove touch interactions that interfere with mobile scrolling
      if (interaction instanceof ol.interaction.PinchZoom) {
        heroMap.removeInteraction(interaction); // Disable pinch-to-zoom
      }
      if (interaction instanceof ol.interaction.DragPan) {
        heroMap.removeInteraction(interaction); // Disable touch dragging
      }
      if (interaction instanceof ol.interaction.DoubleClickZoom) {
        heroMap.removeInteraction(interaction); // Disable double-tap zoom
      }
    });

    // Map created without marker layer - clean visual presentation
    // No marker layer needed since the tour itself shows the locations clearly

    let currentHeroLocationIndex = 0; // Track which location we're currently showing

    /**
     * Simplified preloading - not as critical with zoom-based approach
     * With zoom-based transitions, tiles are mostly already cached
     * @param {Object} location - Location object with name, coords, zoom
     */
    function preloadLocationTiles(location) {
      // With zoom-based transitions, tiles are already cached by the preload setting
      // This function can be simplified or removed, but kept for potential future use
      console.log(`Preparing transition to ${location.name}`);
    }

    /**
     * Clean fly-to function with motion-sickness-friendly transitions
     * Smoothly moves map to a new location with gentle animation - no markers
     * @param {Object} location - Location object with name, coords, zoom, description
     */
    function flyToHeroLocation(location) {
      const view = heroMap.getView(); // Get the map's view (camera)
      const coords = ol.proj.fromLonLat(location.coords); // Convert lat/lon to map projection
      
      // Execute very slow, gentle animation to prevent motion sickness
      // No markers needed - the location is clear from the map imagery itself
      view.animate({
        center: coords,           // Target coordinates
        zoom: location.zoom,      // Target zoom level
        duration: 8000,           // 8 seconds for very gentle movement
        easing: ol.easing.easeInOut // Smooth acceleration/deceleration curve
      });
    }

    // ========================================================================
    // AUTO-CYCLING FUNCTIONALITY
    // ========================================================================
    /**
     * Auto-cycle through locations with longer pauses between gentle movements
     * Creates a continuous tour of all locations
     */
    function startHeroLocationCycle() {
      setInterval(() => {
        // Move to next location (with wraparound to beginning)
        currentHeroLocationIndex = (currentHeroLocationIndex + 1) % heroLocations.length;
        flyToHeroLocation(heroLocations[currentHeroLocationIndex]);
      }, 12000); // 12 seconds between movements (8s animation + 4s pause)
    }

    // ========================================================================
    // PREVENT TOUCH EVENTS ON MAP CONTAINER
    // ========================================================================
    // Add additional touch event prevention directly to the map container
    const mapElement = document.getElementById('hero-map');
    if (mapElement) {
      // Prevent touch events from interfering with page scroll
      mapElement.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior
      }, { passive: false }); // passive: false allows preventDefault to work
      
      mapElement.addEventListener('touchmove', function(e) {
        e.preventDefault(); // Prevent touch scrolling/panning on map
      }, { passive: false });
      
      mapElement.addEventListener('touchend', function(e) {
        e.preventDefault(); // Prevent any touch end behaviors
      }, { passive: false });
      
      // Also prevent mouse events for consistency
      mapElement.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent mouse dragging
      });
      
      // Set CSS to indicate the map is not interactive
      mapElement.style.touchAction = 'none'; // CSS property to disable touch behaviors
      mapElement.style.userSelect = 'none';  // Prevent text selection
      mapElement.style.pointerEvents = 'none'; // Disable all pointer events
    }

    // ========================================================================
    // MAP INITIALIZATION
    // ========================================================================
    // Initialize with first location (US overview)
    flyToHeroLocation(heroLocations[0]);

    // Start the automatic cycling with a delay to let users get oriented
    setTimeout(startHeroLocationCycle, 5000); // 5 seconds initial delay

    // ========================================================================
    // KEYBOARD CONTROLS (DESKTOP ONLY)
    // ========================================================================
    // Add keyboard navigation for advanced users (desktop only since mobile doesn't have easy keyboard access)
    document.addEventListener('keydown', function(event) {
      // Only respond to keyboard when focus is in the hero section
      if (event.target.closest('.hero')) {
        switch(event.key) {
          case 'ArrowLeft':
            // Go to previous location
            currentHeroLocationIndex = (currentHeroLocationIndex - 1 + heroLocations.length) % heroLocations.length;
            flyToHeroLocation(heroLocations[currentHeroLocationIndex]);
            break;
          case 'ArrowRight':
            // Go to next location
            currentHeroLocationIndex = (currentHeroLocationIndex + 1) % heroLocations.length;
            flyToHeroLocation(heroLocations[currentHeroLocationIndex]);
            break;
          case ' ': // Spacebar
            event.preventDefault(); // Prevent page scroll
            // Could add pause/resume functionality here in the future
            break;
        }
      }
    });

    return heroMap; // Return the map instance for potential future use
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