/* ==========================================================================
   CORSET ATELIER — SHARED SITE BEHAVIOR
   Header scroll state, mobile nav drawer, wishlist badge count.
   Wishlist is stored client-side in localStorage under key "ca_wishlist"
   as an array of product ids. Every page that renders products reads/writes
   this same key, so the count here always stays in sync.
   ========================================================================== */

(function () {
  'use strict';

  const WISHLIST_KEY = 'ca_wishlist';

  function getWishlist() {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function isWishlisted(productId) {
    return getWishlist().includes(productId);
  }

  function toggleWishlist(productId) {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    updateWishlistBadge();
    return list.includes(productId);
  }

  function updateWishlistBadge() {
    const badge = document.querySelector('[data-wishlist-count]');
    if (!badge) return;
    const count = getWishlist().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ---- Shared formatting ----
  function formatPrice(amount) {
    return 'Rs. ' + Number(amount).toLocaleString('en-PK');
  }

  function discountPercent(price, comparePrice) {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  // ---- Product data (shared across collections / product / wishlist pages) ----
  let productsCache = null;
  async function getProducts() {
    if (productsCache) return productsCache;
    const res = await fetch('data/products.json');
    productsCache = await res.json();
    return productsCache;
  }

  // ---- Header scroll state ----
  function initHeaderScroll() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;
    const solidFromStart = header.hasAttribute('data-solid');
    const threshold = 40;

    function onScroll() {
      if (solidFromStart) return;
      if (window.scrollY > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    if (solidFromStart) header.classList.add('is-solid');
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Mobile drawer ----
  function initMobileDrawer() {
    const openBtn = document.querySelector('[data-drawer-open]');
    const closeBtn = document.querySelector('[data-drawer-close]');
    const drawer = document.querySelector('[data-mobile-drawer]');
    const backdrop = document.querySelector('[data-drawer-backdrop]');
    if (!openBtn || !drawer) return;

    drawer.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');

    function open() {
      drawer.classList.add('is-open');
      backdrop && backdrop.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
    }
    function close() {
      drawer.classList.remove('is-open');
      backdrop && backdrop.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn.focus();
    }
    openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop && backdrop.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
  }

  // ---- Active nav link ----
  function markActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === path) link.classList.add('is-active');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileDrawer();
    updateWishlistBadge();
    markActiveNav();
  });

  // Expose small helpers other pages can reuse.
  // ---- Shared category labels + card renderer (used by collections, product, wishlist pages) ----
  const CATEGORY_LABELS = {
    'bridal': 'Bridal', 'overbust': 'Overbust', 'underbust': 'Underbust',
    'waist-trainers': 'Waist Trainers', 'evening': 'Evening', 'satin': 'Satin',
    'new-arrivals': 'New Arrivals', 'luxury': 'Luxury'
  };

  function renderProductCard(p) {
    const discount = discountPercent(p.price, p.comparePrice);
    const wishlisted = isWishlisted(p.id);
    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-media">
          <div class="media-bg" style="background:${p.swatch}"></div>
          ${discount ? `<span class="product-badge">-${discount}%</span>` : ((p.tags || []).includes('new-arrivals') ? '<span class="product-badge" style="background:var(--c-brass)">New</span>' : '')}
          <button type="button" class="wishlist-btn ${wishlisted ? 'is-active' : ''}" data-wishlist-toggle="${p.id}" aria-label="Toggle wishlist">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4c2-.3 3.8.7 4.9 2.3C11.5 4.7 13.3 3.7 15.3 4c3.5.5 5.1 4 3.5 7.7C16.5 16.4 12 21 12 21z" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </button>
          <a href="product.html?id=${p.id}" class="product-quickview">View Details</a>
        </div>
        <a href="product.html?id=${p.id}" class="product-info-link">
          <div class="product-info">
            <span class="product-category">${CATEGORY_LABELS[p.category] || p.category}</span>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price-row">
              <span class="product-price">${formatPrice(p.price)}</span>
              ${p.comparePrice ? `<span class="product-compare-price">${formatPrice(p.comparePrice)}</span>` : ''}
              ${discount ? `<span class="product-discount">Save ${discount}%</span>` : ''}
            </div>
          </div>
        </a>
      </div>
    `;
  }

  function bindWishlistButtons(scope) {
    (scope || document).querySelectorAll('[data-wishlist-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-wishlist-toggle');
        const nowActive = toggleWishlist(id);
        btn.classList.toggle('is-active', nowActive);
      });
    });
  }

  function colorToCss(name) {
    const map = {
      'Ivory': '#F6F1E9', 'Blush': '#E8C7C2', 'Champagne': '#D9B98A', 'Black': '#141213',
      'Oxblood': '#6B1423', 'Wine': '#5C1420', 'Nude': '#D9B79A', 'Emerald': '#1F4A38',
      'Rose': '#C98A8C'
    };
    return map[name] || '#999';
  }

  // ---- Staggered reveal for dynamically-rendered grids (product cards) ----
  // Static content is handled by reveal.js via IntersectionObserver; content
  // rendered after a fetch (collections, related products, wishlist) calls
  // this directly right after building its grid, since it's usually already
  // in or near the viewport by the time it renders.
  function staggerReveal(container, itemSelector) {
    if (!container) return;
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (!items.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    items.forEach((el, i) => {
      el.classList.add('reveal-target');
      el.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
    });
    // Double rAF: let the browser paint the hidden state first, so the
    // transition to visible actually animates instead of snapping instantly.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((el) => el.classList.add('is-revealed'));
      });
    });
  }

  window.CorsetAtelier = window.CorsetAtelier || {};
  window.CorsetAtelier.getWishlist = getWishlist;
  window.CorsetAtelier.isWishlisted = isWishlisted;
  window.CorsetAtelier.toggleWishlist = toggleWishlist;
  window.CorsetAtelier.updateWishlistBadge = updateWishlistBadge;
  window.CorsetAtelier.formatPrice = formatPrice;
  window.CorsetAtelier.discountPercent = discountPercent;
  window.CorsetAtelier.getProducts = getProducts;
  window.CorsetAtelier.categoryLabels = CATEGORY_LABELS;
  window.CorsetAtelier.renderProductCard = renderProductCard;
  window.CorsetAtelier.bindWishlistButtons = bindWishlistButtons;
  window.CorsetAtelier.colorToCss = colorToCss;
  window.CorsetAtelier.staggerReveal = staggerReveal;
})();
