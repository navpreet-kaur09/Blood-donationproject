/* Jeevan loader: counts 0 -> 100 in step with the CSS bar */
(function () {
    var pct = document.getElementById('loaderPct');
    if (!pct) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pct.textContent = '100';
        return;
    }

    var DURATION = 1800;           // [TIME] keep equal to the CSS bar time (1.8s)
    var start = null;

    function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / DURATION, 1);
        var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        pct.textContent = Math.round(eased * 100);
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
})();