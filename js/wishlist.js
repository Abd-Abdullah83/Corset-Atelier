/* ==========================================================================
   WISHLIST PAGE
   Reads saved product ids from localStorage (via the shared helpers in
   main.js), matches them against products.json, and renders the same
   product-card component used on Collections. Removing a heart here
   re-renders immediately so the page never shows a stale item.
   ========================================================================== */

(function () {
  'use strict';

  let hasLoadedOnce = false;

  async function render() {
    const grid = document.querySelector('[data-wishlist-grid]');
    const countEl = document.querySelector('[data-wishlist-heading-count]');
    const emptyState = document.querySelector('[data-wishlist-empty]');
    if (!grid) return;

    const { getWishlist, getProducts, renderProductCard, bindWishlistButtons, renderSkeletonGrid, renderFetchError } = window.CorsetAtelier;
    const savedIds = getWishlist();

    // Only show the skeleton on the very first load — re-renders after
    // toggling a heart already have cached data and shouldn't flash.
    if (!hasLoadedOnce) {
      emptyState.style.display = 'none';
      renderSkeletonGrid(grid, Math.max(savedIds.length, 4));
    }

    let allProducts;
    try {
      allProducts = await getProducts();
    } catch (err) {
      renderFetchError(grid, render);
      return;
    }
    hasLoadedOnce = true;

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
