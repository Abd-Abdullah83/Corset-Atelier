/* ==========================================================================
   WISHLIST PAGE
   Reads saved product ids from localStorage (via the shared helpers in
   main.js), matches them against products.json, and renders the same
   product-card component used on Collections. Removing a heart here
   re-renders immediately so the page never shows a stale item.
   ========================================================================== */

(function () {
  'use strict';

  async function render() {
    const grid = document.querySelector('[data-wishlist-grid]');
    const countEl = document.querySelector('[data-wishlist-heading-count]');
    const emptyState = document.querySelector('[data-wishlist-empty]');
    if (!grid) return;

    const { getWishlist, getProducts, renderProductCard, bindWishlistButtons } = window.CorsetAtelier;
    const savedIds = getWishlist();
    const allProducts = await getProducts();
    const items = allProducts.filter((p) => savedIds.includes(p.id));

    if (countEl) {
      countEl.textContent = items.length ? `${items.length} saved piece${items.length === 1 ? '' : 's'}` : '';
    }

    if (!items.length) {
      grid.innerHTML = '';
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = items.map(renderProductCard).join('');
    window.CorsetAtelier.staggerReveal(grid, '.product-card');

    grid.querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-wishlist-toggle');
        window.CorsetAtelier.toggleWishlist(id);
        // Re-render so a removed item disappears from this page immediately.
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
