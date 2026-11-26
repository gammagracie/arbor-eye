// (since 2026-11-26, Grace) Home on phones held upright (under 768px) (see home-panel.css):
//  - on load, the intro as on desktop: the Tree of Life, then the wordmark; then a slideshow (since 2026-11-26 late, Grace): each
//    painting moves slowly, easing out from close up (never showing its edges) for 3.5s, fades, and the next comes up, round all
//    nine, until the visitor taps the painting (or swipes, or taps a thumbnail or arrow); then it holds still where it is
//  - five thumbnails along the bottom, as on desktop: the current work in the middle, two either side, from all nine Home works
//    (in Home's order, Articulation left out as there); a thumbnail tap loads that work
//  - a swipe left or right moves to the next or previous work (the arrows show for 1s)
//  - a tap on the painting brings up the series, title and "View this work" link, then the arrows either side; all fade after 2s.
//    The arrows can be tapped at any time (they sit at the screen's edges, level with the title); a tap brings the type up too
//  - the footer: with a mouse, resting the pointer at the bottom for 1.5s slides the page up so the footer shows and the
//    thumbnails rise with it, and moving off it slides it back; on a phone the page scrolls up the same way with a finger
//  - the header goes back to its usual colours while the mobile menu is open
// Panels Flow (trial; index.html?flow=1, linked from the mobile menu): the painting drifts, slowly growing, shrinking and panning,
// until the visitor first touches, scrolls or presses a key; then it holds still where it is
(() => {
  // title, file, series line, tagline (not shown on phones), and the painting's place in its thumbnail (for Home's thumbnail crop)
  const W = [
    ['Brilliance', 'select_brilliance', 'Series 4 · Select', 'Light reveals what was always there.', [0.118, 0.878, 0.170, 0.830]],
    ['Symbiosis', 'core_symbiosis', 'Series 3 · Core', 'Distinct forms exist through mutual relationships.', [0.120, 0.883, 0.188, 0.818]],
    ['Emergence', 'core_emergence-no-dedication', 'Series 3 · Core', 'Variation gives rise to complexity.', [0.117, 0.882, 0.172, 0.828]],
    ['Script', 'core_script', 'Series 3 · Core', 'Repeated strokes form a visual language.', [0.118, 0.882, 0.177, 0.828]],
    ['Habitat', 'core_habitat', 'Series 3 · Core', 'Living forms establish a shared environment.', [0.122, 0.882, 0.177, 0.823]],
    ['Chamber', 'core_chamber', 'Series 3 · Core', 'Defined spaces establish internal relationships.', [0.122, 0.877, 0.185, 0.823]],
    ['Affinity', 'core_affinity', 'Series 3 · Core', 'Related forms create a unified field.', [0.117, 0.880, 0.175, 0.833]],
    ['Conduit', 'core_conduit', 'Series 3 · Core', 'Pathways connect a shared structure.', [0.108, 0.892, 0.163, 0.823]],
    ['Upwelling', 'core_upwelling', 'Series 3 · Core', 'Parallel forms organize a living field.', null]];
  const ARROWS_MS = 1000, TAP_MS = 2000, ARROW_LAG = 350, FOOT_HOLD = 1500, MOVE_MS = 3500, FADE_MS = 500;
  // each painting's movement: from close up to a little further out, drifting a little; scale never below 1.45 and the drift never more
  // than the room the scale leaves, so no edge of the painting shows. Turn by turn round the list
  const MOVES = [[2.2, 1.6, [-3, 2], [2, -1]], [2.15, 1.55, [3, 3], [-2, 0]], [2.25, 1.65, [0, -3], [1, 2]], [2.1, 1.5, [-2, -2], [3, 1]]];
  const CALM = matchMedia('(prefers-reduced-motion: reduce)');
  let auto = false, move = null, nextT = 0, moveN = 0;
  const FLOW = /[?&]flow=1\b/.test(location.search);
  const MQ = matchMedia('(max-width: 767px) and (orientation: portrait)');
  let cur = 0, swap = 0, arT = 0, x0 = null, y0 = null, warmed = false, started = false;
  const q = s => document.querySelector(s);
  const href = k => 'Gallery.dc.html#' + encodeURIComponent(W[k][0]);
  const mod = k => (k % W.length + W.length) % W.length;
  // Home's thumbnail crop: the scan zoomed so a thin edge of its paper shows (the painting 85.2% of the width, 82% of the height)
  const zoom = f => { if (!f) return ''; const [x0, x1, y0, y1] = f, k = Math.min(0.852 / (x1 - x0), 0.82 / (y1 - y0)), at = (lo, hi) => Math.min(0, Math.max(1 - k, 0.5 - (lo + hi) / 2 * k)) * 100; return 'translate(' + at(x0, x1).toFixed(2) + '%, ' + at(y0, y1).toFixed(2) + '%) scale(' + k.toFixed(4) + ')'; };
  const warm = () => { if (warmed || !MQ.matches) return; warmed = true; W.forEach(w => { new Image().src = 'assets/works/' + w[1] + '.jpg'; }); };
  // the five thumbnails: slots -2..2 around the current work
  function strip() {
    document.querySelectorAll('.hp-strip button').forEach(b => {
      const k = mod(cur + +b.dataset.slot), w = W[k], im = b.querySelector('img');
      if (b.dataset.k !== String(k)) { b.dataset.k = k; im.src = 'assets/thumbs/' + w[1] + '.jpg'; im.style.transform = zoom(w[4]); b.setAttribute('aria-label', w[0]); }
      b.setAttribute('aria-current', String(b.dataset.slot === '0'));
    });
  }
  function showArrows(ms) {
    const p = q('.hp'); if (!p) return;
    p.classList.add('arr-on'); clearTimeout(arT); arT = setTimeout(() => p.classList.remove('arr-on'), ms || ARROWS_MS);
  }
  function pick(k) {
    const bg = q('.hp-bg'); if (!bg) return;
    k = mod(k); if (k === cur) return; cur = k; const w = W[k];
    strip(); bg.style.opacity = 0; clearTimeout(swap);
    swap = setTimeout(() => {
      bg.onload = () => { bg.style.opacity = 1; if (auto) play(); };
      if (!auto && move) { move.cancel(); move = null; }
      bg.src = 'assets/works/' + w[1] + '.jpg'; bg.alt = w[0];
      q('.hp-k').textContent = w[2]; q('.hp-t').textContent = w[0]; q('.hp-d').textContent = w[3]; q('.hp-btn').href = href(k);
    }, 250);
  }
  // the slideshow: the painting moves for 3.5s, fades, and the next one comes up and moves in turn
  function play() {
    const bg = q('.hp-bg'); if (!bg || !auto) return;
    const [s0, s1, a, b] = MOVES[moveN++ % MOVES.length];
    if (move) move.cancel();
    if (!CALM.matches && bg.animate) move = bg.animate([{ transform: 'scale(' + s0 + ') translate(' + a[0] + '%, ' + a[1] + '%)' }, { transform: 'scale(' + s1 + ') translate(' + b[0] + '%, ' + b[1] + '%)' }], { duration: MOVE_MS, easing: 'cubic-bezier(0.37, 0, 0.63, 1)', fill: 'forwards' });
    clearTimeout(nextT); nextT = setTimeout(() => { if (auto) pick(cur + 1); }, MOVE_MS - FADE_MS / 2);
  }
  function stop() { stopped = true; if (!auto) return; auto = false; clearTimeout(nextT); if (move) move.pause(); }
  // the intro, timed as on desktop (index.html): the tree in from 0.15s, away from 3.55s, the wordmark in from 5.15s, away from
  // 11.15s. A tap, swipe or key cuts it short (a quicker fade)
  let iT = [], inIntro = false, stopped = false;
  function intro() {
    if (!q('.hp')) return; inIntro = true;
    const at = (ms, f) => iT.push(setTimeout(() => { const n = q('.hp'); if (n) f(n); }, ms));
    at(150, n => n.classList.add('i-tree')); at(3550, n => n.classList.remove('i-tree'));
    at(5150, n => n.classList.add('i-mark')); at(11150, n => { n.classList.remove('i-mark'); if (!FLOW && !stopped) { auto = true; play(); } }); at(13000, () => { inIntro = false; });
  }
  function endIntro() {
    if (!inIntro) return; inIntro = false; iT.forEach(clearTimeout); iT = [];
    const p = q('.hp'); if (p) { p.classList.add('i-skip'); p.classList.remove('i-tree', 'i-mark'); }
  }
  // a tap: the type, then the arrows; both away after 2s (counted again from each tap)
  let rvT = [];
  function reveal() {
    const p = q('.hp'); if (!p) return; endIntro(); rvT.forEach(clearTimeout); clearTimeout(arT);
    p.classList.add('tx-on');
    rvT = [setTimeout(() => p.classList.add('arr-on'), ARROW_LAG), setTimeout(() => p.classList.remove('tx-on', 'arr-on'), TAP_MS)];
  }
  // first showing: once the painting is in. The page rebuilds its markup after it loads, so this looks for the panel afresh
  // every 100ms (for up to 15s) rather than holding on to the first copy it finds
  let tries = 0;
  function start() {
    if (started || !MQ.matches) return;
    const bg = q('.hp-bg');
    if (bg && bg.complete && bg.naturalWidth && bg.getBoundingClientRect().width) { started = true; if (FLOW) q('.hp').classList.add('flow'); strip(); intro(); return; }
    if (++tries < 150) setTimeout(start, 100);
  }
  start(); MQ.addEventListener('change', () => { tries = 0; start(); });
  const menu = () => { const n = q('nav[data-screen-label="Mobile menu"]'); document.documentElement.classList.toggle('hp-menu', !!n && n.style.visibility === 'visible'); };
  document.addEventListener('click', e => {
    setTimeout(menu, 30);
    const t = e.target.closest ? e.target : null; if (!t || !t.closest('.hp')) return;
    const b = t.closest('.hp-strip button'); if (b) { stop(); endIntro(); return pick(cur + +b.dataset.slot); }
    if (t.closest('.hp-strip')) return;
    const a = t.closest('.hp-arr'); if (a) { stop(); pick(cur + (a.classList.contains('next') ? 1 : -1)); return reveal(); }
    if (t.closest('a')) return;   // the "View this work" link goes there itself
    stop(); reveal();
  });
  document.addEventListener('keydown', () => setTimeout(menu, 30));
  addEventListener('resize', () => setTimeout(menu, 30), { passive: true });
  document.addEventListener('touchstart', e => {
    const inside = e.target.closest && e.target.closest('.hp') && !e.target.closest('.hp-strip, .hp-arr');
    x0 = inside ? e.touches[0].clientX : null; y0 = inside ? e.touches[0].clientY : null; warm();
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { stop(); endIntro(); pick(cur + (dx < 0 ? 1 : -1)); showArrows(); }
  }, { passive: true });
  // the footer, with a mouse: as footer-peek.js does on desktop, but the page itself slides up (so the thumbnails rise with the
  // footer) after the pointer rests in the bottom 20px for 1.5s, and back down once it moves above the footer
  let fT = 0, fUp = false;
  addEventListener('mousemove', e => {
    if (!MQ.matches || !q('.hp')) return;
    const max = document.documentElement.scrollHeight - innerHeight, f = q('footer'); if (max < 10 || !f) return;
    if (e.clientY >= innerHeight - 20) { if (!fUp && !fT) fT = setTimeout(() => { fT = 0; fUp = true; scrollTo({ top: max, behavior: 'smooth' }); }, FOOT_HOLD); }
    else { clearTimeout(fT); fT = 0; if (fUp && e.clientY < innerHeight - f.offsetHeight - 10) { fUp = false; scrollTo({ top: 0, behavior: 'smooth' }); } }
  }, { passive: true });
  document.addEventListener('mouseleave', () => { clearTimeout(fT); fT = 0; });
  // Flow: the first touch, click, scroll or key press stops the drift for good
  const still = () => { const p = q('.hp.flow'); if (p) p.classList.add('still'); };
  ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(ev => addEventListener(ev, still, { passive: true, capture: true }));
  // the menu's trial link: to Panels Flow, or back to the plain panel while on Flow
  const flowLink = () => { const a = q('a[data-flow-link]'); if (a && FLOW) { a.href = 'index.html'; a.textContent = 'Home: Panels (test)'; } };
  document.addEventListener('click', () => setTimeout(flowLink, 0), true);
  addEventListener('load', () => setTimeout(warm, 1500));
})();
