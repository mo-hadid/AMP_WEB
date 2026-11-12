/* A&M Propertiez site script: menu, tabs, forms. No dependencies. */
(function () {
  'use strict';
  var MAX = 10 * 1024 * 1024;

  // mobile menu
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (mb && nav) mb.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // contractor tabs
  var tabs = document.querySelectorAll('[role="tab"]');
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab; t.setAttribute('aria-selected', on ? 'true' : 'false');
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { select(t); }); });
  function openTab(id) { var t = document.querySelector('[aria-controls="' + id + '"]'); if (t) select(t); }
  if (location.hash === '#quote' || location.hash === '#network') openTab(location.hash.slice(1));

  // prefill from listing / project buttons
  document.querySelectorAll('.js-ask').forEach(function (a) {
    a.addEventListener('click', function () { var i = document.getElementById('buyer-property_id'); if (i) i.value = a.dataset.listing; });
  });
  document.querySelectorAll('.js-quote').forEach(function (a) {
    a.addEventListener('click', function () { openTab('quote'); var i = document.getElementById('bid-project'); if (i) i.value = a.dataset.project; });
  });
  document.querySelectorAll('a[href="#network"]').forEach(function (a) { a.addEventListener('click', function () { openTab('network'); }); });

  // thanks page
  var ref = new URLSearchParams(location.search).get('ref'), refEl = document.getElementById('ref');
  if (refEl && ref && /^[A-Z0-9-]{6,30}$/.test(ref)) refEl.textContent = ref;

  // forms
  document.querySelectorAll('.js-form').forEach(function (f) {
    f.elements.page.value = location.pathname;
    f.elements.t0.value = String(Date.now());
    var status = f.querySelector('.form-status'), btn = f.querySelector('button[type=submit]');
    function show(kind, html) { status.className = 'form-status show ' + kind; status.innerHTML = html; status.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.willValidate || bad) return;
        if (!el.checkValidity()) bad = el;
      });
      if (bad) {
        var lab = f.querySelector('label[for="' + bad.id + '"]');
        show('err', bad.type === 'checkbox' ? 'Please tick the box to let us contact you.' : 'Please check: <strong>' + (lab ? lab.firstChild.textContent.trim() : 'a required field') + '</strong>.');
        bad.focus(); return;
      }
      var file = f.querySelector('input[type=file]');
      if (file && file.files[0] && file.files[0].size > MAX) { show('err', 'That file is over 10 MB. Zip it or send a smaller one.'); return; }

      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'The server did not answer properly.' }; }); })
        .then(function (res) {
          if (res.ok) {
            f.reset(); f.elements.t0.value = String(Date.now() - 5000); f.elements.page.value = location.pathname;
            show('ok', '<strong>Thank you, it reached us.</strong> Your reference is <strong>' + res.ref + '</strong>.' + (res.emailed ? ' A copy is on its way to your inbox.' : ''));
            if (window.turnstile) window.turnstile.reset();
          } else {
            show('err', (res.error || 'Something went wrong.') + ' You can also email <a href="mailto:info@ampropertiez.com">info@ampropertiez.com</a>.');
          }
        })
        .catch(function () { show('err', 'No connection. Check your internet and try again, or email <a href="mailto:info@ampropertiez.com">info@ampropertiez.com</a>.'); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();
