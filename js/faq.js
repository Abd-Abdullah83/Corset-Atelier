/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('is-open');
        // Close others in the same category for a cleaner reading experience.
        item.closest('.faq-category').querySelectorAll('.faq-item').forEach((i) => i.classList.remove('is-open'));
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  });
})();
