(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Menú móvil */
  var menuBtn = $(".menu-btn");
  var menu = $("#menu");

  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* Scroll: cabecera, barra de progreso y parallax */
  var header = $(".site-header");
  var bar = $(".progress span");
  var bands = $$(".band img");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("solid", y > 40);
    bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";

    if (!reduce) {
      var vh = window.innerHeight;
      bands.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var offset = ((r.top + r.height / 2) - vh / 2) * -0.08;
        img.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Aparición al hacer scroll */
  var reveals = $$(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      ro.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Contadores */
  var counters = $$("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Las cuatro capas: el bocado se arma al bajar */
  var steps = $$(".step");
  var bite = $(".bite");
  var groups = $$(".g", bite);
  var nameEl = $(".bite-name", bite);
  var countEl = $(".bite-count", bite);
  var names = ["Casabe", "Queso siete cueros", "Miel", "Mermelada de maracuyá"];

  function setLayer(n) {
    bite.setAttribute("data-step", n);
    groups.forEach(function (g, i) { g.classList.toggle("on", i < n); });
    nameEl.textContent = names[n - 1];
    countEl.textContent = "Capa " + n + " de 4";
    steps.forEach(function (s, i) { s.classList.toggle("active", i === n - 1); });
  }
  setLayer(1);

  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setLayer(parseInt(en.target.getAttribute("data-layer"), 10));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { so.observe(s); });
  } else {
    groups.forEach(function (g) { g.classList.add("on"); });
    steps.forEach(function (s) { s.classList.add("active"); });
  }

  /* Enlace activo en el menú */
  var links = $$(".menu a");
  if ("IntersectionObserver" in window) {
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (l) {
      var sec = document.querySelector(l.getAttribute("href"));
      if (sec) mo.observe(sec);
    });
  }

  $("#year").textContent = new Date().getFullYear();
})();
