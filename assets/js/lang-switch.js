// Shared language-switcher + auto-redirect logic, reused across every page
// on the site (static and generator-templated). Adding a new language later
// only means extending SUPPORTED_LANGS and translating content -- this file
// and its markup contract (a #lang-switch element in the nav) don't change.
(function () {
  var SUPPORTED_LANGS = ['es']; // non-default locales with a real translated tree, mirrored under /<lang>/

  function currentLang() {
    var seg = location.pathname.split('/').filter(Boolean)[0];
    return SUPPORTED_LANGS.indexOf(seg) !== -1 ? seg : null;
  }

  function pathWithoutLang(lang) {
    if (!lang) return location.pathname;
    return location.pathname.replace(new RegExp('^/' + lang + '(/|$)'), '/') || '/';
  }

  // Auto-redirect: only fires from a default-locale (English) page, only once
  // per browser (localStorage flag), only if the visitor never explicitly
  // chose English before, and never loops back from an /es/ page.
  function maybeAutoRedirect() {
    var lang = currentLang();
    if (lang) return; // already on a localized page
    if (location.search.indexOf('lang=en') !== -1) return;
    if (localStorage.getItem('gb_lang_choice') === 'en') return;
    var browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.indexOf('es') !== 0) return;
    location.replace('/es' + location.pathname + location.hash);
  }

  function renderSwitcher() {
    var el = document.getElementById('lang-switch');
    if (!el) return;
    var lang = currentLang();
    if (lang === 'es') {
      var enPath = pathWithoutLang('es');
      el.innerHTML = '<a href="' + enPath + '?lang=en">English</a>';
      el.querySelector('a').addEventListener('click', function () {
        localStorage.setItem('gb_lang_choice', 'en');
      });
    } else {
      el.innerHTML = '<a href="/es' + location.pathname + '">Español</a>';
      el.querySelector('a').addEventListener('click', function () {
        localStorage.setItem('gb_lang_choice', 'es');
      });
    }
  }

  maybeAutoRedirect();
  document.addEventListener('DOMContentLoaded', renderSwitcher);
})();
