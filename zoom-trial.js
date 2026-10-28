/* Zoom trial (2026-10-28; loaded only by Gallery-zoom.dc.html, a copy of the detail and buy pages): enlarging a work the way
   patagonia.com's product pages do. Over the artwork (the detail page's image, the buy page's print) the pointer becomes a dark
   round "+". A click opens a full-screen pale view with the work's three framing views side by side (unframed, white frame,
   black frame), each as tall as the screen allows, starting on the view that was showing; the wheel, a swipe or the round
   arrows at the bottom left move between them, and the round x at the top right (or Esc) closes it. Clicking a view enlarges
   it (2.4 times, up to the image's own resolution) with the point that was clicked kept under the pointer; the pointer becomes
   a "-", the wheel or a drag moves around the enlarged work, and a click (or Esc) goes back to the three views. The magnify icon
   under the detail image opens the same view. The pages' own zoom view and framing lightbox are left out here. */
(function () {
  const VIEWS = [['none', 'Unframed'], ['white', 'White frame'], ['black', 'Black frame']];
  const MARGIN = 48, GAP = 64, ZOOM = 2.4;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  const css = document.createElement('style');
  css.textContent = `
.detail-img img, .print-car [role=button], .print-car [role=button] img { cursor: none !important; }
html:not(.pz-fine) .detail-img img, html:not(.pz-fine) .print-car [role=button] { cursor: zoom-in !important; }
.pz { position: fixed; inset: 0; z-index: 200; background: #F1F0EC; opacity: 0; transition: opacity 0.35s ease; cursor: none; }
html:not(.pz-fine) .pz { cursor: auto; }
.pz.on { opacity: 1; }
.pz-row { position: absolute; inset: 0; display: flex; align-items: center; gap: ${GAP}px; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior: contain; }
.pz-row::-webkit-scrollbar, .pz-zoom::-webkit-scrollbar { display: none; }
.pz-row::before, .pz-row::after { content: ''; flex: none; width: 1px; }
.pz-item { flex: none; scroll-snap-align: center; box-sizing: border-box; display: block; box-shadow: 0 10px 40px rgba(20,20,20,0.22); }
.pz-zoom { position: absolute; inset: 0; overflow: auto; scrollbar-width: none; overscroll-behavior: contain; display: none; }
.pz.zoomed .pz-row { visibility: hidden; }
.pz.zoomed .pz-zoom { display: block; }
.pz-zoom .pz-item { margin: ${MARGIN}px; box-shadow: none; }
.pz-zoom.dragging { user-select: none; }
.pz button { position: absolute; z-index: 2; width: 44px; height: 44px; border-radius: 50%; border: none; padding: 0; background: #FFFFFF; color: #141414; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 6px rgba(20,20,20,0.12); transition: background 0.2s ease, opacity 0.3s ease; }
.pz button:hover { background: #E7E4DE; }
.pz button svg { width: 16px; height: 16px; }
.pz-close { top: 24px; right: 24px; }
.pz-prev { left: 24px; bottom: 24px; } .pz-next { left: 78px; bottom: 24px; }
.pz.zoomed .pz-prev, .pz.zoomed .pz-next { opacity: 0; pointer-events: none; }
.pz-count { position: absolute; left: 136px; bottom: 37px; z-index: 2; margin: 0; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6E6B66; transition: opacity 0.3s ease; }
.pz.zoomed .pz-count { opacity: 0; }
.pz-cursor { position: fixed; left: 0; top: 0; z-index: 210; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: rgba(20,20,20,0.86); color: #FFFFFF; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0; transform: scale(0.6); transition: opacity 0.2s ease, transform 0.2s ease; }
.pz-cursor.show { opacity: 1; transform: scale(1); }
.pz-cursor svg { width: 14px; height: 14px; }
`;
  document.head.appendChild(css);
  const sync = () => document.documentElement.classList.toggle('pz-fine', fine.matches);
  sync(); fine.addEventListener('change', sync);

  const PLUS = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 1v12M1 7h12"/></svg>';
  const MINUS = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 7h12"/></svg>';
  const cursor = document.createElement('div');
  cursor.className = 'pz-cursor'; cursor.setAttribute('aria-hidden', 'true'); cursor.innerHTML = PLUS;
  document.body.appendChild(cursor);
  let mx = -100, my = -100, cursorSign = '+';
  function setSign(sign) { if (sign !== cursorSign) { cursorSign = sign; cursor.innerHTML = sign === '+' ? PLUS : MINUS; } }

  // the artwork on the page: the detail page's image or the buy page's print
  const pageTarget = el => el && el.closest && (el.closest('.detail-img img') || el.closest('.print-car [role=button]'));
  const onArt = el => el && el.closest && el.closest('.pz-item');

  let pz = null, row = null, zoomBox = null, count = null, current = 0, ratio = 1.5, src = '';

  function frameStyle(img, f, w) {
    const b = f === 'none' ? 0 : Math.round(w * 0.028), p = f === 'none' ? 0 : Math.round(w * 0.04);
    img.style.border = b + 'px solid ' + (f === 'white' ? '#FFFFFF' : '#141414');
    img.style.padding = p + 'px';
    img.style.background = f === 'none' ? 'transparent' : '#FBFAF7';
    img.style.width = w + 'px';
    img.style.height = 'auto';
    if (f !== 'none') img.style.outline = '1px solid rgba(20,20,20,0.12)';
  }
  // each view as tall as the screen allows (less the margin), never wider than the screen less room for its neighbours to show
  function rowWidth() {
    const h = innerHeight - 2 * MARGIN, w = innerWidth - 2 * 120;
    return Math.round(Math.min(h * ratio, w));
  }
  function layoutRow() {
    const w = rowWidth();
    row.querySelectorAll('.pz-item').forEach((img, i) => frameStyle(img, VIEWS[i][0], w));
    const pad = Math.max(0, (innerWidth - w) / 2 - GAP);
    row.style.paddingLeft = row.style.paddingRight = pad + 'px';
  }
  function show(i, smooth) {
    current = (i + VIEWS.length) % VIEWS.length;
    const item = row.querySelectorAll('.pz-item')[current];
    row.scrollTo({ left: item.offsetLeft - (innerWidth - item.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    count.textContent = (current + 1) + ' / ' + VIEWS.length + ' · ' + VIEWS[current][1];
  }

  function open(img, view) {
    src = img.currentSrc || img.src;
    ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5;
    const alt = img.alt || '';
    pz = document.createElement('div');
    pz.className = 'pz'; pz.setAttribute('role', 'dialog'); pz.setAttribute('aria-modal', 'true'); pz.setAttribute('aria-label', (alt ? alt + ', ' : '') + 'enlarged');
    pz.innerHTML = '<div class="pz-row"></div><div class="pz-zoom"></div>'
      + '<button class="pz-close" aria-label="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m2 2 12 12M14 2 2 14"/></svg></button>'
      + '<button class="pz-prev" aria-label="Previous view"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2 4 8l6 6"/></svg></button>'
      + '<button class="pz-next" aria-label="Next view"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 2 6 6-6 6"/></svg></button>'
      + '<p class="pz-count" aria-live="polite"></p>';
    row = pz.querySelector('.pz-row'); zoomBox = pz.querySelector('.pz-zoom'); count = pz.querySelector('.pz-count');
    VIEWS.forEach(([f, label]) => {
      const im = document.createElement('img');
      im.className = 'pz-item'; im.src = src; im.alt = alt + (alt ? ', ' : '') + label.toLowerCase(); im.draggable = false;
      row.appendChild(im);
    });
    document.body.appendChild(pz);
    document.documentElement.style.overflow = 'hidden';
    layoutRow(); show(view, false);
    requestAnimationFrame(() => pz.classList.add('on'));
    pz.querySelector('.pz-close').addEventListener('click', close);
    pz.querySelector('.pz-prev').addEventListener('click', () => show(current - 1, true));
    pz.querySelector('.pz-next').addEventListener('click', () => show(current + 1, true));
    row.addEventListener('scroll', () => {   // (a swipe or trackpad scroll settles on a view: keep the count in step)
      clearTimeout(row._t); row._t = setTimeout(() => {
        const mid = row.scrollLeft + innerWidth / 2;
        const items = [...row.querySelectorAll('.pz-item')];
        const k = items.reduce((b, it, j) => Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid) < Math.abs(items[b].offsetLeft + items[b].offsetWidth / 2 - mid) ? j : b, 0);
        if (k !== current) { current = k; count.textContent = (current + 1) + ' / ' + VIEWS.length + ' · ' + VIEWS[current][1]; }
      }, 120);
    }, { passive: true });
    row.addEventListener('click', e => { const it = onArt(e.target); if (it) zoomIn(it, e); });
    zoomBox.addEventListener('pointerdown', dragStart);
    pz.addEventListener('mousemove', track);
  }

  function close() {
    if (!pz) return;
    const el = pz; pz = null;
    el.classList.remove('on'); cursor.classList.remove('show');
    document.documentElement.style.overflow = '';
    setTimeout(() => el.remove(), 350);
  }

  // enlarge one view, the clicked point kept under the pointer
  function zoomIn(item, e) {
    const i = [...row.querySelectorAll('.pz-item')].indexOf(item);
    const r = item.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    const natural = item.naturalWidth || 3200;
    const w = Math.round(Math.min(r.width * ZOOM, natural * 1.15));
    zoomBox.innerHTML = '';
    const big = document.createElement('img');
    big.className = 'pz-item'; big.src = src; big.alt = item.alt; big.draggable = false;
    frameStyle(big, VIEWS[i][0], w);
    zoomBox.appendChild(big);
    pz.classList.add('zoomed'); setSign('-');
    // centred when it fits that way, else scrolled so the clicked point stays put
    big.style.marginLeft = big.style.marginRight = Math.max(MARGIN, (innerWidth - w) / 2) + 'px';
    big.style.marginTop = big.style.marginBottom = Math.max(MARGIN, (innerHeight - big.offsetHeight) / 2) + 'px';
    zoomBox.scrollLeft = Math.max(0, big.offsetLeft + fx * w - e.clientX);
    zoomBox.scrollTop = Math.max(0, big.offsetTop + fy * big.offsetHeight - e.clientY);
  }
  function zoomOut() {
    pz.classList.remove('zoomed'); zoomBox.innerHTML = ''; setSign('+');
  }

  // dragging moves around the enlarged work; a click without a drag goes back to the views
  let drag = null;
  function dragStart(e) {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, l: zoomBox.scrollLeft, t: zoomBox.scrollTop, moved: false };
    zoomBox.setPointerCapture(e.pointerId);
    const move = ev => {
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) { drag.moved = true; zoomBox.classList.add('dragging'); }
      if (drag.moved) { zoomBox.scrollLeft = drag.l - dx; zoomBox.scrollTop = drag.t - dy; }
      track(ev);
    };
    const up = () => {
      zoomBox.removeEventListener('pointermove', move); zoomBox.removeEventListener('pointerup', up); zoomBox.removeEventListener('pointercancel', up);
      zoomBox.classList.remove('dragging');
      const wasDrag = drag && drag.moved; drag = null;
      if (!wasDrag && pz) zoomOut();
    };
    zoomBox.addEventListener('pointermove', move); zoomBox.addEventListener('pointerup', up); zoomBox.addEventListener('pointercancel', up);
  }

  // the round cursor follows the pointer over the artwork, on the page and in the enlarged view
  function track(e) {
    mx = e.clientX; my = e.clientY;
    if (!fine.matches) return;
    cursor.style.transform = '';
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    const el = document.elementFromPoint(mx, my);
    const overButton = el && el.closest && el.closest('.pz button');
    const show = pz ? !overButton && (pz.classList.contains('zoomed') || onArt(el)) : !!pageTarget(el);
    if (!pz) setSign('+');
    cursor.classList.toggle('show', !!show);
  }
  document.addEventListener('mousemove', e => { if (!pz) track(e); }, { passive: true });
  document.addEventListener('scroll', () => { if (!pz && fine.matches) { const el = document.elementFromPoint(mx, my); cursor.classList.toggle('show', !!pageTarget(el)); } }, { passive: true });

  // which framing view the page is showing (read from the image's own frame)
  function viewOf(img) {
    const cs = getComputedStyle(img);
    if (!parseFloat(cs.borderTopWidth)) return 0;
    return /255, 255, 255/.test(cs.borderTopColor) ? 1 : 2;
  }
  // a click on the artwork (or the magnify icon) opens the view instead of the page's own zoom or lightbox
  document.addEventListener('click', e => {
    if (pz) return;
    const t = pageTarget(e.target), mag = e.target.closest && e.target.closest('.detail-img button');
    if (!t && !mag) return;
    const img = t ? (t.tagName === 'IMG' ? t : t.querySelector('img')) : document.querySelector('.detail-img img');
    if (!img) return;
    e.preventDefault(); e.stopPropagation();
    open(img, viewOf(img));
  }, true);
  document.addEventListener('dblclick', e => { if (pageTarget(e.target)) { e.preventDefault(); e.stopPropagation(); } }, true);
  addEventListener('keydown', e => {
    if (!pz) return;
    if (e.key === 'Escape') { e.stopPropagation(); pz.classList.contains('zoomed') ? zoomOut() : close(); }
    else if (!pz.classList.contains('zoomed') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.stopPropagation(); show(current + (e.key === 'ArrowRight' ? 1 : -1), true); }
  }, true);
  // the wheel, while the view is open, is the view's alone (the page's own wheel handling never sees it): over the three views it
  // moves between them (one per gesture), as the arrows do; enlarged, it scrolls the work
  let wheelAt = 0;
  addEventListener('wheel', e => {
    if (!pz) return;
    e.stopPropagation();
    if (e.ctrlKey) { e.preventDefault(); return; }
    e.preventDefault();
    if (pz.classList.contains('zoomed')) {   // (scrolled here, as the page's own handler cancels the native scroll)
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1;
      zoomBox.scrollBy({ left: (e.shiftKey ? e.deltaY : e.deltaX) * unit, top: (e.shiftKey ? 0 : e.deltaY) * unit });
      return;
    }
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 4 || performance.now() - wheelAt < 600) return;
    wheelAt = performance.now(); show(current + (d > 0 ? 1 : -1), true);
  }, { capture: true, passive: false });
  addEventListener('resize', () => { if (pz && !pz.classList.contains('zoomed')) { layoutRow(); show(current, false); } });
})();
