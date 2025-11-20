/**
 * Mighty Arm Excavation - Modern Animations & Interactions
 * Ultra-optimized for mobile with smooth, performant animations
 * Author: Claude
 * Last Updated: 2025-11-20
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION & UTILITIES
  // ========================================

  const config = {
    scrollRevealThreshold: 0.15, // 15% of element visible
    scrollDebounceMs: 10,
    parallaxSpeed: 0.5,
    lazyLoadMargin: '200px'
  };

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ========================================
  // INTERSECTION OBSERVER - SCROLL REVEALS
  // ========================================

  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('[data-scroll-reveal]');

    if (!revealElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: config.scrollRevealThreshold
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optionally unobserve after revealing
          // revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ========================================
  // LAZY LOADING IMAGES
  // ========================================

  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if (!images.length) return;

    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      images.forEach(img => {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
      });
    } else {
      // Fallback for older browsers
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: config.lazyLoadMargin
      });

      images.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // ========================================
  // SCROLL PROGRESS INDICATOR
  // ========================================

  function initScrollProgress() {
    // Create progress bar if it doesn't exist
    let progressBar = document.querySelector('.scroll-progress');

    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.setAttribute('aria-hidden', 'true');
      document.body.prepend(progressBar);
    }

    const updateProgress = throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / scrollHeight) * 100;

      progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
    }, 50);

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call
  }

  // ========================================
  // SMOOTH PARALLAX SCROLLING
  // ========================================

  function initParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 768) return; // Skip on mobile for performance

    const parallaxElements = document.querySelectorAll('.parallax-image, [data-parallax]');

    if (!parallaxElements.length) return;

    const handleParallax = throttle(() => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(el => {
        const speed = el.dataset.parallaxSpeed || config.parallaxSpeed;
        const offset = scrolled * speed;
        el.style.transform = `translateY(${offset}px) translateZ(0)`;
      });
    }, 16); // ~60fps

    window.addEventListener('scroll', handleParallax, { passive: true });
  }

  // ========================================
  // STICKY HEADER WITH HIDE ON SCROLL DOWN
  // ========================================

  function initStickyHeader() {
    const header = document.querySelector('header, #SITE_HEADER, [data-mesh-id*="HEADER"]');

    if (!header) return;

    let lastScrollTop = 0;
    const scrollThreshold = 100;

    const handleHeaderScroll = throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > scrollThreshold) {
        header.classList.add('sticky');

        // Hide on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
          header.classList.add('hide');
        } else {
          header.classList.remove('hide');
        }
      } else {
        header.classList.remove('sticky', 'hide');
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 50);

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  }

  // ========================================
  // SMOOTH SCROLL TO ANCHOR LINKS
  // ========================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if it's just '#'
        if (href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  // ========================================
  // ENHANCED TOUCH INTERACTIONS FOR MOBILE
  // ========================================

  function initTouchEnhancements() {
    if (window.innerWidth > 768) return;

    // Add touch feedback to interactive elements
    const touchElements = document.querySelectorAll('a, button, [role="button"]');

    touchElements.forEach(el => {
      el.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      }, { passive: true });

      el.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touch-active');
        }, 300);
      }, { passive: true });

      el.addEventListener('touchcancel', function() {
        this.classList.remove('touch-active');
      }, { passive: true });
    });
  }

  // ========================================
  // ANIMATED COUNTERS (for statistics)
  // ========================================

  function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    const observerOptions = {
      threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const el = entry.target;
          const target = parseInt(el.dataset.counter);
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const updateCounter = () => {
            current += increment;
            if (current < target) {
              el.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target;
              el.classList.add('counted');
            }
          };

          updateCounter();
          counterObserver.unobserve(el);
        }
      });
    }, observerOptions);

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  // ========================================
  // FORM VALIDATION ENHANCEMENTS
  // ========================================

  function initFormEnhancements() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', function() {
          this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
          if (!this.value) {
            this.parentElement.classList.remove('focused');
          }
        });

        // Real-time validation feedback
        input.addEventListener('input', debounce(function() {
          if (this.validity.valid) {
            this.classList.remove('invalid');
            this.classList.add('valid');
          } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
          }
        }, 300));
      });
    });
  }

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================

  function monitorPerformance() {
    if (!window.performance || !window.PerformanceObserver) return;

    // Monitor Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support LCP observation
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Browser doesn't support FID observation
    }
  }

  // ========================================
  // AUTO-ANIMATE ELEMENTS ON PAGE LOAD
  // ========================================

  function animateOnLoad() {
    if (prefersReducedMotion) return;

    // Add staggered fade-in to main content sections
    const sections = document.querySelectorAll('section, .section, [data-auto-animate]');

    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('fade-in');
      }, index * 100);
    });
  }

  // ========================================
  // VIEWPORT HEIGHT FIX FOR MOBILE
  // ========================================

  function fixMobileViewport() {
    // Fix for mobile browsers that change viewport height on scroll
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', debounce(setVh, 250));
  }

  // ========================================
  // PRELOAD CRITICAL RESOURCES
  // ========================================

  function preloadResources() {
    const preloadLinks = [
      // Add critical resources here
    ];

    preloadLinks.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      document.head.appendChild(link);
    });
  }

  // ========================================
  // INITIALIZE ALL FEATURES
  // ========================================

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('🎨 Mighty Arm Excavation - Modern Enhancements Loaded');

    // Initialize all features
    initScrollReveal();
    initLazyLoading();
    initScrollProgress();
    initParallax();
    initStickyHeader();
    initSmoothScroll();
    initTouchEnhancements();
    initCounterAnimations();
    initFormEnhancements();
    fixMobileViewport();
    preloadResources();

    // Animate on load
    setTimeout(animateOnLoad, 100);

    // Performance monitoring (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      monitorPerformance();
    }

    // Mark as initialized
    document.body.classList.add('animations-ready');
  }

  // Start initialization
  init();

  // ========================================
  // EXPOSE PUBLIC API
  // ========================================

  window.MightyArmAnimations = {
    version: '1.0.0',
    reveal: initScrollReveal,
    parallax: initParallax,
    prefersReducedMotion
  };

})();

// ========================================
// SERVICE WORKER REGISTRATION (Optional)
// ========================================

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    // Uncomment when service worker is created
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}
