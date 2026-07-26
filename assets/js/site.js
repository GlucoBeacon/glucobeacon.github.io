// GlucoBeacon — shared site interactions (preview)
(function () {
  'use strict';

  // Enables the .reveal fade-in animation (CSS defaults to fully visible
  // so content never depends on this script succeeding).
  document.documentElement.classList.add('js');

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  // FAQ / accordion
  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      // close siblings within the same accordion
      var acc = btn.closest('.accordion');
      if (acc) {
        acc.querySelectorAll('.accordion-trigger[aria-expanded="true"]').forEach(function (other) {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            var op = document.getElementById(other.getAttribute('aria-controls'));
            if (op) op.style.maxHeight = null;
          }
        });
      }
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = !open ? panel.scrollHeight + 'px' : null;
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Back to top
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 640);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // In-page subnav active-section tracking (index.html)
  var subnavLinks = document.querySelectorAll('.subnav a');
  if (subnavLinks.length && 'IntersectionObserver' in window) {
    var sections = [];
    subnavLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });
    var setActive = function (id) {
      subnavLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
      });
    };
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { sectionIO.observe(s.section); });
  }

  // Showcase tabs (screenshot categories on index.html)
  var showcaseTabs = document.querySelectorAll('.showcase-tab');
  if (showcaseTabs.length) {
    showcaseTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        showcaseTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var group = tab.getAttribute('data-group');
        document.querySelectorAll('.showcase-item').forEach(function (item) {
          var match = group === 'all' || item.getAttribute('data-group') === group;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // Pre-launch waitlist signup (hero form on index.html)
  var waitlistForm = document.getElementById('waitlistForm');
  if (waitlistForm) {
    var WAITLIST_URL = 'https://us-central1-glucobeacon.cloudfunctions.net/subscribeWaitlist';
    var wlStatus = document.getElementById('wlStatus');
    var wlSubmitBtn = document.getElementById('wlSubmitBtn');

    waitlistForm.addEventListener('submit', function (e) {
      e.preventDefault();
      wlStatus.className = 'waitlist-status';
      wlStatus.textContent = '';

      var email = document.getElementById('wlEmail').value;
      var website = document.getElementById('wlWebsite').value; // honeypot

      wlSubmitBtn.disabled = true;
      wlSubmitBtn.textContent = 'Sending…';

      fetch(WAITLIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, website: website }),
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (!result.ok || !result.data.success) {
            throw new Error((result.data && result.data.error) || 'Something went wrong. Please try again.');
          }
          wlStatus.className = 'waitlist-status ok';
          wlStatus.textContent = result.data.alreadySubscribed
            ? "You're already on the list — we'll email you at launch."
            : "You're on the list! We'll email you the moment GlucoBeacon launches.";
          waitlistForm.reset();
          wlSubmitBtn.disabled = false;
          wlSubmitBtn.textContent = 'Notify me at launch';
        })
        .catch(function (err) {
          wlStatus.className = 'waitlist-status err';
          wlStatus.textContent = err.message || 'Something went wrong. Please try again.';
          wlSubmitBtn.disabled = false;
          wlSubmitBtn.textContent = 'Notify me at launch';
        });
    });
  }

  // Local-currency price estimate (Pricing section, index.html). Detects
  // currency from the visitor's browser locale -- deliberately not IP
  // geolocation, so this adds zero network calls beyond the rate fetch
  // itself and never sends anyone's IP to a third party. US/unrecognized
  // locales just keep showing the plain USD price, which is already
  // correct and complete on its own -- this is a progressive addition,
  // not something the page depends on.
  var priceEls = document.querySelectorAll('[data-usd]');
  if (priceEls.length) {
    var REGION_CURRENCY = {
      // Eurozone
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
      IE: 'EUR', FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
      EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR',
      // Rest of Europe
      GB: 'GBP', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF',
      RO: 'RON', BG: 'BGN', IS: 'ISK', TR: 'TRY',
      // Asia
      JP: 'JPY', CN: 'CNY', IN: 'INR', KR: 'KRW', SG: 'SGD', HK: 'HKD', TH: 'THB', ID: 'IDR',
      MY: 'MYR', PH: 'PHP', IL: 'ILS',
      // Americas
      CA: 'CAD', MX: 'MXN', BR: 'BRL',
      // Oceania / Africa
      AU: 'AUD', NZ: 'NZD', ZA: 'ZAR',
    };

    var region = (navigator.language || '').split('-')[1];
    var currency = region ? REGION_CURRENCY[region.toUpperCase()] : null;

    if (currency) {
      var applyRate = function (rate) {
        if (!rate) return;
        priceEls.forEach(function (el) {
          var usd = parseFloat(el.getAttribute('data-usd'));
          if (!usd) return;
          var converted;
          try {
            converted = (usd * rate).toLocaleString(undefined, {
              style: 'currency', currency: currency, maximumFractionDigits: 2,
            });
          } catch (e) {
            return; // unsupported currency code for Intl in this browser -- skip silently
          }
          var note = document.createElement('span');
          note.className = 'price-fx-note';
          note.textContent = '≈ ' + converted;
          el.appendChild(note);
        });
        var disclaimer = document.getElementById('priceFxDisclaimer');
        if (disclaimer) disclaimer.hidden = false;
      };

      var CACHE_KEY = 'gb_fx_' + currency;
      var CACHE_MS = 24 * 60 * 60 * 1000;
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}

      if (cached && (Date.now() - cached.t) < CACHE_MS) {
        applyRate(cached.rate);
      } else {
        fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=' + currency)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            var rate = data && data.rates && data.rates[currency];
            if (!rate) return;
            try { localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: rate, t: Date.now() })); } catch (e) {}
            applyRate(rate);
          })
          .catch(function () { /* silently keep USD-only display */ });
      }
    }
  }
})();
