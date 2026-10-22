// Alt text on the image's own frame (since 2026-10-20; the homepage carousel has its own version of the same treatment).
// An image carrying data-alt-title (an artwork's title) and / or data-alt-tag (its tagline, or a photograph's description)
// gets that text as its alt text ("Title: tagline"), the browser's own alt text is hidden, and the same words are set centred
// on the image's box: the title in EB Garamond italic capitals, a colon, the tagline in grey. They show (centred on the image's
// box) from the start until the image has loaded, and stay if it fails to load (since 2026-10-21; they waited 0.8s before), except
// over another image in the same box that is already showing (a crossfade), so they never flash over a picture. data-alt-size="s" sets them small
// (thumbnails). The box is the nearest ancestor marked data-alt-box, else the image's parent. On pages whose script tag
// carries data-auto, every image in <main> with alt text and no data-alt-* is treated as a photograph (its alt text shown).
(() => {
  const css = document.createElement('style');
  css.textContent = '.alt-cap { position: absolute; inset: 0; z-index: 1; margin: 0; padding: 0 12%; display: flex; align-items: center; justify-content: center; text-align: center; text-wrap: balance; font-size: calc(15px * var(--fs, 1)); line-height: 1.5; color: #6E6B66; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; }'
    + ' .alt-cap.on { opacity: 1; transition: opacity 0.4s ease; }'
    + ' .alt-cap em { font-family: "EB Garamond", serif; font-style: normal; font-size: calc(19px * var(--fs, 1)); letter-spacing: 0.1em; text-transform: uppercase; color: #141414; }'
    + ' .alt-cap.s { padding: 0 6%; font-size: calc(10px * var(--fs, 1)); line-height: 1.3; } .alt-cap.s em { font-size: calc(11px * var(--fs, 1)); letter-spacing: 0.06em; }';
  document.head.appendChild(css);
  const auto = document.currentScript && document.currentScript.hasAttribute('data-auto');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wants = img => img.hasAttribute('data-alt-title') || img.hasAttribute('data-alt-tag')
    || (auto && img.closest('main') && img.getAttribute('alt') && !img.hasAttribute('aria-hidden'));
  function setup(img) {
    const src = img.getAttribute('src');
    if (!src || !wants(img)) return;
    const title = img.getAttribute('data-alt-title') || '', tag = img.getAttribute('data-alt-tag') || (img.hasAttribute('data-alt-title') ? '' : img.getAttribute('alt') || '');
    const key = src + '|' + title + '|' + tag;
    if (img._altKey === key && img._altCap && img._altCap.isConnected) return;   // (a page that redraws may drop the caption: it is put back)
    if (img._altSrc !== src) { img._altSrc = src; img._altFailed = false; }
    img._altKey = key;
    if (title) img.setAttribute('alt', title + (tag ? ': ' + tag : ''));
    img.style.color = 'transparent';   // the browser's own alt text never shows
    const box = img.closest('[data-alt-box]') || img.parentElement;
    if (box.tagName === 'PICTURE') box.style.display = 'block';   // a <picture> becomes the image's frame
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    let cap = [...box.children].find(c => c.classList && c.classList.contains('alt-cap'));
    if (!cap) { cap = document.createElement('p'); cap.className = 'alt-cap'; cap.setAttribute('aria-hidden', 'true'); box.appendChild(cap); }
    cap.classList.toggle('s', img.getAttribute('data-alt-size') === 's');
    cap.innerHTML = '<span>' + (title ? '<em>' + esc(title) + '</em>' + (tag ? ': ' : '') : '') + esc(tag) + '</span>';
    cap._owner = img;
    // a box holding more than the image (a photo set straight into a grid beside its text, as on About): the words sit over the
    // image itself, kept on it as the layout changes
    const shared = [...box.children].some(c => c !== cap && c !== img && c.tagName !== 'SOURCE');
    const place = () => { if (shared && cap._owner === img) Object.assign(cap.style, { inset: 'auto', left: img.offsetLeft + 'px', top: img.offsetTop + 'px', width: img.offsetWidth + 'px', height: img.offsetHeight + 'px', boxSizing: 'border-box' }); };
    place();
    if (shared && !img._altRO) { img._altRO = new ResizeObserver(place); img._altRO.observe(img); }
    const failed = img._altFailed || /placeholder-(landscape|portrait)\.svg/.test(src);   // a page's own fallback picture stands in for a failed image
    const show = on => { if (cap._owner === img) cap.classList.toggle('on', on); };
    show(failed);
    img._altCap = cap;
    if (!img._altBound) {
      img._altBound = true;
      img.addEventListener('load', () => { img._altFailed = false; if (!/placeholder-(landscape|portrait)\.svg/.test(img.getAttribute('src') || '') && img._altCap && img._altCap._owner === img) img._altCap.classList.remove('on'); });
      img.addEventListener('error', () => { img._altFailed = true; if (img._altCap && img._altCap._owner === img) { img._altCap.classList.add('on'); if (!img.hasAttribute('data-alt-keep')) img.style.visibility = 'hidden'; } });
    }
    if (!img._altFailed) img.style.visibility = '';
    // not loaded yet: the words show at once, unless another image in the same box is already showing (a crossfade)
    const covered = () => { const r = img.getBoundingClientRect(); return [...box.querySelectorAll('img')].some(o => {   // a picture showing in the same place
      if (o === img || !(o.complete && o.naturalWidth) || parseFloat(getComputedStyle(o).opacity) <= 0.05) return false;
      const q = o.getBoundingClientRect(), w = Math.min(r.right, q.right) - Math.max(r.left, q.left), h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      return w > 0 && h > 0 && w * h > 0.5 * Math.max(1, r.width * r.height); }); };
    if (!failed && !(img.complete && img.naturalWidth) && !covered()) show(true);
  }
  const scan = root => { if (root.tagName === 'IMG') setup(root); else if (root.querySelectorAll) root.querySelectorAll('img').forEach(setup); };
  new MutationObserver(list => list.forEach(m => {
    if (m.type === 'attributes') setup(m.target);
    else { m.addedNodes.forEach(scan); m.removedNodes.forEach(n => { if (n._owner && n._owner.isConnected) setup(n._owner); }); }
  })).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'data-alt-title', 'data-alt-tag'] });
  scan(document.documentElement);
})();
