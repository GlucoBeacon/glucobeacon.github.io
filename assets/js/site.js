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
})();
