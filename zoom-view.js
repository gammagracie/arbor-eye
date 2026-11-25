// (since 2026-11-25, Grace) the shared zoom view: the artwork page's zoom (glass controls and the slider) for every other lightbox.
// ZoomView.open(items, i): items are { src, alt, video, poster, style (a frame, for the buy page's framing views) }; opens on item i at 2x, centred. Styles in zoom-view.css.
(function () {
  const IC = {
    prev: '<svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M11 1 3 9l8 8" stroke="currentColor" stroke-linecap="square"></path></svg>',
    next: '<svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="m5 17 8-8-8-8" stroke="currentColor" stroke-linecap="square"></path></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h14" stroke="currentColor"></path></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor"></path></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m1 1 14 14M1 15 15 1" stroke="currentColor"></path></svg>' };
  let box, bar, scale, dotsEl, xEl, useDots = false, startAt = 2, noScale = false, range, val, items = [], i = 0, level = 2, ratio = 1, back = null, pan = null, gBase = 1, mt = 0;
  const btn = (cls, label, ic) => '<button class="zv-btn ' + cls + '" aria-label="' + label + '"><span class="zv-ic">' + ic + '</span></button>';
  function build() {
    box = document.createElement('div'); box.className = 'zv'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    bar = document.createElement('div'); bar.className = 'zv-bar'; bar.hidden = true;
    // (since 2026-11-25, Grace) - and + either side of the X in place of previous / next: seven even zoom steps from 1x to 5x (the arrow keys still step between pictures)
    bar.innerHTML = btn('zout', 'Zoom out', IC.minus) + btn('xl', 'Close', IC.close) + btn('zin', 'Zoom in', IC.plus);
    scale = document.createElement('div'); scale.className = 'zv-scale'; scale.hidden = true;
    scale.innerHTML = '<button class="zv-sb" data-z="-1" aria-label="Zoom out"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M0 7h14" stroke="currentColor"></path></svg></button>' +
      '<input class="zv-range" type="range" min="1" max="5" step="0.05" aria-label="Zoom level">' +
      '<button class="zv-sb" data-z="1" aria-label="Zoom in"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0v14M0 7h14" stroke="currentColor"></path></svg></button><span class="zv-val"></span>';
    // (since 2026-11-25, Grace; the Index's Tree of Life) open(list, i, { dots: true }): Process's dots on a glass pill in place of
    // previous / next, and the close X at the top right
    dotsEl = document.createElement('div'); dotsEl.className = 'zv-dots'; dotsEl.hidden = true; dotsEl.innerHTML = '<div class="zv-pill"></div>';
    xEl = document.createElement('div'); xEl.className = 'zv-x'; xEl.hidden = true; xEl.innerHTML = btn('xl', 'Close', IC.close);
    document.body.append(box, bar, scale, dotsEl, xEl);
    xEl.querySelector('button').onclick = close;
    range = scale.querySelector('.zv-range'); val = scale.querySelector('.zv-val');
    const ST = 4 / 6;
    bar.querySelector('.zout').onclick = () => zoomMid(Math.max(1, 1 + (Math.ceil((level - 1) / ST - 0.001) - 1) * ST));
    bar.querySelector('.zin').onclick = () => zoomMid(Math.min(5, 1 + (Math.floor((level - 1) / ST + 0.001) + 1) * ST)); bar.querySelector('.xl').onclick = close;
    range.oninput = () => zoomMid(parseFloat(range.value));
    scale.querySelectorAll('.zv-sb').forEach(b => b.onclick = () => zoomMid(b.dataset.z > 0 ? Math.min(5, Math.floor(level * 2 + 0.001) / 2 + 0.5) : Math.max(1, Math.ceil(level * 2 - 0.001) / 2 - 0.5)));
    box.addEventListener('pointerdown', e => { if (e.button !== 0 || level <= 1 || !e.target.closest('img')) return; e.preventDefault(); pan = { x: e.clientX, y: e.clientY, l: box.scrollLeft, t: box.scrollTop }; box.classList.add('zv-drag'); });
    addEventListener('pointermove', e => { if (pan) { box.scrollLeft = pan.l - (e.clientX - pan.x); box.scrollTop = pan.t - (e.clientY - pan.y); moving(); } glint(e); }, { passive: true });
    addEventListener('pointerup', () => { pan = null; box.classList.remove('zv-drag'); still(); });
    addEventListener('wheel', e => { if (box.hidden || !(e.target.closest('.zv') || e.target.closest('.zv-scale'))) return; const el = media(); if (!el || el.tagName !== 'IMG') return;
      e.preventDefault(); const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 400 : 1), to = level * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.002));
      if (e.target.closest('.zv-scale')) zoomMid(to); else { zoomTo(to, e.clientX, e.clientY); moving(); } }, { passive: false });
    addEventListener('gesturestart', e => { if (!box.hidden) { e.preventDefault(); gBase = level; } }, { passive: false });
    addEventListener('gesturechange', e => { if (!box.hidden) { e.preventDefault(); zoomTo(gBase * e.scale, e.clientX, e.clientY); moving(); } }, { passive: false });
    box.addEventListener('scroll', () => { if (!pan) return; moving(); }, { passive: true });
    addEventListener('keydown', e => { if (box.hidden) return; if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); }, true);
  }
  // while the picture moves the controls step aside; they are back 140ms after the last movement
  const moving = () => { document.body.classList.add('zv-moving'); clearTimeout(mt); mt = setTimeout(still, 140); };
  const still = () => { clearTimeout(mt); document.body.classList.remove('zv-moving'); };
  const glint = e => { if (!box || box.hidden) return; document.querySelectorAll('.zv-bar .zv-btn, .zv-x .zv-btn, .zv-pill').forEach(el => put(el, e)); put(scale, e); };
  const put = (el, e) => { const b = el.getBoundingClientRect(); if (!b.width) return;
    el.style.setProperty('--gx', Math.max(-20, Math.min(120, (e.clientX - b.left) / b.width * 100)).toFixed(1) + '%');
    el.style.setProperty('--gy', Math.max(-40, Math.min(140, (e.clientY - b.top) / b.height * 100)).toFixed(1) + '%'); };
  const media = () => box.querySelector('img, video');
  const size = () => { const el = media(); if (el && el.tagName === 'IMG') el.style.width = 'calc(min(90vw, (100vh - 256px) * ' + ratio + ') * ' + level + ')';
    range.value = String(Math.round(level * 100) / 100); val.textContent = (Math.round(level * 10) / 10) + 'x'; };
  function zoomTo(to, cx, cy) {
    const el = media(); if (!el || el.tagName !== 'IMG') return; to = Math.max(1, Math.min(5, to)); if (Math.abs(to - level) < 0.001) return;
    const r = el.getBoundingClientRect(), fx = (cx - r.left) / r.width, fy = (cy - r.top) / r.height, b = box.getBoundingClientRect();
    level = to; size(); box.scrollLeft = el.offsetLeft + fx * el.offsetWidth - (cx - b.left); box.scrollTop = el.offsetTop + fy * el.offsetHeight - (cy - b.top);
  }
  function zoomMid(to) { const b = box.getBoundingClientRect(); zoomTo(to, b.left + b.width / 2, b.top + (b.height - 104) / 2); }
  function centre() { let n = 0; const go = () => { const el = media(); if (el && el.tagName === 'IMG' && el.complete && el.naturalWidth) { box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2; box.scrollTop = (box.scrollHeight - box.clientHeight) / 2; } if (++n < 12) requestAnimationFrame(go); }; requestAnimationFrame(go); }
  function show() {
    const it = items[i]; box.textContent = ''; level = startAt; box.setAttribute('aria-label', it.alt || 'Picture');
    let el;
    if (it.video) { el = document.createElement('video'); el.src = it.src; if (it.poster) el.poster = it.poster; el.autoplay = el.loop = el.muted = el.playsInline = true;
      el.style.cssText = 'width: auto; height: calc(100vh - 256px); max-width: 90vw'; scale.hidden = true; }
    else { el = document.createElement('img'); el.alt = it.alt || ''; el.draggable = false; scale.hidden = noScale; if (it.style) Object.assign(el.style, it.style);
      el.onload = () => { ratio = el.naturalWidth / el.naturalHeight; size(); centre(); }; el.src = it.src; }
    box.append(el); size(); centre();
    bar.querySelector('.zout').style.visibility = bar.querySelector('.zin').style.visibility = it.video ? 'hidden' : '';   // (a film does not zoom)
    if (useDots) { const pill = dotsEl.firstChild; pill.textContent = '';
      const ar = (d, lab, svg) => { const b = document.createElement('button'); b.className = 'dot-arrow'; b.setAttribute('aria-label', lab); b.innerHTML = svg; b.onclick = () => step(d); return b; };   // (since 2026-11-25) a thin chevron either side of the dots
      pill.append(ar(-1, 'Previous', '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1"><polyline points="6.5 0.5 0.5 6 6.5 11.5"></polyline></svg>'));
      items.forEach((_, k) => { const d = document.createElement('button'); d.className = 'zv-dot'; d.setAttribute('aria-label', 'Show ' + (k + 1) + ' of ' + items.length);
        if (k === i) d.setAttribute('aria-current', 'true'); d.onclick = () => { i = k; show(); }; pill.append(d); }); pill.append(ar(1, 'Next', '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1"><polyline points="0.5 0.5 6.5 6 0.5 11.5"></polyline></svg>')); }
  }
  function step(d) { i = (i + d + items.length) % items.length; show(); }
  function close() { box.hidden = bar.hidden = scale.hidden = dotsEl.hidden = xEl.hidden = true; box.textContent = ''; document.body.style.overflow = ''; still(); if (back && back.focus) back.focus(); }
  window.ZoomView = { open(list, k, opts) { if (!box) build(); items = list; i = k || 0; useDots = !!(opts && opts.dots) && list.length > 1; startAt = (opts && opts.start) || 2; noScale = !!(opts && opts.noScale); dotsEl.classList.toggle('zv-plain', !!(opts && opts.plainDots));   // (noScale: no slider; plainDots: Process's dots without the glass pill)   // (start: the level it opens at, 2x unless asked) back = document.activeElement;
    box.hidden = false; bar.hidden = useDots; dotsEl.hidden = xEl.hidden = !useDots; scale.classList.toggle('zv-low', useDots); document.body.style.overflow = 'hidden'; show();
    (useDots ? xEl : bar).querySelector('.xl').focus({ preventScroll: true }); } };
})();
