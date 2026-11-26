// (since 2026-11-13, Grace) desktop, every page: the footer stays out of sight below the window's bottom edge. When the pointer
// reaches the bottom 20px of the window and rests there 1.5s it slides up (since 2026-11-26; 2.5s from 25 Nov, at once before); once the pointer moves off it, it slides back down. It also shows while
// something in it has keyboard focus. Phones and touch screens keep the footer as before.
(() => {
  const MQ = '(min-width: 1000px) and (hover: hover) and (pointer: fine)';
  const st = document.createElement('style');
  st.textContent = '@media ' + MQ + ' { html.fp footer { position: fixed !important; left: 0 !important; right: 0 !important; top: auto !important; bottom: 0 !important; margin: 0 !important; z-index: 60 !important; transform: translateY(100%); transition: transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1); } html.fp.fp-up footer { transform: none; } }';
  document.head.appendChild(st);
  const root = document.documentElement; root.classList.add('fp');
  const mq = matchMedia(MQ); let up = false, wait = 0;
  const HOLD = 1500;   // (since 2026-11-26, Ned via Grace; 2.5s from 25 Nov) how long the pointer stays in the bottom 20px before the footer slides up
  const set = v => { if (v !== up) { up = v; root.classList.toggle('fp-up', v); } };
  addEventListener('mousemove', e => {
    if (!mq.matches) return;
    const f = document.querySelector('footer'); if (!f) return;
    if (e.clientY >= innerHeight - 20) { if (!up && !wait) wait = setTimeout(() => { wait = 0; set(true); }, HOLD); }
    else { clearTimeout(wait); wait = 0; }
    if (up && e.clientY >= innerHeight - 20) return;
    else if (up && e.clientY < innerHeight - f.offsetHeight) set(false);
  }, { passive: true });
  document.addEventListener('mouseleave', () => { clearTimeout(wait); wait = 0; set(false); });
  document.addEventListener('focusin', e => set(!!(e.target.closest && e.target.closest('footer'))));
})();
