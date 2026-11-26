// (since 2026-11-26, Grace) Home on phones held upright (under 768px) (see home-panel.css):
//  - on load, the intro as on desktop: the Tree of Life, then the wordmark, then the painting alone (since 2026-11-26)
//  - a tap on the painting brings up the series, title and "View the work" link, then the arrows either side; all fade after 2s
//    (since 2026-11-26; a tap opened the work in Gallery before). The link opens the work's page
//  - a swipe left or right moves along the thumbnails (the arrows show for 1s); a thumbnail tap loads that work
//  - the header goes back to its usual colours while the mobile menu is open
// Panels Flow (trial, since 2026-11-26, Grace; index.html?flow=1, linked from the mobile menu): the painting drifts, slowly
// growing, shrinking and panning, until the visitor first touches, scrolls or presses a key; then it holds still where it is
(() => {
  const W = [   // the Home works, in Home's order (Articulation is left out there too)
    ['Brilliance', 'select_brilliance', 'Series 4 · Select', 'Light reveals what was always there.'],
    ['Symbiosis', 'core_symbiosis', 'Series 3 · Core', 'Distinct forms exist through mutual relationships.'],
    ['Emergence', 'core_emergence-no-dedication', 'Series 3 · Core', 'Variation gives rise to complexity.'],
    ['Script', 'core_script', 'Series 3 · Core', 'Repeated strokes form a visual language.']];
  const TITLE_MS = 2500, ARROWS_MS = 1000, TAP_MS = 2000, ARROW_LAG = 350;
  const FLOW = /[?&]flow=1\b/.test(location.search);
  const MQ = matchMedia('(max-width: 767px) and (orientation: portrait)');
  let cur = 0, swap = 0, txT = 0, arT = 0, x0 = null, y0 = null, warmed = false, started = false;
  const q = s => document.querySelector(s);
  const href = k => 'Gallery.dc.html#' + encodeURIComponent(W[k][0]);
  const warm = () => { if (warmed || !MQ.matches) return; warmed = true; W.forEach(w => { new Image().src = 'assets/works/' + w[1] + '.jpg'; }); };
  function showTitle() {
    const p = q('.hp'); if (!p) return;
    p.classList.add('tx-on'); clearTimeout(txT); txT = setTimeout(() => p.classList.remove('tx-on'), TITLE_MS);
  }
  function showArrows() {
    const p = q('.hp'); if (!p) return;
    p.classList.add('arr-on'); clearTimeout(arT); arT = setTimeout(() => p.classList.remove('arr-on'), ARROWS_MS);
  }
  function pick(k, arrows) {
    const bg = q('.hp-bg'), p = q('.hp'); if (!bg || !p) return;
    k = (k + W.length) % W.length; if (arrows) showArrows(); if (k === cur) return; cur = k; const w = W[k];
    document.querySelectorAll('.hp-strip button').forEach((b, n) => b.setAttribute('aria-current', String(n === k)));
    bg.style.opacity = 0; p.classList.remove('tx-on'); clearTimeout(txT); clearTimeout(swap);
    swap = setTimeout(() => {
      bg.onload = () => { bg.style.opacity = 1; };
      bg.src = 'assets/works/' + w[1] + '.jpg'; bg.alt = w[0];
      q('.hp-k').textContent = w[2]; q('.hp-t').textContent = w[0]; q('.hp-d').textContent = w[3]; q('.hp-btn').href = href(k);
    }, 300);
  }
  // the intro, timed as on desktop (index.html): the tree in from 0.15s, away from 3.55s, the wordmark in from 5.15s, away from 11.15s.
  // A tap, swipe or key cuts it short (a quicker fade)
  let iT = [], inIntro = false;
  function intro() {
    const p = q('.hp'); if (!p) return; inIntro = true;
    const at = (ms, f) => iT.push(setTimeout(() => { const n = q('.hp'); if (n) f(n); }, ms));
    at(150, n => n.classList.add('i-tree')); at(3550, n => n.classList.remove('i-tree'));
    at(5150, n => n.classList.add('i-mark')); at(11150, n => n.classList.remove('i-mark')); at(13000, () => { inIntro = false; });
  }
  function endIntro() {
    if (!inIntro) return; inIntro = false; iT.forEach(clearTimeout); iT = [];
    const p = q('.hp'); if (p) { p.classList.add('i-skip'); p.classList.remove('i-tree', 'i-mark'); }
  }
  // a tap on the painting: the type, then the arrows; both away after 2s
  let rvT = [];
  function reveal() {
    const p = q('.hp'); if (!p) return; endIntro(); rvT.forEach(clearTimeout); clearTimeout(txT); clearTimeout(arT);
    p.classList.add('tx-on');
    rvT = [setTimeout(() => p.classList.add('arr-on'), ARROW_LAG), setTimeout(() => p.classList.remove('tx-on', 'arr-on'), TAP_MS)];
  }
  // first showing: the title and the arrows once the painting is in. The page rebuilds its markup after it loads, so this looks
  // for the panel afresh every 100ms (for up to 15s) rather than holding on to the first copy it finds
  let tries = 0;
  function start() {
    if (started || !MQ.matches) return;
    const bg = q('.hp-bg');
    if (bg && bg.complete && bg.naturalWidth && bg.getBoundingClientRect().width) { started = true; if (FLOW) q('.hp').classList.add('flow'); intro(); return; }
    if (++tries < 150) setTimeout(start, 100);
  }
  start(); MQ.addEventListener('change', () => { tries = 0; start(); });
  const menu = () => { const n = q('nav[data-screen-label="Mobile menu"]'); document.documentElement.classList.toggle('hp-menu', !!n && n.style.visibility === 'visible'); };
  document.addEventListener('click', e => {
    setTimeout(menu, 30);
    const t = e.target.closest ? e.target : null; if (!t || !t.closest('.hp')) return;
    const b = t.closest('.hp-strip button'); if (b) { endIntro(); return pick(+b.dataset.k); }
    if (t.closest('.hp-strip')) return;
    const a = t.closest('.hp-arr'); if (a) return pick(cur + (a.classList.contains('next') ? 1 : -1), true);
    if (t.closest('a')) return;   // the "View the work" link goes there itself
    reveal();
  });
  document.addEventListener('keydown', () => setTimeout(menu, 30));
  addEventListener('resize', () => setTimeout(menu, 30), { passive: true });
  document.addEventListener('touchstart', e => {
    const inside = e.target.closest && e.target.closest('.hp') && !e.target.closest('.hp-strip');
    x0 = inside ? e.touches[0].clientX : null; y0 = inside ? e.touches[0].clientY : null; warm();
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { endIntro(); pick(cur + (dx < 0 ? 1 : -1), true); }
  }, { passive: true });
  // Flow: the first touch, click, scroll or key press stops the drift for good
  const still = () => { const p = q('.hp.flow'); if (p) p.classList.add('still'); };
  ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(ev => addEventListener(ev, still, { passive: true, capture: true }));
  // the menu's trial link: to Panels Flow, or back to the plain panel while on Flow
  const flowLink = () => { const a = q('a[data-flow-link]'); if (a && FLOW) { a.href = 'index.html'; a.textContent = 'Home: Panels (test)'; } };
  document.addEventListener('click', () => setTimeout(flowLink, 0), true);
  addEventListener('load', () => setTimeout(warm, 1500));
})();
