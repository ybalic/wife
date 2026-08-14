/**
 * Pressel Hot Wife — Landing Page
 * Geolocation module + UI interactions
 */

(function () {
  'use strict';

  // ─── DOM References ───────────────────────────────────
  const modal = document.getElementById('geo-modal');
  const btnAllow = document.getElementById('geo-allow');
  const btnDeny = document.getElementById('geo-deny');
  const locationCity = document.getElementById('location-city');
  const locationSkeleton = document.getElementById('location-skeleton');

  // ─── State ────────────────────────────────────────────
  const GEO_CACHE_KEY = 'pressel_geo_city';
  const GEO_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // ─── Init ─────────────────────────────────────────────
  function init() {
    const cached = getCachedCity();
    if (cached) {
      displayCity(cached);
      return;
    }

    // Show custom consent modal after a brief delay
    setTimeout(() => showModal(), 1200);
  }

  // ─── Geolocation Modal ────────────────────────────────
  function showModal() {
    modal.removeAttribute('hidden');
    // Force reflow before adding class for transition
    void modal.offsetHeight;
    modal.classList.add('is-visible');
    btnAllow.focus();
  }

  function hideModal() {
    modal.classList.remove('is-visible');
    setTimeout(() => {
      modal.setAttribute('hidden', '');
    }, 300);
  }

  btnAllow.addEventListener('click', () => {
    hideModal();
    requestGeolocation();
  });

  btnDeny.addEventListener('click', () => {
    hideModal();
    displayCity('sua região');
  });

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
      displayCity('sua região');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
      hideModal();
      displayCity('sua região');
    }
  });

  // ─── Geolocation ─────────────────────────────────────
  function requestGeolocation() {
    if (!navigator.geolocation) {
      displayCity('sua região');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 min cached positions OK
      }
    );
  }

  function onGeoSuccess(position) {
    const { latitude, longitude } = position.coords;
    reverseGeocode(latitude, longitude);
  }

  function onGeoError(error) {
    console.warn('Geolocation error:', error.message);
    displayCity('sua região');
  }

  // ─── Reverse Geocoding (Nominatim — OpenStreetMap) ───
  async function reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=pt-BR`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const address = data.address || {};

      // Try to find the best city-level name
      const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.suburb ||
        address.county ||
        address.state ||
        'sua região';

      cacheCity(city);
      displayCity(city);
    } catch (err) {
      console.warn('Reverse geocoding failed:', err.message);
      displayCity('sua região');
    }
  }

  // ─── Display ──────────────────────────────────────────
  function displayCity(city) {
    // Hide skeleton
    if (locationSkeleton) {
      locationSkeleton.classList.add('location__skeleton--hidden');
    }

    // Create city text with fade-in animation
    const span = document.createElement('span');
    span.textContent = city;
    span.style.opacity = '0';
    span.style.transform = 'translateY(4px)';
    span.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    span.style.display = 'inline-block';

    locationCity.appendChild(span);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      });
    });
  }

  // ─── Cache ────────────────────────────────────────────
  function cacheCity(city) {
    try {
      const data = {
        city: city,
        timestamp: Date.now(),
      };
      localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage unavailable — no-op
    }
  }

  function getCachedCity() {
    try {
      const raw = localStorage.getItem(GEO_CACHE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > GEO_CACHE_TTL) {
        localStorage.removeItem(GEO_CACHE_KEY);
        return null;
      }

      return data.city;
    } catch (e) {
      return null;
    }
  }

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

  // ─── Start ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
