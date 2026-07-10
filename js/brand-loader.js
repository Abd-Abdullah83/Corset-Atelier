/* ==========================================================================
   BRAND LOADER — fade-out timing
   The decision to show the loader at all (first visit this session vs.
   repeat navigation) happens synchronously in a tiny inline script placed
   right after the loader element in each page's <body> — that has to run
   before paint to avoid a flash. This file only handles the timed fade-out
   once DOMContentLoaded fires, and is safe to no-op if the loader was never
   shown (its default state is display:none).
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('[data-brand-loader]');
    if (!loader || loader.style.display === 'none' || loader.style.display === '') return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdTime = reduceMotion ? 0 : 400;
    const fadeTime = reduceMotion ? 0 : 300;

    setTimeout(() => {
      loader.classList.add('is-hiding');
      setTimeout(() => {
        loader.style.display = 'none';
      }, fadeTime);
    }, holdTime);
  });
})();
