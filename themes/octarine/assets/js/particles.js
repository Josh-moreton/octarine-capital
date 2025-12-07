/**
 * Octarine Capital - Particle Animation
 * Subtle, performant particle effect for the hero section
 */

(function() {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];

  // Configuration
  const config = {
    particleCount: 75,
    particleColor: 'rgba(124, 245, 212, 0.6)', // Octarine teal
    lineColor: 'rgba(124, 245, 212, 0.15)',
    particleRadius: 2,
    maxSpeed: 0.5,
    connectionDistance: 150,
    mouseInteractionRadius: 100
  };

  // Mouse position
  let mouse = {
    x: null,
    y: null
  };

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * config.maxSpeed;
      this.vy = (Math.random() - 0.5) * config.maxSpeed;
      this.radius = config.particleRadius;
    }

    update() {
      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Keep within bounds
      this.x = Math.max(0, Math.min(canvas.width, this.x));
      this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.particleColor;
      ctx.fill();
    }
  }

  // Initialize canvas size
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Initialize particles
  function init() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connections between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = 1 - (distance / config.connectionDistance);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124, 245, 212, ${opacity * 0.15})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    drawConnections();

    animationId = requestAnimationFrame(animate);
  }

  // Reduce animation when not visible
  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  }

  // Event listeners
  window.addEventListener('resize', () => {
    resize();
    init();
  });

  document.addEventListener('visibilitychange', handleVisibilityChange);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Start
  resize();
  init();
  animate();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');
    });
  }

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });

  // ============================================
  // Performance Stats Counter Animation
  // Scramble effect before landing on final value
  // ============================================

  class StatCounter {
    constructor(element) {
      this.element = element;
      this.numberEl = element.querySelector('.stat-number');
      this.target = parseFloat(element.dataset.target);
      this.format = element.dataset.format;
      this.hasAnimated = false;
      this.scrambleDuration = 1500; // Total animation time
      this.scrambleSpeed = 50; // Speed of number changes
    }

    formatNumber(value) {
      if (this.format === 'currency') {
        // Format as currency (e.g., $127.5M)
        if (value >= 1000000000) {
          return '$' + (value / 1000000000).toFixed(1) + 'B';
        } else if (value >= 1000000) {
          return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          return '$' + (value / 1000).toFixed(0) + 'K';
        }
        return '$' + value.toFixed(0);
      } else if (this.format === 'percent') {
        return value.toFixed(2);
      }
      return value.toString();
    }

    generateScramble() {
      // Generate a random number in a similar range
      if (this.format === 'currency') {
        const magnitude = Math.pow(10, Math.floor(Math.log10(this.target)));
        return Math.random() * magnitude * 10;
      } else if (this.format === 'percent') {
        return Math.random() * 40 - 10;
      }
      return Math.random() * this.target * 2;
    }

    animate() {
      if (this.hasAnimated) return;
      this.hasAnimated = true;

      const startTime = performance.now();
      const scrambleEndTime = this.scrambleDuration * 0.7; // Scramble for 70% of duration

      const tick = (currentTime) => {
        const elapsed = currentTime - startTime;

        if (elapsed < scrambleEndTime) {
          // Scramble phase - show random numbers
          const scrambledValue = this.generateScramble();
          this.numberEl.textContent = this.formatNumber(scrambledValue);
          setTimeout(() => requestAnimationFrame(tick), this.scrambleSpeed);
        } else if (elapsed < this.scrambleDuration) {
          // Settle phase - ease towards final value
          const settleProgress = (elapsed - scrambleEndTime) / (this.scrambleDuration - scrambleEndTime);
          const eased = 1 - Math.pow(1 - settleProgress, 3); // Ease out cubic

          // Mix between random and target
          if (Math.random() > eased) {
            this.numberEl.textContent = this.formatNumber(this.generateScramble());
          } else {
            this.numberEl.textContent = this.formatNumber(this.target);
          }
          setTimeout(() => requestAnimationFrame(tick), this.scrambleSpeed);
        } else {
          // Final value
          this.numberEl.textContent = this.formatNumber(this.target);
          this.element.classList.add('is-counted');
        }
      };

      requestAnimationFrame(tick);
    }
  }

  // Initialize stat counters
  const statCounters = [];
  document.querySelectorAll('.stat-value').forEach(el => {
    statCounters.push(new StatCounter(el));
  });

  // Observe performance section for counter animation
  const performanceSection = document.querySelector('.section--performance');
  if (performanceSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger the animations slightly
          statCounters.forEach((counter, index) => {
            setTimeout(() => counter.animate(), index * 150);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(performanceSection);
  }
})();
