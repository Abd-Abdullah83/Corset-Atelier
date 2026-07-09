/* ==========================================================================
   SMOOTH SCROLL (Lenis)
   Deliberately conservative: short duration, no overshoot/bounce, so it's
   felt rather than noticed. Fully skipped for prefers-reduced-motion and
   for touch/coarse-pointer devices — native scroll is already good there,
   and Lenis is really solving a desktop-mouse-wheel feel problem.

   Loaded from a CDN (see the <script> tag in each page, right before this
   file) — if that fails to load for any reason (offline, ad blocker, CDN
   outage), window.Lenis simply won't exist and this script does nothing,
   leaving native scroll completely intact. No dependency, no build step.
   ========================================================================== */

(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;

  function init() {
    if (typeof window.Lenis !== 'function') return; // CDN didn't load — native scroll stays as-is

    const lenis = new window.Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
