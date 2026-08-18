// Shared language-switcher + auto-redirect logic, reused across every page
// on the site (static and generator-templated). Adding a new language later
// only means adding one entry to LANGS and translating content -- this file
// and its markup contract (a #lang-switch element in the nav) don't change.
(function () {
  // seg: null = default/English (no path prefix). Order here is display order.
  var LANGS = [
    { code: 'en', seg: null, label: 'English', short: 'EN' },
    { code: 'es', seg: 'es', label: 'Español', short: 'ES' },
    { code: 'fil', seg: 'fil', label: 'Filipino', short: 'FIL' }
  ];
  var SUPPORTED_SEGS = LANGS.filter(function (l) { return l.seg; }).map(function (l) { return l.seg; });

  // Bare (locale-stripped) paths that have real Filipino content today.
  // Filipino is being rolled out page by page -- until a path is listed
  // here, the Filipino option is hidden on that page rather than offering
  // a link that 404s. Add to this list as more pages get translated.
  var FIL_AVAILABLE = [
    '/', '/features.html', '/compare.html', '/feedback.html', '/restaurants/', '/restaurants/ph/',
    '/restaurants/ph/bonchon.html',
    '/restaurants/ph/botejyu.html',
    '/restaurants/ph/buddys.html',
    '/restaurants/ph/burger-king.html',
    '/restaurants/ph/chowking.html',
    '/restaurants/ph/classic-savory.html',
    '/restaurants/ph/contis.html',
    '/restaurants/ph/gerrys-grill.html',
    '/restaurants/ph/jollibee.html',
    '/restaurants/ph/kenny-rogers.html',
    '/restaurants/ph/kfc.html',
    '/restaurants/ph/kuya-j.html',
    '/restaurants/ph/mang-inasal.html',
    '/restaurants/ph/mcdonalds.html',
    '/restaurants/ph/mesa.html',
    '/restaurants/ph/pepper-lunch.html',
    '/restaurants/ph/pizza-hut.html',
    '/restaurants/ph/tokyo-tokyo.html',
    '/restaurants/ph/wendys.html'
  ];

  // The 16 Latin America + Spain regions, each fully translated to
  // Filipino alongside their EN/ES pages -- unlike the 53 US chains, these
  // already live under /restaurants/{code}/ in every language, no remap
  // needed.
  var REGION_CHAIN_SLUGS = {
    esp: ['100-montaditos', 'telepizza'],
    ve: ['arturos'],
    ni: ['tip-top'],
    cu: ['el-rapido'],
    mx: ['burger-king', 'carls-jr', 'cielito-querido', 'dominos', 'el-fogoncito', 'el-pollo-loco', 'kfc', 'la-casa-de-tono', 'mcdonalds', 'pollo-feliz', 'sanborns', 'toks', 'vips', 'wings-army'],
    co: ['crepes-waffles', 'el-corral', 'frisby', 'kokoriko'],
    pe: ['bembos', 'norkys', 'pardos-chicken', 'rokys'],
    ar: ['havanna', 'mostaza'],
    cl: ['doggis', 'juan-maestro'],
    ec: ['menestras-del-negro', 'tropiburger'],
    do: ['adrian-tropical', 'meson-de-bari'],
    uy: ['el-fogon', 'la-pasiva'],
    py: ['amandau', 'lomilitos'],
    bo: ['alexander-coffee', 'pollos-copacabana'],
    pr: ['el-meson', 'martins-bbq', 'taco-maker'],
    ca: ['pollo-campero']
  };
  Object.keys(REGION_CHAIN_SLUGS).forEach(function (code) {
    FIL_AVAILABLE.push('/restaurants/' + code + '/');
    REGION_CHAIN_SLUGS[code].forEach(function (slug) {
      FIL_AVAILABLE.push('/restaurants/' + code + '/' + slug + '.html');
    });
  });

  // The 53 US chain pages predate the region split and deliberately kept
  // their existing /restaurants/{slug}.html URLs (real SEO history -- moving
  // them would have been a real ranking regression). Their Filipino
  // translations live one segment deeper, at /restaurants/us/{slug}.html,
  // so bare-path stripping alone can't connect the two sides; this list
  // drives an explicit remap in pathFor() instead of the generic prefix
  // logic used everywhere else.
  var US_CHAIN_SLUGS = [
    'applebees', 'arbys', 'bjs-restaurant-and-brewhouse', 'buffalo-wild-wings',
    'burger-king', 'chick-fil-a', 'chilis', 'chipotle', 'cracker-barrel',
    'culvers', 'dairy-queen', 'dennys', 'dominos', 'dunkin', 'five-guys',
    'ihop', 'in-n-out-burger', 'jack-in-the-box', 'jersey-mikes',
    'jimmy-johns', 'kfc', 'little-caesars', 'longhorn-steakhouse',
    'mcdonalds', 'noodles-company', 'olive-garden', 'outback-steakhouse',
    'panda-express', 'panera-bread', 'papa-johns', 'pf-changs', 'pizza-hut',
    'popeyes', 'qdoba-mexican-eats', 'raising-canes', 'red-lobster',
    'red-robin', 'shake-shack', 'slim-chickens', 'smoothie-king',
    'sonic-drive-in', 'starbucks', 'subway', 'taco-bell', 'taco-casa',
    'texas-roadhouse', 'tgi-fridays', 'the-cheesecake-factory',
    'waffle-house', 'wendys', 'whataburger', 'wingstop', 'zaxbys'
  ];
  US_CHAIN_SLUGS.forEach(function (slug) {
    FIL_AVAILABLE.push('/restaurants/' + slug + '.html');
    FIL_AVAILABLE.push('/restaurants/us/' + slug + '.html');
  });
  FIL_AVAILABLE.push('/restaurants/us/');

  FIL_AVAILABLE.push('/carb-calculator.html');

  var BLOG_SLUGS = [
    'dawn-phenomenon-explained', 'fast-food-diabetes-guide', 'how-a1c-is-calculated',
    'intermittent-fasting-and-blood-sugar', 'low-gi-foods-type-2-diabetes',
    'prediabetes-warning-signs', 'which-foods-actually-spike-your-blood-sugar'
  ];
  FIL_AVAILABLE.push('/blog/');
  BLOG_SLUGS.forEach(function (slug) {
    FIL_AVAILABLE.push('/blog/' + slug + '.html');
  });

  var RECIPE_SLUGS = [
    'almond-flour-pancakes', 'apple-slices-with-almond-butter', 'avocado-and-egg-toast',
    'bacon-egg-and-cheese-bites', 'baked-cinnamon-oranges', 'baked-salmon-with-lemon-herbs',
    'caprese-sandwich', 'caprese-skewers', 'celery-with-peanut-butter', 'chia-seed-pudding',
    'chicken-chickpea-tagine', 'chickpea-frittata-muffins', 'chickpea-tikka-masala',
    'classic-greek-salad', 'curried-red-lentil-dal', 'dark-chocolate-and-almonds',
    'denver-omelet', 'edamame', 'eggplant-parmesan', 'falafel-bowl-with-tahini',
    'fig-almond-overnight-oats', 'greek-lentil-soup-faki', 'greek-orzo-with-shrimp',
    'greek-pasta-salad', 'greek-yogurt-parfait-with-walnuts', 'grilled-chicken-souvlaki-wrap',
    'guacamole-with-pepper-strips', 'hard-boiled-eggs', 'hummus-and-veggie-sticks',
    'keto-deviled-eggs', 'marinated-olives-feta', 'mediterranean-stuffed-peppers-with-lamb-rice',
    'mushroom-risotto', 'no-sugar-beef-jerky-almonds', 'overnight-oats-with-flaxseed',
    'peanut-butter-banana-overnight-oats', 'quinoa-breakfast-bowl', 'quinoa-pilaf',
    'quinoa-tabbouleh', 'red-lentil-soup', 'roasted-chickpeas', 'roasted-garlic-cauliflower',
    'shakshuka', 'spinach-and-mushroom-frittata', 'steak-eggs', 'steel-cut-oats-with-berries',
    'sweet-potato-hash', 'tofu-and-broccoli-stir-fry', 'trail-mix-with-dark-chocolate',
    'tuna-white-bean-salad', 'turkey-and-cheddar-roll-ups', 'turkey-and-veggie-scramble',
    'tzatziki-with-cucumber-sticks', 'vegetarian-breakfast-burrito', 'veggie-buddha-bowl',
    'white-bean-and-kale-soup', 'whole-wheat-pasta-al-pomodoro'
  ];
  FIL_AVAILABLE.push('/recipes/');
  RECIPE_SLUGS.forEach(function (slug) {
    FIL_AVAILABLE.push('/recipes/' + slug + '.html');
  });

  // Directory hub pages (e.g. /recipes/) are listed in FIL_AVAILABLE only in
  // their bare-slash form, but real URLs (internal nav hrefs, bookmarks,
  // typed-in addresses) commonly spell the exact same page as
  // /recipes/index.html. Normalize that explicit form down to the bare-slash
  // form before checking availability, so a directory page doesn't lose its
  // Filipino option just because of which of the two equivalent spellings
  // the visitor is on.
  function normalizeBare(barePath) {
    return barePath.replace(/index\.html$/, '');
  }

  // Spanish now covers every page on the site, including the Philippines
  // region -- no exclusion needed.
  function isLangAvailable(seg, barePath) {
    if (!seg) return true; // English is the default locale for every page
    if (seg === 'es') return true;
    if (seg === 'fil') return FIL_AVAILABLE.indexOf(normalizeBare(barePath)) !== -1;
    return true;
  }

  function usChainRemapToFil(bare) {
    // Deliberately NOT remapping the bare "/restaurants/" hub here: its real
    // Filipino equivalent is the country-selector hub at fil/restaurants/
    // (which the unremapped fall-through in pathFor() already reaches
    // correctly) -- only fil/restaurants/us/ needs the reverse remap below,
    // since en/es have no separate "just the US chains" sub-hub to point at.
    var m = bare.match(/^\/restaurants\/([a-z0-9-]+)\.html$/);
    if (m && US_CHAIN_SLUGS.indexOf(m[1]) !== -1) return '/restaurants/us/' + m[1] + '.html';
    return null;
  }
  function usChainRemapToEn(bare) {
    if (bare === '/restaurants/us/') return '/restaurants/';
    var m = bare.match(/^\/restaurants\/us\/([a-z0-9-]+)\.html$/);
    if (m && US_CHAIN_SLUGS.indexOf(m[1]) !== -1) return '/restaurants/' + m[1] + '.html';
    return null;
  }

  function currentLang() {
    var seg = location.pathname.split('/').filter(Boolean)[0];
    return SUPPORTED_SEGS.indexOf(seg) !== -1 ? seg : null;
  }

  function pathWithoutLang(seg) {
    if (!seg) return location.pathname;
    return location.pathname.replace(new RegExp('^/' + seg + '(/|$)'), '/') || '/';
  }

  function pathFor(seg) {
    var curSeg = currentLang();
    var bare = pathWithoutLang(curSeg);
    // Normalize first: if currently on a Filipino /restaurants/us/ page,
    // compute the en/es-equivalent bare path (they have no us/ segment).
    if (curSeg === 'fil') {
      var toEn = usChainRemapToEn(bare);
      if (toEn) bare = toEn;
    }
    if (seg === 'fil') {
      var toFil = usChainRemapToFil(bare);
      if (toFil) return '/fil' + toFil;
    }
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
      if (!l.seg) return false;
      if (l.seg === 'fil') return browserLang.indexOf('fil') === 0 || browserLang.indexOf('tl') === 0;
      return browserLang.indexOf(l.seg) === 0;
    })[0];
    if (!match) return;
    if (!isLangAvailable(match.seg, location.pathname)) return;
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
    var barePath = pathWithoutLang(currentSeg);
    var visibleLangs = LANGS.filter(function (l) {
      return l.seg === currentSeg || isLangAvailable(l.seg, barePath);
    });

    var items = visibleLangs.map(function (l) {
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
