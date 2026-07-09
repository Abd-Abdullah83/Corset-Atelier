/* ==========================================================================
   SCROLL REVEAL
   Two modes:
   1. Staggered groups — grids/lists where children cascade in one after
      another (collection tiles, value cards, process steps, FAQ items...).
      The whole container is observed; once it enters view, every child
      gets a staggered transition-delay and reveals in sequence.
   2. Single elements — standalone sections (story image/copy) that fade up
      individually, no stagger needed.

   Skipped entirely for prefers-reduced-motion (content is just visible
   immediately) or if IntersectionObserver isn't supported.

   Dynamically-rendered content (product cards from fetch) is handled
   separately by window.CorsetAtelier.staggerReveal(), called directly by
   each page's render logic right after it builds the grid — see main.js.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STAGGER_GROUPS = [
    { container: '.collection-grid', items: ':scope > .collection-tile' },
    { container: '.editorial-pillars', items: ':scope > .pillar' },
    { container: '.insta-strip', items: ':scope > .insta-tile' },
    { container: '.value-grid', items: ':scope > .value-card' },
    { container: '.process-steps', items: ':scope > .process-step' },
    { container: '.measure-steps', items: ':scope > .measure-step' },
    { container: '.policy-highlights', items: ':scope > .policy-highlight' },
    { container: '.contact-info-list', items: ':scope > .contact-info-item' },
    { container: '.faq-category', items: ':scope > .faq-item' }
  ];

  const SINGLE_SELECTORS = ['.story-media', '.story-copy', '.story-media-lg'];

  function revealNow(els) {
    els.forEach((el) => el.classList.add('reveal-target', 'is-revealed'));
  }

  function initStaggerGroups() {
    STAGGER_GROUPS.forEach(({ container, items }) => {
      document.querySelectorAll(container).forEach((group) => {
        const children = Array.from(group.querySelectorAll(items));
        if (!children.length) return;

        if (reduceMotion) { revealNow(children); return; }

        children.forEach((el, i) => {
          el.classList.add('reveal-target');
          el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`;
        });

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              children.forEach((el) => el.classList.add('is-revealed'));
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        observer.observe(group);
      });
    });
  }

  function initSingles() {
    const els = document.querySelectorAll(SINGLE_SELECTORS.join(','));
    if (!els.length) return;

    if (reduceMotion) { revealNow(els); return; }

    els.forEach((el) => el.classList.add('reveal-target'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el) => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!('IntersectionObserver' in window)) return; // native fallback: content stays visible, no hidden state applied
    initStaggerGroups();
    initSingles();
  });
})();
