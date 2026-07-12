/* ==========================================================================
   404 PAGE
   ========================================================================== */

(function () {
  'use strict';

  function initSearchTrigger() {
    const btn = document.querySelector('[data-open-search-404]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (window.CorsetAtelier && window.CorsetAtelier.openSearch) {
        window.CorsetAtelier.openSearch();
      }
    });
  }

  async function renderPopularPicks() {
    const grid = document.querySelector('[data-notfound-grid]');
    if (!grid) return;

    window.CorsetAtelier.renderSkeletonGrid(grid, 4);
    try {
      const products = await window.CorsetAtelier.getProducts();
      // "Popular" here just means luxury-tagged or in-stock, newest first —
      // there's no real sales/view-count data to rank by on a static site.
      const picks = products
        .filter((p) => p.stock !== 'sold-out')
        .sort((a, b) => (b.tags.includes('luxury') ? 1 : 0) - (a.tags.includes('luxury') ? 1 : 0))
        .slice(0, 4);
      grid.innerHTML = picks.map(window.CorsetAtelier.renderProductCard).join('');
      window.CorsetAtelier.bindWishlistButtons(grid);
      window.CorsetAtelier.staggerReveal(grid, '.product-card');
    } catch (err) {
      window.CorsetAtelier.renderFetchError(grid, renderPopularPicks);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearchTrigger();
    renderPopularPicks();
  });
})();
