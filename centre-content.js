/* About and Contact, desktop (since 2026-10-28): each tab's content (photo, heading, copy, slides and their dots; on Contact the
   photograph or the open section) sits centred top to bottom between the bottom of the header and the top of the tab labels
   under it, so the space above the content equals the space below. The box and the tab row keep their places; the content is
   only shifted (CSS translate, so nothing else moves) by however much it takes, measured from what is actually on screen.
   Re-measured on load, on resize, when fonts or images arrive and when a tab changes. Left alone when the content is too
   tall to fit with room to spare (it then stays where the layout puts it). */
(function () {
  const MARGIN = 16;
  // the element to shift and the box its content lives in, for whichever desktop tab is showing
  function target() {
    const about = [...document.querySelectorAll('section[data-screen-label^="About"][data-screen-label$="(desktop)"]')].find(s => s.offsetParent);
    if (about) {
      const tabs = about.querySelector('[role=tablist]');
      return tabs && { el: tabs.previousElementSibling, labels: tabs.querySelector('button') };
    }
    const contact = document.querySelector('section[data-screen-label="Contact (desktop)"]');
    if (contact && contact.offsetParent) {
      const row = contact.querySelector('#tabsDesk');
      const box = row && row.previousElementSibling;
      if (!box) return null;
      // the photograph's <picture> is inline, so the image itself is shifted
      return { el: box.tagName === 'PICTURE' ? box.querySelector('img') : box, labels: row.querySelector('button') };
    }
    return null;
  }
  // what is visibly in the box: on About its pictures, headings, copy and slide dots (the box itself is an invisible frame,
  // usually taller than its content); on Contact the box is the photograph or the section's paper panel
  function bounds(el) {
    if (el.tagName === 'IMG' || el.dataset.screenLabel) { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }
    let top = Infinity, bottom = -Infinity;
    el.querySelectorAll('img, video, h1, h2, h3, p, li, table, form, button').forEach(e => {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || r.right <= 0 || r.left >= innerWidth) return;   // (slides parked off to the side)
      top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom);
    });
    return top < bottom ? { top, bottom } : null;
  }
  let last = null;
  function centre() {
    const t = target();
    if (last && (!t || last !== t.el)) { last.style.translate = ''; last.dataset.lift = ''; }
    if (!t || !t.el || !t.labels) { last = null; return; }
    last = t.el;
    const header = document.querySelector('header');
    if (!header) return;
    const top = header.getBoundingClientRect().bottom, bottom = t.labels.getBoundingClientRect().top;
    const now = parseFloat(t.el.dataset.lift) || 0;
    const b = bounds(t.el);
    if (!b) return;
    const h = b.bottom - b.top;
    let shift = 0;
    if (h <= bottom - top - 2 * MARGIN) shift = now + ((top + bottom) / 2 - (b.top + b.bottom) / 2);
    shift = Math.round(shift * 2) / 2;
    if (shift !== now) { t.el.dataset.lift = shift; t.el.style.translate = shift ? '0 ' + shift + 'px' : ''; }
  }
  let queued = false;
  // (a short timer rather than an animation frame, which a browser holds back in a background tab)
  const soon = () => { if (!queued) { queued = true; setTimeout(() => { queued = false; centre(); }, 30); } };
  window.addEventListener('resize', soon);
  if (window.ResizeObserver) new ResizeObserver(soon).observe(document.documentElement);
  window.addEventListener('load', soon);
  document.addEventListener('load', e => { if (e.target.tagName === 'IMG') soon(); }, true);
  if (document.fonts) document.fonts.ready.then(soon);
  // a tab change swaps the box's contents (the page re-renders that part); our own translate is a style change, not watched
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  soon();
})();
