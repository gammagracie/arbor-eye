// Site search (since 2026-11-04): the magnifying glass in the header, left of the account icon, opens a search panel over the
// page. It searches every work shown on the site by title, series, description, medium and orientation, and the site's pages
// (search-data.js, built from the works list by _incoming/make_search.py). Every word typed must match; titles rank first.
// Keyboard: / opens it, Escape closes, the up / down arrows move through the results and Enter opens one.
(function () {
  const css = `
.srch { position: fixed; inset: 0; z-index: 1000; background: rgba(253, 253, 251, 0.98); overflow: auto; display: none; }
.srch.open { display: block; }
.srch-in { width: min(760px, calc(100vw - 48px)); margin: 0 auto; padding: calc(var(--header-h, 80px) + 32px) 0 80px; box-sizing: border-box; }
.srch-row { display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #141414; padding-bottom: 10px; }
.srch-row svg { flex: none; color: #141414; }
.srch input { flex: 1; min-width: 0; border: none; background: transparent; outline: none; font-family: 'EB Garamond', serif; font-size: calc(28px * var(--fs, 1)); letter-spacing: 0.06em; color: #141414; padding: 4px 0; }
.srch input::placeholder { color: #8A867E; }
.srch-x { position: fixed; top: 20px; right: 24px; width: 44px; height: 44px; border-radius: 9999px; border: none; padding: 0; background: #FFFFFF; color: #1C1C1C; box-shadow: 0 2px 10px rgba(28, 28, 28, 0.15); display: grid; place-items: center; cursor: pointer; }
.srch-count { margin: 14px 0 0; font-family: "Neuzeit Grotesk", "Helvetica Neue", Helvetica, sans-serif; font-size: calc(12px * var(--fs, 1)); letter-spacing: 0.16em; text-transform: uppercase; color: #6E6B66; }
.srch h2 { margin: 36px 0 10px; font-family: "Neuzeit Grotesk", "Helvetica Neue", Helvetica, sans-serif; font-weight: 400; font-size: calc(12px * var(--fs, 1)); letter-spacing: 0.2em; text-transform: uppercase; color: #6E6B66; }
.srch ul { list-style: none; margin: 0; padding: 0; }
.srch li a { display: flex; align-items: center; gap: 18px; padding: 10px 8px; color: #141414; text-decoration: none; border-radius: 2px; }
.srch li a:hover, .srch li a[aria-selected="true"] { background: #F0F2EF; }
.srch li a:focus-visible { outline: 2px solid #141414; outline-offset: 2px; }
.srch li img { flex: none; width: 72px; height: 48px; object-fit: contain; }
.srch li img.v { width: 48px; height: 72px; margin: 0 12px; }
.srch .t { display: block; font-family: 'EB Garamond', serif; font-size: calc(17px * var(--fs, 1)); letter-spacing: 0.1em; text-transform: uppercase; }
.srch .d { display: block; margin-top: 3px; font-family: "Neuzeit Grotesk", "Helvetica Neue", Helvetica, sans-serif; font-size: calc(13px * var(--fs, 1)); color: #5E5B56; }
.srch mark { background: none; color: inherit; text-decoration: underline; text-underline-offset: 3px; }
.srch-empty { margin: 28px 0 0; font-family: "Neuzeit Grotesk", "Helvetica Neue", Helvetica, sans-serif; font-size: calc(14px * var(--fs, 1)); color: #5E5B56; }
@media (prefers-reduced-motion: no-preference) { .srch.open { animation: srch-in 0.25s ease; } @keyframes srch-in { from { opacity: 0; } } }
`;
  const fold = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let box, input, list, count, opener, sel = -1, links = [];

  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div');
    box.className = 'srch';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Search the site');
    box.innerHTML = `<button type="button" class="srch-x" aria-label="Close search"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m1 1 14 14M1 15 15 1" stroke="currentColor"></path></svg></button>
<div class="srch-in">
  <div class="srch-row"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.75"></circle><path d="m15.5 15.5 5.5 5.5" stroke-linecap="round"></path></svg>
  <input type="search" placeholder="Search works, series, descriptions…" aria-label="Search works, series, descriptions and pages" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="srch-list" aria-autocomplete="list"></div>
  <p class="srch-count" role="status" aria-live="polite"></p>
  <div id="srch-list"></div>
</div>`;
    document.body.appendChild(box);
    input = box.querySelector('input'); list = box.querySelector('#srch-list'); count = box.querySelector('.srch-count');
    box.querySelector('.srch-x').addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    input.addEventListener('input', run);
  }

  function score(item, words, fields) {
    let s = 0;
    for (const w of words) {
      let hit = false;
      fields.forEach(([text, weight]) => { const t = fold(text); if (t.includes(w)) { hit = true; s += weight * (t.startsWith(w) || t.includes(' ' + w) ? 2 : 1); } });
      if (!hit) return 0;
    }
    return s;
  }
  const mark = (text, words) => { let h = esc(text); words.forEach(w => { if (w.length > 1) h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return h; };

  function run() {
    const D = window.SEARCH_DATA || { works: [], pages: [] };
    const words = fold(input.value).split(/\s+/).filter(Boolean);
    sel = -1;
    if (!words.length) { list.innerHTML = ''; count.textContent = ''; links = []; return; }
    const works = D.works.map(w => ({ w, s: score(w, words, [[w.t, 10], [w.s, 5], [w.d, 3], [w.m, 1], [w.v ? 'vertical portrait' : 'horizontal landscape', 1]]) })).filter(x => x.s).sort((a, b) => b.s - a.s);
    const pages = D.pages.map(p => ({ p, s: score(p, words, [[p.t, 10], [p.k, 2]]) })).filter(x => x.s).sort((a, b) => b.s - a.s);
    let html = '';
    if (works.length) html += '<h2>Works</h2><ul role="listbox" aria-label="Works">' + works.map(({ w }) =>
      `<li><a role="option" href="Gallery.dc.html#${encodeURIComponent(w.f)}"><img class="${w.v ? 'v' : ''}" src="assets/thumbs/${esc(w.f)}" alt="" loading="lazy"><span><span class="t">${mark(w.t, words)}</span><span class="d">${mark(w.s, words)}${w.d ? ' · ' + mark(w.d, words) : ''}</span></span></a></li>`).join('') + '</ul>';
    if (pages.length) html += '<h2>Pages</h2><ul role="listbox" aria-label="Pages">' + pages.map(({ p }) => `<li><a role="option" href="${esc(p.u)}"><span><span class="t">${mark(p.t, words)}</span></span></a></li>`).join('') + '</ul>';
    list.innerHTML = html || '';
    const n = works.length + pages.length;
    count.textContent = n ? n + (n === 1 ? ' result' : ' results') : '';
    if (!n) list.innerHTML = '<p class="srch-empty">Nothing matches “' + esc(input.value.trim()) + '”. Try a title, a series (Ascent, Core, Structure…) or a word from a description.</p>';
    links = [...list.querySelectorAll('a')];
    // a link to the page already open (another work on the gallery, a different About tab) only changes the hash: close the panel too
    links.forEach(a => a.addEventListener('click', () => setTimeout(close, 0)));
  }
  function move(d) {
    if (!links.length) return;
    if (sel >= 0) links[sel].removeAttribute('aria-selected');
    sel = (sel + d + links.length) % links.length;
    links[sel].setAttribute('aria-selected', 'true'); links[sel].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', '');
  }
  function open(from) {
    if (!box) build();
    opener = from || document.activeElement;
    box.classList.add('open'); document.documentElement.style.overflow = 'hidden';
    input.focus(); input.select(); run();
  }
  function close() {
    if (!box || !box.classList.contains('open')) return;
    box.classList.remove('open'); document.documentElement.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }

  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-search-open]'); if (b) { e.preventDefault(); open(b); } });
  // the panel's keys come first, so the page's own arrow-key carousels do not move underneath it
  window.addEventListener('keydown', e => {
    const isOpen = box && box.classList.contains('open');
    if (!isOpen) {
      if (e.key === '/' && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable]'))) { e.preventDefault(); open(); }
      return;
    }
    e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); links[sel].click(); }
    else if (e.key === 'Tab') {   // keep the focus inside the panel
      const f = [box.querySelector('.srch-x'), input, ...links]; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }, true);
})();
