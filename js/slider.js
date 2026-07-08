/* ==========================================================================
   HERO SLIDER
   Auto-advances every 3s. The progress control doubles as the signature
   "lace line" — each tick fills like a lace being drawn tight, and clicking
   a tick jumps straight to that slide.
   ========================================================================== */

(function () {
  'use strict';

  function initHeroSlider() {
    const hero = document.querySelector('[data-hero-slider]');
    if (!hero) return;

    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const progressButtons = Array.from(hero.querySelectorAll('.hero-progress button'));
    const prevBtn = hero.querySelector('[data-hero-prev]');
    const nextBtn = hero.querySelector('[data-hero-next]');
    const INTERVAL = 3000;

    let current = 0;
    let timer = null;

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      progressButtons.forEach((b, i) => {
        b.classList.toggle('is-active', i === current);
        b.classList.toggle('is-done', i < current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
      restart();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restart() {
      clearInterval(timer);
      timer = setInterval(next, INTERVAL);
    }

    progressButtons.forEach((btn, i) => {
      btn.addEventListener('click', () => goTo(i));
    });
    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);

    // Pause on hover/focus so a reader can actually read the slide.
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', restart);

    render();
    restart();
  }

  document.addEventListener('DOMContentLoaded', initHeroSlider);
})();
