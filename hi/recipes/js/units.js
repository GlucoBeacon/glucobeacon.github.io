// GlucoBeacon recipe pages — US / Metric ingredient unit toggle.
// Each ingredient renders both a .qty-us and a .qty-metric span (metric
// pre-computed server-side in generate_recipe_pages.py); this just shows
// one and hides the other via the `hidden` attribute, so it degrades
// gracefully to the US measurements (already visible by default) if this
// script fails to load for any reason.
(function () {
  'use strict';

  var STORAGE_KEY = 'gb_units';

  function applyUnits(mode) {
    document.querySelectorAll('.qty-us').forEach(function (el) { el.hidden = mode === 'metric'; });
    document.querySelectorAll('.qty-metric').forEach(function (el) { el.hidden = mode !== 'metric'; });
    document.querySelectorAll('.unit-toggle-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-unit') === mode);
    });
  }

  window.setGbUnits = function (mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    applyUnits(mode);
  };

  // The US and Liberia and Myanmar are the only countries that don't use
  // the metric system for everyday measurements -- everyone else defaults
  // to Metric on first visit (before any manual preference is saved).
  var US_CUSTOMARY_REGIONS = ['US', 'LR', 'MM'];

  function detectDefault() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored === 'us' || stored === 'metric') return stored;

    var region = (navigator.language || '').split('-')[1];
    if (!region) return 'us';
    return US_CUSTOMARY_REGIONS.indexOf(region.toUpperCase()) === -1 ? 'metric' : 'us';
  }

  if (document.querySelector('.unit-toggle-row')) {
    applyUnits(detectDefault());
  }
})();
