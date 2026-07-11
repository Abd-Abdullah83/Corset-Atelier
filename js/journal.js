/* ==========================================================================
   JOURNAL INDEX
   Same loading pattern as collections.js — skeleton while fetching,
   friendly retry state if the fetch fails, staggered reveal once rendered.
   ========================================================================== */

(function () {
  'use strict';

  function renderPosts(posts) {
    const grid = document.querySelector('[data-journal-grid]');
    if (!grid) return;
    grid.innerHTML = posts.map(window.CorsetAtelier.renderJournalCard).join('');
    window.CorsetAtelier.staggerReveal(grid, '.journal-card');
  }

  async function loadPosts(grid) {
    window.CorsetAtelier.renderSkeletonGrid(grid, 4);
    try {
      const posts = await window.CorsetAtelier.getJournalPosts();
      const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
      renderPosts(sorted);
    } catch (err) {
      window.CorsetAtelier.renderFetchError(grid, () => loadPosts(grid));
    }
  }

  async function init() {
    const grid = document.querySelector('[data-journal-grid]');
    if (!grid) return;
    await loadPosts(grid);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
