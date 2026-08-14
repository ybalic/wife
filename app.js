/**
 * Pressel Hot Wife — Landing Page
 * Button interaction feedback
 */

(function () {
  'use strict';

  // ─── Button interaction feedback ─────────────────────
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((btn) => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(1px) scale(0.98)';
    });

    btn.addEventListener('mouseup', () => {
      btn.style.transform = '';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();
