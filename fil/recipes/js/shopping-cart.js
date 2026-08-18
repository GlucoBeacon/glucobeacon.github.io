// Recipe "shopping cart" -- lets a visitor pick a few recipes across the
// site, then generate a QR code on shopping-list.html that the GlucoBeacon
// app's Shopping List screen (QR scan icon) reads to bulk-add every
// ingredient at once. Cart lives in localStorage only, no server involved.
(function () {
  var CART_KEY = 'gb_shopping_cart';

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.filter(function (n) { return Number.isInteger(n); }) : [];
    } catch (e) {
      return [];
    }
  }

  function setCart(ids) {
    localStorage.setItem(CART_KEY, JSON.stringify(ids));
  }

  function addToCart(id) {
    var ids = getCart();
    if (ids.indexOf(id) === -1) ids.push(id);
    setCart(ids);
    renderFloatingPill();
  }

  function removeFromCart(id) {
    setCart(getCart().filter(function (existing) { return existing !== id; }));
    renderFloatingPill();
  }

  function isInCart(id) {
    return getCart().indexOf(id) !== -1;
  }

  function renderFloatingPill() {
    var count = getCart().length;
    var existing = document.getElementById('gbCartPill');
    if (count === 0) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement('a');
      existing.id = 'gbCartPill';
      existing.className = 'gb-cart-pill';
      existing.href = 'shopping-list.html';
      document.body.appendChild(existing);
    }
    existing.textContent = '🛒 Shopping List (' + count + ')';
  }

  function wireToggleButton() {
    var btn = document.getElementById('cartToggleBtn');
    if (!btn) return;
    var id = parseInt(btn.getAttribute('data-recipe-id'), 10);
    if (!Number.isInteger(id)) return;

    function refresh() {
      if (isInCart(id)) {
        btn.textContent = '✓ Added to Shopping List';
        btn.classList.add('is-added');
      } else {
        btn.textContent = 'Add to Shopping List';
        btn.classList.remove('is-added');
      }
    }

    btn.addEventListener('click', function () {
      if (isInCart(id)) {
        removeFromCart(id);
      } else {
        addToCart(id);
      }
      refresh();
    });
    refresh();
  }

  window.gbCart = { getCart: getCart, addToCart: addToCart, removeFromCart: removeFromCart, isInCart: isInCart };

  document.addEventListener('DOMContentLoaded', function () {
    renderFloatingPill();
    wireToggleButton();
  });
})();
