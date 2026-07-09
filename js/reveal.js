/* ==========================================================================
   SCROLL REVEAL
   Lightweight fade-up for static section content (collection tiles, value
   cards, process steps, etc). Skipped entirely if the visitor has
   prefers-reduced-motion set, or if IntersectionObserver isn't available.
   Dynamically-rendered content (product cards from fetch) is intentionally
   left out — it already has hover/interaction cues and revealing it would
   fight with async render timing.
   ========================================================================== */

(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const SELECTORS = [
    '.collection-tile', '.story-media', '.story-copy', '.story-media-lg',
    '.value-card', '.process-step', '.policy-highlight', '.measure-step', '.insta-tile'
  ];

  document.addEventListener('DOMContentLoaded', function () {
    const els = document.querySelectorAll(SELECTORS.join(','));
    if (!els.length) return;

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
  });
})();
