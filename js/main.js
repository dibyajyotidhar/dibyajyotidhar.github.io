/* ═══════════════════════════════════════════════════════
   main.js — Dibya Jyoti Dhar · SQA Portfolio
   Handles: theme, typewriter, scroll reveal, navbar,
            skill tabs, hamburger, back-to-top, year
═══════════════════════════════════════════════════════ */

'use strict';

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTypewriter();
  initScrollReveal();
  initNavbar();
  initSkillTabs();
  initHamburger();
  initBackToTop();
  initYear();
});

/* ═══════════════════════════════════════════════════════
   1. THEME TOGGLE
   Persists preference in localStorage.
   Toggles [data-theme] on <html>.
═══════════════════════════════════════════════════════ */
function initTheme() {
  const html       = document.documentElement;
  const btn        = document.getElementById('themeToggle');
  const icon       = document.getElementById('themeIcon');

  // Resolve initial theme: localStorage → OS preference → dark
  const saved = localStorage.getItem('djd-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ?? (prefersDark ? 'dark' : 'light');

  applyTheme(initial);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('djd-theme', next);
  });

  // Sync if OS changes and user hasn't manually chosen
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('djd-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (icon) {
      icon.className = theme === 'dark'
        ? 'fa-solid fa-sun'
        : 'fa-solid fa-moon';
    }
    btn.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
}

/* ═══════════════════════════════════════════════════════
   2. TYPEWRITER EFFECT
   Types a sequence of QA-themed strings with a
   realistic variable-speed rhythm. Pure CSS cursor.
═══════════════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'SQA Engineer',
    'Manual Testing Expert',
    'Selenium Automation',
    'Playwright Practitioner',
    'Cypress Tester',
    'API Testing with Postman',
    'Bug Hunter by Profession',
    'Quality is not an Act — it\'s a Habit',
  ];

  let phraseIndex  = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  let isPaused     = false;

  const TYPE_SPEED   = 68;   // ms per character typed
  const DELETE_SPEED = 32;   // ms per character deleted
  const PAUSE_END    = 1800; // ms pause at end of phrase
  const PAUSE_START  = 300;  // ms pause before typing next

  function tick() {
    const current = phrases[phraseIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(tick, isDeleting ? PAUSE_START : PAUSE_END);
      return;
    }

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Finished typing — pause, then delete
        isDeleting = true;
        isPaused   = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      // Deleting
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting   = false;
        isPaused     = true;
        phraseIndex  = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }

    // Slight randomness in typing speed for realism
    const jitter = Math.random() * 30 - 10;
    const delay  = isDeleting
      ? DELETE_SPEED + jitter
      : TYPE_SPEED + jitter;

    setTimeout(tick, Math.max(15, delay));
  }

  // Start after a short boot delay (hero reveal already happening)
  setTimeout(tick, 800);
}

/* ═══════════════════════════════════════════════════════
   3. SCROLL REVEAL
   Uses IntersectionObserver to add .revealed to
   elements with .reveal-up / .reveal-right as they
   enter the viewport.
═══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-right');
  if (!targets.length) return;

  // Immediately reveal anything in the initial viewport
  // (hero section elements that use CSS --delay)
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
      // Let CSS transition-delay handle staggering
      el.classList.add('revealed');
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  targets.forEach(el => {
    // Skip hero — already handled above
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
}

/* ═══════════════════════════════════════════════════════
   4. NAVBAR
   • Adds .scrolled class for glass shadow effect
   • Highlights active nav link based on scroll position
═══════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  if (!navbar) return;

  // Sections to track (in order)
  const sectionIds = ['about', 'experience', 'skills', 'projects', 'education', 'contact'];
  const sections   = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const NAV_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '68',
    10
  );

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Scrolled class
      navbar.classList.toggle('scrolled', scrollY > 20);

      // Active section detection
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - NAV_HEIGHT - 80;
        if (scrollY >= top) current = section.id;
      });

      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ═══════════════════════════════════════════════════════
   5. SKILL TABS
   Tab panel switching with ARIA state management.
   Keyboard accessible: arrow keys navigate tabs.
═══════════════════════════════════════════════════════ */
function initSkillTabs() {
  const tabButtons = document.querySelectorAll('.skills-tab');
  const tabPanels  = document.querySelectorAll('.skills-panel');
  if (!tabButtons.length) return;

  function activateTab(btn) {
    const target = btn.dataset.tab;

    // Update buttons
    tabButtons.forEach(b => {
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });

    // Update panels
    tabPanels.forEach(panel => {
      const isActive = panel.id === `tab-${target}`;
      panel.classList.toggle('active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
        // Re-trigger reveal for newly visible cards
        panel.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
          // Reset and re-observe so animation fires when switching tabs
          el.classList.remove('revealed');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('revealed'));
          });
        });
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => activateTab(btn));

    // Keyboard navigation: arrow keys
    btn.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = tabButtons[(index + 1) % tabButtons.length];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
      } else if (e.key === 'Home') {
        next = tabButtons[0];
      } else if (e.key === 'End') {
        next = tabButtons[tabButtons.length - 1];
      }
      if (next) {
        e.preventDefault();
        next.focus();
        activateTab(next);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════
   6. HAMBURGER MENU
   Toggles mobile nav open/close.
   Closes on nav link click or outside click.
   Traps aria-expanded state.
═══════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function open() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? close() : open();
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      close();
      hamburger.focus();
    }
  });
}

/* ═══════════════════════════════════════════════════════
   7. BACK TO TOP
   Fades in after scrolling 400px.
   Smooth scrolls to top on click.
═══════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  // Initially hidden via inline opacity
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';
  btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease, background 0.25s ease, color 0.25s ease';

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const visible = window.scrollY > 400;
      btn.style.opacity        = visible ? '1' : '0';
      btn.style.pointerEvents  = visible ? 'auto' : 'none';
      btn.style.transform      = visible ? 'translateY(0)' : 'translateY(8px)';
      ticking = false;
    });
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════
   8. DYNAMIC YEAR
   Writes current year into #year span in footer.
═══════════════════════════════════════════════════════ */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
