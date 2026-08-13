// Shared language-switcher + auto-redirect logic, reused across every page
// on the site (static and generator-templated). Adding a new language later
// only means adding one entry to LANGS and translating content -- this file
// and its markup contract (a #lang-switch element in the nav) don't change.
(function () {
  // seg: null = default/English (no path prefix). Order here is display order.
  var LANGS = [
    { code: 'en', seg: null, label: 'English', short: 'EN' },
    { code: 'es', seg: 'es', label: 'Español', short: 'ES' }
  ];
  var SUPPORTED_SEGS = LANGS.filter(function (l) { return l.seg; }).map(function (l) { return l.seg; });

  function currentLang() {
    var seg = location.pathname.split('/').filter(Boolean)[0];
    return SUPPORTED_SEGS.indexOf(seg) !== -1 ? seg : null;
  }

  function pathWithoutLang(seg) {
    if (!seg) return location.pathname;
    return location.pathname.replace(new RegExp('^/' + seg + '(/|$)'), '/') || '/';
  }

  function pathFor(seg) {
    var bare = pathWithoutLang(currentLang());
    return seg ? '/' + seg + bare : bare;
  }

  // Auto-redirect: only fires from a default-locale (English) page, only once
  // per browser (localStorage flag), only if the visitor never explicitly
  // chose English before, and never loops back from a localized page.
  function maybeAutoRedirect() {
    var lang = currentLang();
    if (lang) return; // already on a localized page
    if (location.search.indexOf('lang=en') !== -1) return;
    if (localStorage.getItem('gb_lang_choice') === 'en') return;
    var browserLang = (navigator.language || '').toLowerCase();
    var match = LANGS.filter(function (l) {
      return l.seg && browserLang.indexOf(l.seg) === 0;
    })[0];
    if (!match) return;
    location.replace('/' + match.seg + location.pathname + location.hash);
  }

  function closeMenu(root) {
    root.classList.remove('is-open');
    root.querySelector('.lang-dropdown-btn').setAttribute('aria-expanded', 'false');
  }

  function renderSwitcher() {
    var el = document.getElementById('lang-switch');
    if (!el) return;
    var currentSeg = currentLang();
    var current = LANGS.filter(function (l) { return l.seg === currentSeg; })[0] || LANGS[0];

    var items = LANGS.map(function (l) {
      var isActive = l.seg === currentSeg;
      var href = isActive ? '#' : pathFor(l.seg) + (l.seg ? '' : '?lang=en');
      return '<li role="none">' +
        '<a role="menuitemradio" aria-checked="' + isActive + '"' +
        (isActive ? ' class="active" tabindex="-1"' : '') +
        ' href="' + href + '" data-seg="' + (l.seg || '') + '">' + l.label + '</a>' +
        '</li>';
    }).join('');

    el.innerHTML =
      '<div class="lang-dropdown">' +
      '<button type="button" class="lang-dropdown-btn" aria-haspopup="true" aria-expanded="false">' +
      '<span class="lang-globe" aria-hidden="true">\u{1F310}</span>' + current.short +
      '<span class="lang-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul class="lang-dropdown-menu" role="menu">' + items + '</ul>' +
      '</div>';

    var root = el.querySelector('.lang-dropdown');
    var btn = root.querySelector('.lang-dropdown-btn');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !root.classList.contains('is-open');
      root.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });

    root.querySelectorAll('a[data-seg]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (a.classList.contains('active')) { e.preventDefault(); return; }
        localStorage.setItem('gb_lang_choice', a.getAttribute('data-seg') || 'en');
      });
    });

    document.addEventListener('click', function () { closeMenu(root); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu(root);
    });
  }

  maybeAutoRedirect();
  document.addEventListener('DOMContentLoaded', renderSwitcher);
})();
