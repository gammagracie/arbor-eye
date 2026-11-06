// (since 2026-11-05; Home, About and Contact) sets --body-pad so the page's content and the footer end exactly under the last letter
// of CONTACT in the header nav, the left edge the same distance in from the window's left. Measured from the letter itself (its
// trailing letter-spacing left out), again on resize and once the fonts have loaded; at 2500px and below the content lines up with the nav itself (the stylesheet's side margin).
(function () {
  const root = document.documentElement;
  function fit() {
    const a = document.querySelector('header a[data-t="Contact"]');
    if (!a || !a.offsetWidth || !matchMedia('(min-width: 2501px)').matches) { root.style.removeProperty('--body-pad'); return; }   // screens over 2500px only
    const t = [...a.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (!t) return;
    const r = document.createRange(); r.selectNodeContents(t);
    const right = r.getBoundingClientRect().right - (parseFloat(getComputedStyle(a).letterSpacing) || 0);
    const pad = (root.clientWidth - right).toFixed(2) + 'px';
    if (root.style.getPropertyValue('--body-pad') !== pad) root.style.setProperty('--body-pad', pad);
  }
  let n = 0; (function early() { fit(); if (++n < 120) requestAnimationFrame(early); })();   // through the first couple of seconds, while the page renders
  addEventListener('resize', fit);
  addEventListener('load', fit);
  if (document.fonts) document.fonts.ready.then(fit);
})();
