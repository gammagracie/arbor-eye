// Accessibility basics shared by every page (since 2026-11-09). With "reduce motion" on, script-driven smooth scrolling jumps
// straight to where it is going, as the CSS in a11y.css does for transitions and animations.
(function () {
  var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  window.AE_REDUCED = function () { return !!(mq && mq.matches); };
  function strip(fn) {
    return function (a, b) {
      if (window.AE_REDUCED() && a && typeof a === 'object' && a.behavior === 'smooth') a = Object.assign({}, a, { behavior: 'auto' });
      return fn.call(this, a, b);
    };
  }
  [Element.prototype, window].forEach(function (o) {
    ['scrollTo', 'scrollBy', 'scroll'].forEach(function (k) { if (o[k]) o[k] = strip(o[k]); });
  });
  if (Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = strip(Element.prototype.scrollIntoView);
})();
