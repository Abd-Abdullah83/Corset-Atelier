/* ==========================================================================
   MAGNETIC BUTTON HOVER
   Applies to primary CTA buttons (.btn, excluding the plain text .btn-ghost
   link style) and the AI chat FAB. Subtly pulls the button toward the
   cursor on hover — restrained (max 10px), not the exaggerated version.

   Deliberately hands control back to CSS on mousedown: the button-depth
   press animation built in base.css (box-shadow + translateY) needs to own
   the transform during a click, so this script clears its inline transform
   the moment the pointer goes down and only resumes magnetic tracking after
   release. Skipped entirely for reduced-motion and touch/coarse-pointer
   devices, where it wouldn't apply anyway.
   ========================================================================== */

(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;

  const STRENGTH = 0.22;
  const MAX_OFFSET = 10;
  const HOVER_LIFT = 3;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function attach(el) {
    let isDown = false;

    el.addEventListener('mousemove', (e) => {
      if (isDown) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const x = clamp(relX * STRENGTH, -MAX_OFFSET, MAX_OFFSET);
      const y = clamp(relY * STRENGTH, -MAX_OFFSET, MAX_OFFSET) - HOVER_LIFT;
      el.style.transition = 'transform 80ms linear';
      el.style.transform = `translate(${x}px, ${y}px)`;
    });

    el.addEventListener('mousedown', () => {
      isDown = true;
      // Let the CSS :active press animation take over cleanly.
      el.style.transition = '';
      el.style.transform = '';
    });

    el.addEventListener('mouseup', () => {
      isDown = false;
    });

    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'translate(0, 0)';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn:not(.btn-ghost), .ai-fab').forEach(attach);
  });
})();
