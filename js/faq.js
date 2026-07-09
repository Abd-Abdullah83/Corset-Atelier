/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.faq-question').forEach((btn, i) => {
      const answer = btn.nextElementSibling;
      const answerId = `faq-answer-${i}`;
      answer.id = answerId;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', answerId);

      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('is-open');
        // Close others in the same category for a cleaner reading experience.
        item.closest('.faq-category').querySelectorAll('.faq-item').forEach((i) => {
          i.classList.remove('is-open');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
})();
