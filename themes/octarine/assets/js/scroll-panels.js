/**
 * Octarine Capital - GSAP ScrollTrigger Horizontal Panels
 * 
 * Creates a vertical → horizontal → vertical scroll experience:
 * 1. Hero section (vertical scroll)
 * 2. Panels container (horizontal scroll via ScrollTrigger pin)
 * 3. Insights section (vertical scroll)
 */

(function() {
  'use strict';

  // Wait for GSAP to load
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded. Scroll panels disabled.');
    return;
  }

  // Register plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // References
  const panelsSection = document.querySelector('#panels');
  const panelsContainer = document.querySelector('#panels-container');
  
  if (!panelsSection || !panelsContainer) {
    // Not on homepage, exit gracefully
    return;
  }

  const panels = gsap.utils.toArray('#panels-container .panel');
  
  if (panels.length === 0) {
    return;
  }

  // Store the horizontal scroll tween for anchor navigation
  let horizontalTween;

  // ============================================
  // Horizontal Scroll Animation
  // ============================================
  
  function initHorizontalScroll() {
    // Set container width to fit all panels
    gsap.set(panelsContainer, {
      width: `${panels.length * 100}%`
    });

    // Set each panel to equal width
    gsap.set(panels, {
      width: `${100 / panels.length}%`
    });

    // Create the horizontal scroll tween
    horizontalTween = gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: panelsContainer,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        snap: {
          snapTo: 1 / (panels.length - 1),
          inertia: false,
          duration: { min: 0.1, max: 0.3 }
        },
        start: 'top top',
        end: () => `+=${panelsContainer.offsetWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
        // Add markers for debugging (remove in production)
        // markers: true
      }
    });
  }

  // ============================================
  // Anchor Navigation
  // ============================================
  
  function initAnchorNavigation() {
    document.querySelectorAll('.anchor').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        
        // Handle home link
        if (href === '/' || href === '#hero') {
          gsap.to(window, {
            scrollTo: { y: 0, autoKill: false },
            duration: 1,
            ease: 'power2.inOut'
          });
          closeMobileNav();
          return;
        }

        const targetElem = document.querySelector(href);
        if (!targetElem) return;

        // Check if target is inside horizontal panels
        const isInPanels = panelsContainer && panelsContainer.contains(targetElem);

        if (isInPanels && horizontalTween) {
          // Calculate scroll position for horizontal panel
          const scrollTrigger = horizontalTween.scrollTrigger;
          const totalScroll = scrollTrigger.end - scrollTrigger.start;
          const totalMovement = (panels.length - 1) * targetElem.offsetWidth;
          const targetScroll = scrollTrigger.start + (targetElem.offsetLeft / totalMovement) * totalScroll;

          gsap.to(window, {
            scrollTo: { y: targetScroll, autoKill: false },
            duration: 1,
            ease: 'power2.inOut'
          });
        } else {
          // Standard vertical scroll
          gsap.to(window, {
            scrollTo: { y: targetElem, autoKill: false, offsetY: 0 },
            duration: 1,
            ease: 'power2.inOut'
          });
        }

        closeMobileNav();
      });
    });
  }

  // ============================================
  // Mobile Navigation Helper
  // ============================================
  
  function closeMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
    }
  }

  // ============================================
  // Panel Visibility Animations
  // ============================================
  
  function initPanelAnimations() {
    // Animate each panel's content as it comes into view
    panels.forEach((panel, index) => {
      const content = panel.querySelector('.panel-content');
      const header = panel.querySelector('.section-header');
      const cards = panel.querySelectorAll('.approach-card');
      const stats = panel.querySelectorAll('.performance-stat');

      if (!content) return;

      // Create a timeline for this panel
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          containerAnimation: horizontalTween,
          start: 'left center',
          end: 'right center',
          toggleActions: 'play none none reverse',
          // markers: true
        }
      });

      // Animate header
      if (header) {
        tl.from(header, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, 0);
      }

      // Stagger cards (approach section)
      if (cards.length > 0) {
        tl.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out'
        }, 0.2);
      }

      // Stagger stats (performance section)
      if (stats.length > 0) {
        tl.from(stats, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out'
        }, 0.2);
      }
    });
  }

  // ============================================
  // Vertical Sections Animation (Hero + Insights)
  // ============================================
  
  function initVerticalAnimations() {
    // Hero scroll indicator animation
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
      gsap.to(heroScroll, {
        y: 10,
        duration: 1,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Insights section (vertical, after panels)
    const insightsSection = document.querySelector('.section--insights');
    if (insightsSection) {
      const insightsCards = insightsSection.querySelectorAll('.insight-card');
      
      gsap.from(insightsSection.querySelector('.section-header'), {
        scrollTrigger: {
          trigger: insightsSection,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      if (insightsCards.length > 0) {
        gsap.from(insightsCards, {
          scrollTrigger: {
            trigger: insightsSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          },
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out'
        });
      }
    }
  }

  // ============================================
  // Active Nav State
  // ============================================
  
  function initActiveNavState() {
    const navLinks = document.querySelectorAll('.nav-menu .anchor');

    // Update active state based on scroll position
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveNav('#hero'),
      onEnterBack: () => setActiveNav('#hero')
    });

    // For horizontal panels
    panels.forEach(panel => {
      ScrollTrigger.create({
        trigger: panel,
        containerAnimation: horizontalTween,
        start: 'left center',
        end: 'right center',
        onEnter: () => setActiveNav(`#${panel.id}`),
        onEnterBack: () => setActiveNav(`#${panel.id}`)
      });
    });

    // For insights section
    const insightsSection = document.querySelector('#insights');
    if (insightsSection) {
      ScrollTrigger.create({
        trigger: insightsSection,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveNav('#insights'),
        onEnterBack: () => setActiveNav('#insights')
      });
    }

    function setActiveNav(hash) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }
  }

  // ============================================
  // Responsive Handling
  // ============================================
  
  function initResponsive() {
    // Create a matchMedia for mobile
    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
      // Desktop: horizontal scroll
      initHorizontalScroll();
      initPanelAnimations();
      initActiveNavState();
      
      return () => {
        // Cleanup on mobile
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    });

    mm.add('(max-width: 768px)', () => {
      // Mobile: stack panels vertically, no horizontal scroll
      gsap.set(panelsContainer, { width: '100%' });
      gsap.set(panels, { width: '100%' });
      
      // Simple fade-in animations for mobile
      panels.forEach(panel => {
        gsap.from(panel, {
          scrollTrigger: {
            trigger: panel,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
  }

  // ============================================
  // Initialize
  // ============================================
  
  // Slight delay to ensure DOM is ready
  gsap.delayedCall(0.1, () => {
    initResponsive();
    initAnchorNavigation();
    initVerticalAnimations();
  });

  // Refresh ScrollTrigger on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

})();
