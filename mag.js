// Magnify trials (since 2026-11-08, Grace): four ways to enlarge the buy page's print, on test pages mag1-mag4 (copies of
// Gallery.dc.html opened on Ascent, Koi). The page's tag says which: <script src="mag.js" data-mag="1|2|3|4">.
//   1  Spread (after Patagonia): every framing view side by side at full height; click one to fill the screen's width, scroll down it
//   2  Viewer (after Ray-Ban): one view at a time, counter, side arrows, progress bar; click to zoom 2.5x, the picture follows the mouse
//   3  Loupe: a round magnifying glass that follows the mouse over the print on the buy page itself; scroll to change its strength
//   4  Museum: deep zoom with a zoom slider, an overview map of where you are, and the views down the left
// The buy page hands over its framing views (window.AE_VIEWS: label, picture, drawn frame colour) and a way to choose one
// (window.AE_PICK), so a view chosen here is the frame chosen on the page. Plain JS and CSS, no libraries (Shopify-ready).
(function () {
  const me = document.currentScript || document.querySelector('script[data-mag]');
  const MODE = me ? me.getAttribute('data-mag') : '2';
  const FRAME = { white: '#FFFFFF', wood: '#BB8958', black: '#141414' };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const views = () => window.AE_VIEWS || [];
  const pick = i => { if (window.AE_PICK) window.AE_PICK(i); };
  const CHEV_L = '<svg viewBox="0 0 19 53" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M18 1 1 26.5 18 52"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 19 53" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1 1 17 25.5L1 52"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 4l16 16M20 4 4 20"/></svg>';
  // a view as an element: the photograph as it is, or the work with its frame drawn round it
  function picture(v, cls) {
    const img = el('img', cls); img.src = v.src; img.alt = v.alt || v.label; img.draggable = false;
    if (v.frame && FRAME[v.frame]) { img.style.border = '16px solid ' + FRAME[v.frame]; img.style.padding = '22px'; img.style.background = '#FBFAF7'; img.style.boxSizing = 'border-box'; img.style.boxShadow = '0 0 0 1px rgba(20,20,20,0.12), 0 6px 24px rgba(20,20,20,0.2)'; }
    else if (!v.photo) img.style.boxShadow = '0 6px 24px rgba(20,20,20,0.2)';
    return img;
  }
  let open = null;   // the open overlay's close function
  function overlay(cls) {
    const o = el('div', 'mag-ov ' + cls); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Enlarged views');
    document.body.appendChild(o); document.documentElement.classList.add('mag-lock');
    o.addEventListener('wheel', e => e.stopPropagation());   // the buy page's own smooth scrolling (a window wheel listener) stays out of the overlay
    requestAnimationFrame(() => o.classList.add('in'));
    return o;
  }
  function shut(o, onKey) {
    o.classList.remove('in'); document.documentElement.classList.remove('mag-lock');
    removeEventListener('keydown', onKey, true); setTimeout(() => o.remove(), 250); open = null;
  }

  // ---------- 1: Spread (Patagonia) ----------
  function spread(start) {
    const o = overlay('mag-spread'), track = el('div', 'ms-track'); o.appendChild(track);
    const vs = views(); let zoomed = -1, cur = start;
    const slides = vs.map((v, i) => { const s = el('div', 'ms-slide' + (v.photo ? ' photo' : '')); s.appendChild(picture(v, 'ms-img')); s.addEventListener('click', e => toggle(i, e)); track.appendChild(s); return s; });
    const cursor = el('div', 'ms-cursor', '<span></span>'); o.appendChild(cursor);
    const ctl = el('div', 'ms-ctl'); const bPrev = el('button', 'ms-b', CHEV_L), bNext = el('button', 'ms-b', CHEV_R), bZoom = el('button', 'ms-b ms-z', '<span></span>');
    bPrev.setAttribute('aria-label', 'Previous view'); bNext.setAttribute('aria-label', 'Next view'); bZoom.setAttribute('aria-label', 'Zoom');
    ctl.append(bPrev, bNext, bZoom); o.appendChild(ctl);
    const close = el('button', 'mag-close', CLOSE); close.setAttribute('aria-label', 'Close'); o.appendChild(close);
    const centre = (i, smooth) => { const s = slides[i]; track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' }); };
    function go(i) { cur = (i + vs.length) % vs.length; pick(cur); if (zoomed >= 0) { toggle(zoomed); } centre(cur, true); }
    function toggle(i, e) {
      if (zoomed < 0) {   // zoom in: that view as wide as the screen, scrolled so the point clicked stays under the cursor
        const img = slides[i].querySelector('img'), r = img.getBoundingClientRect(), fy = e ? (e.clientY - r.top) / r.height : 0.5;
        zoomed = cur = i; pick(i); o.classList.add('zoomed'); slides.forEach((s, k) => s.classList.toggle('on', k === i));
        requestAnimationFrame(() => { const im = slides[i].querySelector('img'); o.scrollTop = Math.max(0, im.offsetTop + im.offsetHeight * fy - (e ? e.clientY : innerHeight / 2)); });
      } else { zoomed = -1; o.classList.remove('zoomed'); slides.forEach(s => s.classList.remove('on')); o.scrollTop = 0; requestAnimationFrame(() => centre(cur)); }
    }
    o.addEventListener('mousemove', e => { cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; cursor.classList.toggle('hide', !!e.target.closest('button')); });
    o.addEventListener('mouseleave', () => cursor.classList.add('hide'));
    track.addEventListener('wheel', e => { if (zoomed < 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { track.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
    bPrev.onclick = () => go(cur - 1); bNext.onclick = () => go(cur + 1); bZoom.onclick = () => toggle(cur);
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); zoomed >= 0 ? toggle(zoomed) : shut(o, onKey); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.stopPropagation(); go(cur + (e.key === 'ArrowRight' ? 1 : -1)); } };
    addEventListener('keydown', onKey, true); close.onclick = () => shut(o, onKey);
    requestAnimationFrame(() => centre(cur)); return () => shut(o, onKey);
  }

  // ---------- 2: Viewer (Ray-Ban) ----------
  function viewer(start) {
    const o = overlay('mag-viewer'), vs = views(); let cur = start, z = false;
    const stage = el('div', 'mv-stage'), count = el('div', 'mv-count'), bar = el('div', 'mv-bar');
    const prev = el('button', 'mv-arrow l', CHEV_L), next = el('button', 'mv-arrow r', CHEV_R), close = el('button', 'mag-close', CLOSE);
    prev.setAttribute('aria-label', 'Previous view'); next.setAttribute('aria-label', 'Next view'); close.setAttribute('aria-label', 'Close');
    const segs = vs.map((v, i) => { const s = el('button', 'mv-seg'); s.setAttribute('aria-label', v.label); s.onclick = () => show(i); bar.appendChild(s); return s; });
    o.append(stage, count, prev, next, bar, close);
    let img = null;
    function show(i) {
      cur = (i + vs.length) % vs.length; pick(cur); z = false; o.classList.remove('zoomed');
      stage.innerHTML = ''; img = picture(vs[cur], 'mv-img'); stage.appendChild(img);
      count.textContent = (cur + 1) + ' / ' + vs.length + '  ·  ' + vs[cur].label;
      segs.forEach((s, k) => s.classList.toggle('on', k === cur));
    }
    function pan(e) {   // zoomed: the picture follows the mouse (the cursor at an edge shows that edge)
      if (!z || !img) return;
      const k = 2.5, w = img.offsetWidth * k, h = img.offsetHeight * k, fx = e.clientX / innerWidth, fy = e.clientY / innerHeight;
      const x = Math.min(0, Math.max(innerWidth - w, (innerWidth - w) * fx)), y = Math.min(0, Math.max(innerHeight - h, (innerHeight - h) * fy));
      const bx = w < innerWidth ? (innerWidth - w) / 2 : x, by = h < innerHeight ? (innerHeight - h) / 2 : y;
      img.style.transform = 'translate(' + (bx - img.offsetLeft) + 'px,' + (by - img.offsetTop) + 'px) scale(' + k + ')';
    }
    stage.addEventListener('click', e => { if (!img) return; z = !z; o.classList.toggle('zoomed', z); if (z) pan(e); else img.style.transform = ''; });
    o.addEventListener('mousemove', pan);
    prev.onclick = () => show(cur - 1); next.onclick = () => show(cur + 1);
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); if (z) { z = false; o.classList.remove('zoomed'); img.style.transform = ''; } else shut(o, onKey); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.stopPropagation(); show(cur + (e.key === 'ArrowRight' ? 1 : -1)); } };
    addEventListener('keydown', onKey, true); close.onclick = () => shut(o, onKey);
    show(cur); return () => shut(o, onKey);
  }

  // ---------- 3: Loupe ----------
  // (2026-11-09, fixes) the glass follows the picture as drawn, not the image element: a framed photograph's element fills the
  // whole wall with empty bands beside the photograph, where the glass used to vanish with the pointer hidden. The pointer hides
  // only while the glass shows; the glass is drawn once a frame (no work between moves), its strength eases to the wheel's (a
  // trackpad's many small wheel steps no longer jump it), and it closes when the pointer leaves the window or the page scrolls.
  function loupe() {
    const lens = el('div', 'mag-lens'); document.body.appendChild(lens);
    const hint = el('div', 'mag-hint', 'Hover to magnify · scroll to change the strength');
    const root = document.documentElement;
    let mx = -1, my = -1, inWin = false, power = 3, want = 3, shown = false, bg = '', raf = 0, parked = false;
    const loaded = new Set();   // pictures already in the browser, so a change of view is instant
    const preload = src => { if (!src || loaded.has(src)) return; const im = new Image(); im.onload = () => { loaded.add(src); kick(); }; im.src = src; if (im.complete && im.naturalWidth) loaded.add(src); };
    const wallOf = () => document.querySelector('[aria-label="View framing options"]');
    function hide() { if (shown) { shown = false; lens.classList.remove('on'); root.classList.remove('mag-loupe-on'); } }
    // the picture's drawn box on screen (inside any drawn frame and mount, and inside object-fit's bands)
    function drawn(img) {
      const cs = getComputedStyle(img), r = img.getBoundingClientRect();
      const l = parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), t = parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop);
      const cw = r.width - l - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight), ch = r.height - t - parseFloat(cs.borderBottomWidth) - parseFloat(cs.paddingBottom);
      let w = cw, h = ch, ox = 0, oy = 0; const nr = img.naturalWidth / img.naturalHeight;
      if ((cs.objectFit === 'contain' || cs.objectFit === 'scale-down') && nr) { if (cw / ch > nr) { w = ch * nr; ox = (cw - w) / 2; } else { h = cw / nr; oy = (ch - h) / 2; } }
      return { x: r.left + l + ox, y: r.top + t + oy, w, h };
    }
    function frame() {
      raf = 0;
      const wall = wallOf(), img = wall && wall.querySelector('img');
      if (!inWin || !img || !img.naturalWidth) return hide();
      const b = drawn(img), x = mx - b.x, y = my - b.y;
      const over = document.elementFromPoint(mx, my);
      if (x < 0 || y < 0 || x > b.w || y > b.h || !over || !wall.contains(over) || over.closest('button')) { parked = false; return hide(); }   // (leaving the picture ends an Esc)
      if (parked) return hide();   // put away with Esc: back when the pointer next comes onto the picture
      const src = img.currentSrc || img.src;
      (window.AE_VIEWS || []).forEach(v => preload(v.src)); preload(src);
      if (src !== bg) {   // another view chosen (swatch, dot or arrow key): the glass swaps to it at once if it is loaded, else keeps
        if (loaded.has(src)) { bg = src; lens.style.backgroundImage = 'url("' + src + '")'; }   // the last picture until it is
        else if (!bg) return hide();
      }
      power += (want - power) * 0.25; if (Math.abs(want - power) < 0.005) power = want;
      const d = lens.offsetWidth;
      lens.style.backgroundSize = (b.w * power).toFixed(1) + 'px ' + (b.h * power).toFixed(1) + 'px';
      lens.style.backgroundPosition = (d / 2 - x * power).toFixed(1) + 'px ' + (d / 2 - y * power).toFixed(1) + 'px';
      lens.style.transform = 'translate3d(' + (mx - d / 2).toFixed(1) + 'px,' + (my - d / 2).toFixed(1) + 'px,0)';
      if (!shown) { shown = true; lens.classList.add('on'); root.classList.add('mag-loupe-on'); }
      if (power !== want) kick();   // still easing to the wheel's strength
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mx = e.clientX; my = e.clientY; inWin = true; kick(); }, { passive: true });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) { inWin = false; hide(); } });   // the pointer left the window
    addEventListener('blur', () => { inWin = false; hide(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
    addEventListener('scroll', () => { hide(); kick(); }, { passive: true });
    addEventListener('resize', kick);
    // (2026-11-09) arrow keys change the view with the glass up (the buy page steps its carousel): redraw at once, without a move;
    // Esc puts the glass away (the state before magnifying) until the pointer leaves the picture and comes back
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && shown) { parked = true; hide(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') requestAnimationFrame(kick);
    }, true);
    new MutationObserver(kick).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'style'] });
    // the wheel sets the strength (1.5x to 8x) while the glass shows, ahead of the page's own smooth scrolling; elsewhere it scrolls
    addEventListener('wheel', e => {
      if (!shown) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      want = Math.max(1.5, Math.min(8, want * Math.exp(-dy * 0.004))); kick();
    }, { passive: false, capture: true });
    // the hint under the print, once the buy page has drawn it
    setInterval(() => { const w = wallOf(); if (w && !w.parentNode.querySelector('.mag-hint')) w.insertAdjacentElement('afterend', hint); }, 300);
    return null;   // a click still opens the page's own enlarged view
  }

  // ---------- 4: Museum ----------
  function museum(start) {
    const o = overlay('mag-museum'), vs = views(); let cur = start, k = 1, fit = 1, tx = 0, ty = 0, img = null;
    const stage = el('div', 'mm-stage'), side = el('div', 'mm-side'), map = el('div', 'mm-map'), box = el('div', 'mm-box'), tools = el('div', 'mm-tools'), close = el('button', 'mag-close', CLOSE);
    close.setAttribute('aria-label', 'Close');
    const minus = el('button', 'mm-t', '−'), plus = el('button', 'mm-t', '+'), slider = el('input', 'mm-slider'), pct = el('span', 'mm-pct'), fitB = el('button', 'mm-t mm-fit', 'Fit');
    minus.setAttribute('aria-label', 'Zoom out'); plus.setAttribute('aria-label', 'Zoom in'); slider.type = 'range'; slider.min = 0; slider.max = 100; slider.setAttribute('aria-label', 'Zoom');
    tools.append(minus, slider, plus, pct, fitB);
    const thumbs = vs.map((v, i) => { const b = el('button', 'mm-thumb'); b.setAttribute('aria-label', v.label); b.appendChild(picture(Object.assign({}, v, { frame: v.frame }), '')); b.appendChild(el('span', '', v.label)); b.onclick = () => show(i); side.appendChild(b); return b; });
    const mapImg = el('img'); map.append(mapImg, box);
    o.append(stage, side, map, tools, close);
    let MAX = 6;   // up to 6 times the fitted size, or 2.5 times the picture's own pixels if that is less (set per view)
    function clamp() {
      const w = img.naturalWidth * fit * k, h = img.naturalHeight * fit * k, W = stage.clientWidth, H = stage.clientHeight;
      tx = w <= W ? (W - w) / 2 : Math.min(0, Math.max(W - w, tx)); ty = h <= H ? (H - h) / 2 : Math.min(0, Math.max(H - h, ty));
    }
    function draw() {
      if (!img || !img.naturalWidth) return; clamp();
      img.style.width = (img.naturalWidth * fit) + 'px'; img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')';
      slider.value = Math.round(Math.log(k) / Math.log(MAX) * 100); pct.textContent = Math.round(k * 100) + '%';
      const w = img.naturalWidth * fit * k, h = img.naturalHeight * fit * k, W = stage.clientWidth, H = stage.clientHeight;
      const mw = map.clientWidth, mh = mw * img.naturalHeight / img.naturalWidth; mapImg.style.height = mh + 'px';
      const l = Math.max(0, -tx / w), t = Math.max(0, -ty / h), rw = Math.min(1, W / w), rh = Math.min(1, H / h);
      box.style.left = (l * mw) + 'px'; box.style.top = (t * mh) + 'px'; box.style.width = (rw * mw) + 'px'; box.style.height = (rh * mh) + 'px';
      map.classList.toggle('show', k > 1.01);
    }
    function zoomAt(nk, cx, cy) {   // to zoom nk about the screen point (cx, cy) inside the stage
      nk = Math.max(1, Math.min(MAX, nk)); const r = stage.getBoundingClientRect(), px = (cx == null ? r.width / 2 : cx - r.left), py = (cy == null ? r.height / 2 : cy - r.top);
      tx = px - (px - tx) * nk / k; ty = py - (py - ty) * nk / k; k = nk; draw();
    }
    function show(i) {
      cur = (i + vs.length) % vs.length; pick(cur); k = 1; stage.innerHTML = '';
      const v = vs[cur]; img = picture(v, 'mm-img'); stage.appendChild(img); mapImg.src = v.src;
      thumbs.forEach((t, j) => t.classList.toggle('on', j === cur));
      const ready = () => { const W = stage.clientWidth - 80, H = stage.clientHeight - 80; fit = Math.min(W / img.naturalWidth, H / img.naturalHeight); MAX = Math.max(2, Math.min(6, 2.5 / fit)); tx = ty = 0; draw(); };
      img.complete && img.naturalWidth ? ready() : img.addEventListener('load', ready, { once: true });
    }
    stage.addEventListener('wheel', e => { e.preventDefault(); zoomAt(k * Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener('dblclick', e => zoomAt(k < MAX - 0.01 ? k * 2 : 1, e.clientX, e.clientY));
    let drag = null;
    stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx, ty }; stage.setPointerCapture(e.pointerId); stage.classList.add('drag'); });
    stage.addEventListener('pointermove', e => { if (!drag) return; tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; draw(); });
    stage.addEventListener('pointerup', () => { drag = null; stage.classList.remove('drag'); });
    const mapGo = e => { const r = map.getBoundingClientRect(), w = img.naturalWidth * fit * k, h = img.naturalHeight * fit * k; tx = stage.clientWidth / 2 - (e.clientX - r.left) / r.width * w; ty = stage.clientHeight / 2 - (e.clientY - r.top) / mapImg.offsetHeight * h; draw(); };
    let mdrag = false; map.addEventListener('pointerdown', e => { mdrag = true; map.setPointerCapture(e.pointerId); mapGo(e); }); map.addEventListener('pointermove', e => { if (mdrag) mapGo(e); }); map.addEventListener('pointerup', () => { mdrag = false; });
    slider.addEventListener('input', () => zoomAt(Math.pow(MAX, slider.value / 100)));
    minus.onclick = () => zoomAt(k / 1.5); plus.onclick = () => zoomAt(k * 1.5); fitB.onclick = () => zoomAt(1);
    const onResize = () => show(cur); addEventListener('resize', onResize);
    const onKey = e => { const t = e.key; if (t === 'Escape') { e.stopPropagation(); if (k > 1.01) zoomAt(1); else { removeEventListener('resize', onResize); shut(o, onKey); } } else if (t === 'ArrowUp' || t === 'ArrowDown') { e.stopPropagation(); e.preventDefault(); show(cur + (t === 'ArrowDown' ? 1 : -1)); } else if (t === 'ArrowLeft' || t === 'ArrowRight') { e.stopPropagation(); show(cur + (t === 'ArrowRight' ? 1 : -1)); } else if (t === '+' || t === '=') zoomAt(k * 1.5); else if (t === '-') zoomAt(k / 1.5); else if (t === '0') zoomAt(1); };
    addEventListener('keydown', onKey, true); close.onclick = () => { removeEventListener('resize', onResize); shut(o, onKey); };
    show(cur); return () => shut(o, onKey);
  }

  const OPEN = { 1: spread, 2: viewer, 4: museum }[MODE];
  if (MODE === '3') { document.documentElement.classList.add('mag3'); loupe(); }
  window.AE_MAG = OPEN ? { open: i => { if (open) return true; open = OPEN(Math.max(0, i || 0)); return true; } } : null;
})();
