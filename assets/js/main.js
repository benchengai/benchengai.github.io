/* Ben Cheng — personal site interactions. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function storeTheme(value) {
    try { localStorage.setItem("theme", value); } catch (e) { /* storage unavailable */ }
  }
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector("[data-theme-toggle]");
  function currentTheme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function syncThemeLabel() {
    if (themeBtn) themeBtn.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  function applyTheme(t, persist) {
    root.setAttribute("data-theme", t);
    if (persist) storeTheme(t);
    syncThemeLabel();
    document.dispatchEvent(new CustomEvent("themechange"));
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () { applyTheme(currentTheme() === "dark" ? "light" : "dark", true); });
  }
  // Follow the OS setting until the visitor picks a theme themselves.
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
    if (!storedTheme()) applyTheme(e.matches ? "light" : "dark", false);
  });
  syncThemeLabel();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () { setNav(!body.classList.contains("nav-open")); });
    document.querySelectorAll("#nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  }

  /* ---------- Scroll: nav state + progress bar ---------- */
  var nav = document.querySelector("[data-nav]");
  var progress = document.querySelector(".progress span");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-scrolled", y > 8);
    if (progress) progress.style.setProperty("--progress", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ("IntersectionObserver" in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Reveal on scroll (with stagger) ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var items = group.querySelectorAll(".reveal");
    if (!items.length) items = group.children;
    Array.prototype.forEach.call(items, function (el, i) { el.style.setProperty("--d", (i * 0.07).toFixed(2) + "s"); });
  });
  var heroItems = document.querySelectorAll(".hero .reveal");
  Array.prototype.forEach.call(heroItems, function (el, i) { el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s"); });

  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  function formatNumber(n, decimals) {
    return n.toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  var counters = document.querySelectorAll("[data-count]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        var start = performance.now();
        var duration = 1600;
        function step(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 4);
          el.textContent = formatNumber(target * eased, decimals);
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = formatNumber(target, decimals);
        }
        el.textContent = formatNumber(0, decimals);
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Spotlight (pointer-follow highlight) ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".spotlight").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Placeholder links (empty href → "Soon") ---------- */
  document.querySelectorAll("[data-demo-link]").forEach(function (a) {
    var href = (a.getAttribute("href") || "").trim();
    if (!href || href === "#") {
      a.classList.add("is-soon");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("tabindex", "-1");
      a.removeAttribute("href");
      a.setAttribute("title", "Coming soon");
    } else if (/^https?:/i.test(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
  });

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("[data-copy-label]");
    var original = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      function done() {
        btn.classList.add("is-copied");
        if (label) label.textContent = "Copied";
        setTimeout(function () {
          btn.classList.remove("is-copied");
          if (label) label.textContent = original;
        }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, function () { window.location.href = "mailto:" + value; });
      } else {
        window.location.href = "mailto:" + value;
      }
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ==========================================================================
     Hero background: layered "speech" waveforms on canvas
     ========================================================================== */
  (function initWaves() {
    var canvas = document.getElementById("hero-waves");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1;
    var colors = ["#5eead4", "#a78bfa"];
    var pointer = { x: 0.65, tx: 0.65, energy: 0, target: 0 };
    var running = false, visible = true, rafId = 0;
    var LINES = 9;

    function readColors() {
      var cs = getComputedStyle(root);
      colors = [cs.getPropertyValue("--wave-1").trim() || colors[0], cs.getPropertyValue("--wave-2").trim() || colors[1]];
    }
    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.energy += (pointer.target - pointer.energy) * 0.04;

      var grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.strokeStyle = grad;
      ctx.lineJoin = "round";

      var step = w > 900 ? 5 : 4;
      for (var i = 0; i < LINES; i++) {
        var p = i / (LINES - 1);
        var centre = 1 - Math.abs(p - 0.5) * 2;      // 0 at edges, 1 in the middle line
        ctx.globalAlpha = 0.08 + centre * 0.32;
        ctx.lineWidth = 0.8 + centre * 1.1;
        ctx.beginPath();
        var baseY = h * 0.55 + (p - 0.5) * h * 0.22;
        for (var x = 0; x <= w + step; x += step) {
          var nx = x / w;
          // Syllable-like bursts: a slow envelope modulated by a faster one.
          var env = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, nx))), 1.4);
          var burst = 0.45 + 0.55 * Math.pow(Math.max(0, Math.sin(nx * 7.5 - t * 0.00045 + i * 0.25)), 2);
          var dx = nx - pointer.x;
          var boost = 1 + pointer.energy * 1.4 * Math.exp(-dx * dx * 28);
          var amp = h * 0.11 * env * burst * boost;
          var y = baseY
            + Math.sin(nx * 11 + t * 0.0011 + i * 0.6) * amp * 0.65
            + Math.sin(nx * 23 - t * 0.0017 + i * 1.3) * amp * 0.3
            + Math.sin(nx * 41 + t * 0.0026 + i * 0.4) * amp * 0.08;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      draw(t);
      if (running) rafId = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    readColors();
    resize();
    draw(4000);

    window.addEventListener("resize", function () { resize(); if (!running) draw(4000); });
    document.addEventListener("themechange", function () { readColors(); if (!running) draw(4000); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

    var hero = document.querySelector(".hero");
    if (hero && window.matchMedia("(hover: hover)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.tx = (e.clientX - r.left) / r.width;
        pointer.target = 1;
      });
      hero.addEventListener("pointerleave", function () { pointer.target = 0; });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }).observe(canvas);
    } else {
      start();
    }
  })();

  /* ==========================================================================
     Hero card: concept preview of ElicitSense, cycling through sample lines
     from a fictional discovery meeting. "…" renders as a pause, like the
     sample-data scripts the demo itself uses.
     ========================================================================== */
  (function initHeroCard() {
    var card = document.querySelector("[data-hero-card]");
    if (!card) return;
    var waveEl = card.querySelector("[data-hc-wave]");
    var refEl = card.querySelector("[data-hc-ref]");
    var speakerEl = card.querySelector("[data-hc-speaker]");
    var quoteEl = card.querySelector("[data-hc-quote]");
    var reqEl = card.querySelector("[data-hc-req]");
    var idEl = card.querySelector("[data-hc-id]");
    var typeEl = card.querySelector("[data-hc-type]");
    var stmtEl = card.querySelector("[data-hc-stmt]");
    var cuesEl = card.querySelector("[data-hc-cues]");

    // Waveform bars
    var BARS = 46;
    for (var b = 0; b < BARS; b++) {
      var bar = document.createElement("i");
      var shape = Math.sin((b / BARS) * Math.PI);
      bar.style.setProperty("--h", (0.25 + 0.75 * shape * (0.5 + Math.random() * 0.5)).toFixed(2));
      bar.style.setProperty("--d", (-Math.random() * 0.7).toFixed(2) + "s");
      bar.style.setProperty("--x", ((b / (BARS - 1)) * 100).toFixed(1) + "%");
      waveEl.appendChild(bar);
    }

    var scenes = [
      {
        ref: "m1:L005", speaker: "OWNER",
        quote: "“Patients should be able to book an appointment online without creating an account.”",
        id: "REQ-01", type: "Functional",
        stmt: "Patients can book online without an account — name, phone and email only.",
        cues: [["evidence verified", "cue-ok"], ["confident", "cue-ok"]],
        flag: false
      },
      {
        ref: "m1:L012", speaker: "OWNER",
        quote: "“Um… I think… maybe a deposit? I’m not sure our patients would like paying upfront.”",
        id: "REQ-05", type: "Functional · open question",
        stmt: "Patients may pay a deposit online when booking.",
        cues: [["hedging", "cue-warn"], ["2 pauses", "cue-warn"], ["→ follow up", "cue-action"]],
        flag: true
      },
      {
        ref: "m1:L023", speaker: "OWNER",
        quote: "“Patient information has to stay in Australia. That’s non-negotiable.”",
        id: "REQ-09", type: "Constraint",
        stmt: "Patient data must be stored in Australia.",
        cues: [["evidence verified", "cue-ok"], ["data residency", ""]],
        flag: false
      }
    ];

    function renderReq(s) {
      idEl.textContent = s.id;
      typeEl.textContent = s.type;
      stmtEl.textContent = s.stmt;
      cuesEl.innerHTML = "";
      s.cues.forEach(function (c) {
        var span = document.createElement("span");
        span.className = "cue " + c[1];
        span.textContent = c[0];
        cuesEl.appendChild(span);
      });
      reqEl.classList.toggle("is-flag", s.flag);
    }

    if (reduceMotion) { // keep the static scene from the HTML
      reqEl.classList.add("is-flag");
      return;
    }

    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    var index = 0;
    var paused = false;

    function play() {
      var s = scenes[index];
      reqEl.classList.remove("is-shown");
      refEl.textContent = s.ref;
      speakerEl.textContent = s.speaker;
      quoteEl.textContent = "";
      var i = 0;
      waveEl.classList.add("is-speaking");

      function typeNext() {
        if (i >= s.quote.length) {
          waveEl.classList.remove("is-speaking");
          later(function () { renderReq(s); reqEl.classList.add("is-shown"); }, 450);
          later(function () { index = (index + 1) % scenes.length; if (!paused) play(); }, 5200);
          return;
        }
        var ch = s.quote.charAt(i);
        quoteEl.textContent += ch;
        i++;
        var delay = 26 + Math.random() * 30;
        if (ch === "…") {
          waveEl.classList.remove("is-speaking");
          later(function () { waveEl.classList.add("is-speaking"); typeNext(); }, 720);
          return;
        }
        if (ch === "," || ch === ".") delay += 140;
        later(typeNext, delay);
      }
      later(typeNext, 400);
    }

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    // Only animate while the card is on screen.
    if ("IntersectionObserver" in window) {
      var started = false;
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting;
        if (on && (!started || paused)) {
          started = true; paused = false;
          clearTimers();
          play();
        } else if (!on && started) {
          paused = true;
          clearTimers();
          waveEl.classList.remove("is-speaking");
          // leave a complete scene on screen
          var s = scenes[index];
          quoteEl.textContent = s.quote;
          renderReq(s);
          reqEl.classList.add("is-shown");
        }
      }, { threshold: 0.3 }).observe(card);
    } else {
      play();
    }
  })();
})();
