// (since 2026-11-05 on Home, About and Contact; since 2026-11-06 on every page, where only the footer uses it) sets --body-pad so the page's content and the footer end exactly under the last letter
// of CONTACT in the header nav, the left edge the same distance in from the window's left. Measured from the letter itself (its
// trailing letter-spacing left out), again on resize and once the fonts have loaded; at 2500px and below the content lines up with the nav itself (the stylesheet's side margin).
//
// (since 2026-11-08, Grace) pages whose tag carries data-nav="home" also get the homepage's header and footer, in exactly the
// homepage's place at every window size (desktop, 1280px up): the same sums as index.html's header-fit script and its --hp. The
// logo's Tree of Life (138.7px into the logo) and CONTACT's last T sit where the homepage's painting edges would be; the footer's
// copy on those lines too. The page's own content stays where it was: --body-pad is measured from where CONTACT would sit with the
// header on its old side margins, so only the header and footer move.
(function () {
  const root = document.documentElement;
  const me = document.currentScript || document.querySelector('script[src*="body-fit.js"]');
  const NAV = !!(me && me.getAttribute('data-nav') === 'home');
  let shift = 0;   // how far left of its old place the header moved CONTACT's last T (px)

  function navFit() {
    const bar = document.querySelector('header > div'), logo = bar && bar.querySelector('a'), c = document.querySelector('header a[data-t="Contact"]');
    const foot = document.querySelector('footer > div');
    if (!bar || !logo || !c) return;
    if (!matchMedia('(min-width: 1280px)').matches) {
      bar.style.paddingLeft = bar.style.paddingRight = ''; if (foot) foot.style.paddingLeft = foot.style.paddingRight = ''; shift = 0; return; }
    const icons = [...document.querySelectorAll('header svg')].filter(e => e.getBoundingClientRect().width > 0 && !e.closest('.prev-box'));
    if (!icons.length) return;
    bar.style.paddingLeft = bar.style.paddingRight = '';   // measure on the stylesheet's own margins (no paint in between)
    const base = parseFloat(getComputedStyle(bar).paddingRight) || 0;
    const W = root.clientWidth, H = innerHeight, hh = bar.offsetHeight, side = W * (W > 2500 ? 0.08 : 0.10), hang = W > 2500 ? 59 : 45;
    const hw = Math.min(W - 2 * side, (0.86 * (H - hh) - hang) * 1.7673);
    const left = (W - Math.min(1.1 * hw, W - 301.4)) / 2;   // the homepage's painting edge
    const cr = c.getBoundingClientRect().right - (parseFloat(getComputedStyle(c).letterSpacing) || 0);
    const D = Math.max(...icons.map(e => e.getBoundingClientRect().right)) - cr;   // the icons past that T
    const padR = Math.max(12, left - D);
    bar.style.paddingLeft = Math.max(0, left - 138.7).toFixed(2) + 'px';
    bar.style.paddingRight = padR.toFixed(2) + 'px';
    shift = padR - base;
    // the footer: the homepage's --hp, (100vw - its painting width) / 2, from the same sum in CSS units (100vw / 100vh)
    if (foot) {
      const vw = innerWidth, sp = vw * (vw > 2500 ? 0.08 : 0.10), hH = bar.getBoundingClientRect().height;   // var(--header-h) unrounded
      const hw0 = Math.min(vw - 2 * sp, (0.86 * (H - hH) - hang) * 1.7673), hp = ((vw - Math.min(1.1 * hw0, vw - 301.4)) / 2).toFixed(2) + 'px';
      if (foot.style.paddingLeft !== hp) foot.style.paddingLeft = foot.style.paddingRight = hp;
    }
  }

  function fit() {
    if (NAV) { navFit(); root.style.removeProperty('--body-pad'); return; }   // (since 2026-11-08) nav-match.css sets the margins on these pages
    const a = document.querySelector('header a[data-t="Contact"]');
    if (!a || !a.offsetWidth || !matchMedia('(min-width: 2501px)').matches) { root.style.removeProperty('--body-pad'); return; }   // screens over 2500px only
    // the link's box is as wide as its bold self on every page (a hidden bold copy under it), so the box keeps the footer in the same
    // place on Contact, where CONTACT is bold, as everywhere else (since 2026-11-06; measuring the letters put them 0.8px apart)
    const right = a.getBoundingClientRect().right - (parseFloat(getComputedStyle(a).letterSpacing) || 0) + shift;   // (since 2026-11-08) where it sat before the header moved
    const pad = (root.clientWidth - right).toFixed(2) + 'px';
    if (root.style.getPropertyValue('--body-pad') !== pad) root.style.setProperty('--body-pad', pad);
  }
  let n = 0; (function early() { fit(); if (++n < 120) requestAnimationFrame(early); })();   // through the first couple of seconds, while the page renders
  if (NAV && window.MutationObserver) {   // (since 2026-11-08) templated pages draw their header after this runs: placed before it is ever painted
    const mo = new MutationObserver(fit); mo.observe(root, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 4000);
  }
  addEventListener('resize', fit);
  addEventListener('load', fit);
  if (document.fonts) document.fonts.ready.then(fit);
})();
