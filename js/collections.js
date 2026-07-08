/* ==========================================================================
   COLLECTIONS PAGE
   Reads data/products.json once, filters by category (from ?cat= in the URL
   or a chip click), sorts, and renders product cards. Chip clicks update the
   URL via history.pushState so the filtered view is shareable/bookmarkable.
   ========================================================================== */

(function () {
  'use strict';

  const CATEGORIES = [
    { slug: 'all', label: 'All' },
    { slug: 'bridal', label: 'Bridal' },
    { slug: 'overbust', label: 'Overbust' },
    { slug: 'underbust', label: 'Underbust' },
    { slug: 'waist-trainers', label: 'Waist Trainers' },
    { slug: 'evening', label: 'Evening' },
    { slug: 'satin', label: 'Satin' },
    { slug: 'new-arrivals', label: 'New Arrivals' },
    { slug: 'luxury', label: 'Luxury' }
  ];

  let allProducts = [];
  let activeCategory = 'all';
  let activeSort = 'featured';

  function matchesCategory(product, cat) {
    if (cat === 'all') return true;
    return product.category === cat || (product.tags || []).includes(cat);
  }

  function sortProducts(products) {
    const list = [...products];
    switch (activeSort) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'newest': return list.sort((a, b) => (b.tags.includes('new-arrivals') ? 1 : 0) - (a.tags.includes('new-arrivals') ? 1 : 0));
      default: return list;
    }
  }

  function render() {
    const grid = document.querySelector('[data-product-grid]');
    const countEl = document.querySelector('[data-results-count]');
    if (!grid) return;

    const filtered = sortProducts(allProducts.filter((p) => matchesCategory(p, activeCategory)));

    if (countEl) {
      countEl.textContent = `${filtered.length} piece${filtered.length === 1 ? '' : 's'}`;
    }

    grid.innerHTML = filtered.length
      ? filtered.map(window.CorsetAtelier.renderProductCard).join('')
      : `<div class="empty-state" style="grid-column:1/-1"><h3>Nothing here yet</h3><p>Try a different category, or message us on WhatsApp — we may have it in the atelier.</p></div>`;

    window.CorsetAtelier.bindWishlistButtons(grid);
  }

  function setActiveChip() {
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.classList.toggle('is-active', chip.getAttribute('data-cat') === activeCategory);
    });
  }

  function buildChips() {
    const wrap = document.querySelector('[data-filter-chips]');
    if (!wrap) return;
    wrap.innerHTML = CATEGORIES.map((c) =>
      `<button type="button" class="filter-chip" data-cat="${c.slug}">${c.label}</button>`
    ).join('');

    wrap.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeCategory = chip.getAttribute('data-cat');
        const url = new URL(window.location.href);
        if (activeCategory === 'all') url.searchParams.delete('cat');
        else url.searchParams.set('cat', activeCategory);
        history.pushState({}, '', url);
        setActiveChip();
        render();
      });
    });
  }

  async function init() {
    const grid = document.querySelector('[data-product-grid]');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    activeCategory = params.get('cat') || 'all';

    buildChips();
    setActiveChip();

    const sortSelect = document.querySelector('[data-sort-select]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        activeSort = sortSelect.value;
        render();
      });
    }

    allProducts = await window.CorsetAtelier.getProducts();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
