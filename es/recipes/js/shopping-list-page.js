// Renders shopping-list.html: looks up cart recipe ids against
// recipe-index.json for real names/links, lets the visitor remove items,
// and generates a QR code the GlucoBeacon app's Shopping List scanner
// reads (payload: "glucobeacon-recipes:<comma-separated ids>").
(function () {
  function render(index) {
    var ids = window.gbCart.getCart();
    var emptyEl = document.getElementById('cartEmpty');
    var filledEl = document.getElementById('cartFilled');
    var itemsEl = document.getElementById('cartItems');

    if (ids.length === 0) {
      emptyEl.style.display = '';
      filledEl.style.display = 'none';
      return;
    }
    emptyEl.style.display = 'none';
    filledEl.style.display = '';

    var byId = {};
    index.forEach(function (r) { byId[r.id] = r; });

    itemsEl.innerHTML = '';
    ids.forEach(function (id) {
      var recipe = byId[id];
      var row = document.createElement('div');
      row.className = 'cart-list-item';

      var link = document.createElement('a');
      link.href = recipe ? recipe.slug + '.html' : '#';
      link.textContent = recipe ? recipe.name : 'Recipe #' + id;
      row.appendChild(link);

      var removeBtn = document.createElement('button');
      removeBtn.className = 'cart-remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        window.gbCart.removeFromCart(id);
        render(index);
        document.getElementById('qrResult').innerHTML = '';
      });
      row.appendChild(removeBtn);

      itemsEl.appendChild(row);
    });
  }

  function wireGenerateButton(index) {
    var btn = document.getElementById('generateBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var ids = window.gbCart.getCart();
      if (ids.length === 0) return;
      var payload = 'glucobeacon-recipes:' + ids.join(',');

      var qr = qrcode(0, 'M');
      qr.addData(payload);
      qr.make();

      var result = document.getElementById('qrResult');
      result.innerHTML = qr.createImgTag(6, 8);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('js/recipe-index.json')
      .then(function (res) { return res.json(); })
      .then(function (index) {
        render(index);
        wireGenerateButton(index);
      })
      .catch(function () {
        // Index unavailable (e.g. offline) -- still let the visitor see ids
        // and generate a QR code, just without friendly names.
        render([]);
        wireGenerateButton([]);
      });
  });
})();
