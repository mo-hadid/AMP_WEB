/* Private inbox for website forms. Token kept only for this browser tab. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LABEL = { offer: 'Offer', buyer: 'Buyer', vendor: 'Contractor', bid: 'Quote', contact: 'Message' };
  var token = ''; try { token = sessionStorage.getItem('amp-token') || ''; } catch (e) {}
  var statuses = [], current = null, timer;

  function api(path, opts) {
    opts = opts || {}; opts.headers = Object.assign({ Authorization: 'Bearer ' + token }, opts.headers || {});
    return fetch('/api/admin/' + path, opts).then(function (r) {
      if (r.status === 401) { signOut(); throw new Error('That token was not accepted.'); }
      return r;
    });
  }
  function signOut() { token = ''; try { sessionStorage.removeItem('amp-token'); } catch (e) {} $('#app').hidden = true; $('#login').hidden = false; $('#logout').hidden = true; }

  $('#login').addEventListener('submit', function (e) {
    e.preventDefault(); token = $('#token').value.trim();
    var st = $('#login .form-status');
    api('stats').then(function (r) { return r.json(); }).then(function (res) {
      if (!res.ok) throw new Error(res.error);
      try { sessionStorage.setItem('amp-token', token); } catch (er) {}
      start(res.statuses);
    }).catch(function (err) { st.className = 'form-status show err'; st.textContent = err.message; });
  });
  $('#logout').addEventListener('click', signOut);

  function start(s) {
    statuses = s; $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = false;
    $('#status').innerHTML = '<option value="">Any status</option>' + s.map(function (x) { return '<option>' + x + '</option>'; }).join('');
    load();
  }
  function load() {
    var p = new URLSearchParams({ q: $('#q').value, form: $('#form').value, status: $('#status').value });
    api('list?' + p).then(function (r) { return r.json(); }).then(function (res) {
      var items = res.items || [];
      $('#count').textContent = items.length + ' message' + (items.length === 1 ? '' : 's');
      $('#list').innerHTML = items.map(function (m) {
        return '<li class="ad-item' + (m.ref === current ? ' on' : '') + '" tabindex="0" data-ref="' + esc(m.ref) + '"><b><span class="pill ' + (m.status === 'new' ? 'new' : '') + '">' + esc(LABEL[m.form] || m.form) + '</span>' + esc(m.name) + '</b><span>' + esc(m.subject) + '</span><span>' + new Date(m.created).toLocaleString() + ' · ' + esc(m.status) + (m.file_name ? ' · 📎' : '') + '</span></li>';
      }).join('') || '<li class="ad-item">No messages yet.</li>';
    }).catch(function (e) { $('#count').textContent = e.message; });
  }
  ['#form', '#status'].forEach(function (s) { $(s).addEventListener('change', load); });
  $('#q').addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(load, 300); });
  $('#list').addEventListener('click', function (e) { var li = e.target.closest('[data-ref]'); if (li) open(li.dataset.ref); });
  $('#list').addEventListener('keydown', function (e) { var li = e.target.closest('[data-ref]'); if (li && e.key === 'Enter') open(li.dataset.ref); });

  function open(ref) {
    current = ref;
    api('item?ref=' + encodeURIComponent(ref)).then(function (r) { return r.json(); }).then(function (res) {
      var m = res.item, d = m.data || {};
      var rows = Object.keys(d).filter(function (k) { return d[k]; }).map(function (k) { return '<tr><td>' + esc(k.replace(/_/g, ' ')) + '</td><td>' + esc(d[k]).replace(/\n/g, '<br>') + '</td></tr>'; }).join('');
      var subj = encodeURIComponent('Re: ' + m.subject + ' (' + m.ref + ')');
      $('#detail').innerHTML = '<p class="eyebrow">' + esc(LABEL[m.form] || m.form) + ' · ' + esc(m.ref) + '</p><h2 style="font-size:1.5rem">' + esc(m.subject) + '</h2>' +
        '<p class="muted small">' + new Date(m.created).toLocaleString() + (m.emailed ? ' · emailed to partners' : ' · not emailed') + '</p><table>' + rows + '</table>' +
        (m.file_name ? '<p><button class="btn small" id="dl" type="button">Download ' + esc(m.file_name) + '</button></p>' : '') +
        '<div class="field"><label for="notes">Notes</label><textarea id="notes">' + esc(m.notes) + '</textarea></div>' +
        '<div class="row"><select id="st" aria-label="Status">' + statuses.map(function (s) { return '<option' + (s === m.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<button class="btn primary small" id="save" type="button">Save</button><a class="btn small" href="mailto:' + esc(m.email) + '?subject=' + subj + '">Reply by email</a>' +
        (m.phone ? '<a class="btn small" href="tel:' + esc(m.phone.replace(/[^0-9+]/g, '')) + '">Call</a>' : '') +
        '<button class="btn small danger" id="del" type="button">Delete</button><span id="saved" class="muted small"></span></div>';
      $('#save').onclick = function () {
        api('update', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: ref, status: $('#st').value, notes: $('#notes').value }) })
          .then(function () { $('#saved').textContent = 'Saved'; load(); });
      };
      $('#del').onclick = function () {
        if (!confirm('Delete ' + ref + ' and its file? This cannot be undone.')) return;
        api('delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: ref }) })
          .then(function () { current = null; $('#detail').innerHTML = '<p class="muted">Deleted.</p>'; load(); });
      };
      var dl = $('#dl'); if (dl) dl.onclick = function () {
        api('file?ref=' + encodeURIComponent(ref)).then(function (r) { if (!r.ok) throw new Error('File not found'); return r.blob(); }).then(function (b) {
          var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = m.file_name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        }).catch(function (e) { alert(e.message); });
      };
      load();
    });
  }
  if (token) api('stats').then(function (r) { return r.json(); }).then(function (res) { if (res.ok) start(res.statuses); }).catch(function () {});
})();
