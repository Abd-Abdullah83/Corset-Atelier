/* ==========================================================================
   PRODUCT DETAIL PAGE
   Loads the product from ?id=, renders gallery/variants/related items, and
   wires the Buy and Query flows to prefilled WhatsApp messages — no backend
   involved, wa.me does the rest.
   ========================================================================== */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '923286712746';
  let product = null;
  let selectedColor = null;
  let selectedSize = null;
  let activeImageIndex = 0;

  function waLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function renderNotFound() {
    document.querySelector('[data-product-root]').innerHTML = `
      <div class="empty-state">
        <h3>We couldn't find that piece</h3>
        <p>It may have sold out or moved. Browse the full collection instead.</p>
        <a href="collections.html" class="btn btn-primary" style="margin-top:1.5rem">Back to Collections</a>
      </div>`;
  }

  function renderGallery() {
    const main = document.querySelector('[data-gallery-main]');
    const thumbs = document.querySelector('[data-gallery-thumbs]');
    const layers = main.querySelectorAll('[data-zoom-layer]');

    const activeLayer = main.querySelector('.zoom-layer.is-active') || layers[0];
    const inactiveLayer = Array.from(layers).find((l) => l !== activeLayer) || layers[1];

    inactiveLayer.style.background = product.gallery[activeImageIndex];
    // Force a reflow so the browser registers the new background before we
    // toggle opacity — otherwise the crossfade can skip straight to the end.
    void inactiveLayer.offsetWidth;
    layers.forEach((l) => l.classList.remove('is-active'));
    inactiveLayer.classList.add('is-active');

    thumbs.innerHTML = product.gallery.map((g, i) => `
      <button type="button" class="gallery-thumb ${i === activeImageIndex ? 'is-active' : ''}" data-thumb-index="${i}" aria-label="View image ${i + 1}">
        <span class="thumb-bg" style="background:${g}"></span>
      </button>
    `).join('');

    thumbs.querySelectorAll('[data-thumb-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeImageIndex = Number(btn.getAttribute('data-thumb-index'));
        renderGallery();
      });
    });
  }

  function initZoom() {
    const main = document.querySelector('[data-gallery-main]');

    main.addEventListener('mousemove', (e) => {
      if (!main.classList.contains('is-zoomed')) return;
      const activeLayer = main.querySelector('.zoom-layer.is-active');
      if (!activeLayer) return;
      const rect = main.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      activeLayer.style.transformOrigin = `${x}% ${y}%`;
    });
    main.addEventListener('click', () => main.classList.toggle('is-zoomed'));
    main.addEventListener('mouseleave', () => main.classList.remove('is-zoomed'));
  }

  function renderInfo() {
    const { formatPrice, discountPercent, categoryLabels } = window.CorsetAtelier;
    const discount = discountPercent(product.price, product.comparePrice);

    document.querySelector('[data-pd-category]').textContent = categoryLabels[product.category] || product.category;
    document.querySelector('[data-pd-title]').textContent = product.name;
    document.querySelector('[data-pd-desc]').textContent = product.description;
    document.querySelector('[data-pd-price]').textContent = formatPrice(product.price);
    document.querySelector('[data-pd-fabric]').textContent = product.fabric;
    document.querySelector('[data-pd-weight]').textContent = product.weight;

    const compareEl = document.querySelector('[data-pd-compare]');
    const badgeEl = document.querySelector('[data-pd-discount-badge]');
    if (discount) {
      compareEl.textContent = formatPrice(product.comparePrice);
      compareEl.style.display = '';
      badgeEl.textContent = `Save ${discount}%`;
      badgeEl.style.display = '';
    } else {
      compareEl.style.display = 'none';
      badgeEl.style.display = 'none';
    }

    document.title = `${product.name} — Corset Atelier`;

    // Color swatches
    const colorRow = document.querySelector('[data-color-swatches]');
    selectedColor = product.colors[0];
    colorRow.innerHTML = product.colors.map((c, i) => `
      <button type="button" class="color-swatch ${i === 0 ? 'is-active' : ''}" data-color="${c}"
        style="background:${window.CorsetAtelier.colorToCss(c)}" title="${c}" aria-label="${c}"></button>
    `).join('');
    document.querySelector('[data-selected-color]').textContent = selectedColor;
    colorRow.querySelectorAll('.color-swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedColor = btn.getAttribute('data-color');
        colorRow.querySelectorAll('.color-swatch').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.querySelector('[data-selected-color]').textContent = selectedColor;
      });
    });

    // Sizes
    const sizeRow = document.querySelector('[data-size-buttons]');
    selectedSize = product.sizes[0];
    sizeRow.innerHTML = product.sizes.map((s, i) => `
      <button type="button" class="size-btn ${i === 0 ? 'is-active' : ''}" data-size="${s}">${s}</button>
    `).join('');
    sizeRow.querySelectorAll('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = btn.getAttribute('data-size');
        sizeRow.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Wishlist button
    const wishBtn = document.querySelector('[data-pd-wishlist]');
    wishBtn.classList.toggle('is-active', window.CorsetAtelier.isWishlisted(product.id));
    wishBtn.addEventListener('click', () => {
      const active = window.CorsetAtelier.toggleWishlist(product.id);
      wishBtn.classList.toggle('is-active', active);
    });

    // Custom build link carries the product name along
    document.querySelector('[data-custom-link]').href = `custom-builder.html?base=${encodeURIComponent(product.name)}`;
  }

  async function renderRelated() {
    const { getProducts, renderProductCard, bindWishlistButtons } = window.CorsetAtelier;
    const all = await getProducts();
    const related = all
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4);
    const wrap = document.querySelector('[data-related-grid]');
    if (!related.length) {
      document.querySelector('[data-related-section]').style.display = 'none';
      return;
    }
    wrap.innerHTML = related.map(renderProductCard).join('');
    bindWishlistButtons(wrap);
    window.CorsetAtelier.staggerReveal(wrap, '.product-card');
  }

  // ---- Buy modal ----
  function buildOrderSummary() {
    const { formatPrice } = window.CorsetAtelier;
    return `${product.name} — ${selectedColor}, Size ${selectedSize} — ${formatPrice(product.price)}`;
  }

  function initBuyModal() {
    const openBtn = document.querySelector('[data-open-buy]');
    const overlay = document.querySelector('[data-buy-modal]');
    const closeBtn = overlay.querySelector('[data-modal-close]');
    const form = overlay.querySelector('form');
    const summary = overlay.querySelector('[data-order-summary]');

    function open() {
      summary.innerHTML = `<strong>Order Summary</strong>${buildOrderSummary()}`;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstField = form.querySelector('input');
      if (firstField) firstField.focus();
    }
    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const { formatPrice } = window.CorsetAtelier;
      const message = [
        `Hi! I'd like to order:`,
        ``,
        `*${product.name}*`,
        `Color: ${selectedColor}   Size: ${selectedSize}`,
        `Price: ${formatPrice(product.price)}`,
        ``,
        `*Delivery Details*`,
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${data.email || '—'}`,
        `Address: ${data.address}`,
        `City: ${data.city}`,
        ``,
        `Payment: Cash on Delivery`
      ].join('\n');
      window.open(waLink(message), '_blank');
      close();
    });
  }

  // ---- Query modal ----
  function initQueryModal() {
    const openBtn = document.querySelector('[data-open-query]');
    const overlay = document.querySelector('[data-query-modal]');
    const closeBtn = overlay.querySelector('[data-modal-close]');
    const form = overlay.querySelector('form');

    function open() {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstField = form.querySelector('textarea');
      if (firstField) firstField.focus();
    }
    function close() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const message = [
        `Hi! I have a question about *${product.name}*:`,
        ``,
        data.message,
        ``,
        `— ${data.name}${data.phone ? ', ' + data.phone : ''}`
      ].join('\n');
      window.open(waLink(message), '_blank');
      close();
    });
  }

  async function init() {
    const root = document.querySelector('[data-product-root]');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const products = await window.CorsetAtelier.getProducts();
    product = products.find((p) => p.id === id);

    if (!product) {
      renderNotFound();
      return;
    }

    renderGallery();
    initZoom();
    renderInfo();
    initBuyModal();
    initQueryModal();
    renderRelated();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
