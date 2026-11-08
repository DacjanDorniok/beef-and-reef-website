/* Beef & Reef — kierunek „Ruch”: zachowanie strony. Strona działa też bez JS. */
(function () {
  'use strict';
  var root = document.documentElement;
  var rx = document.querySelector('.rx');
  if (!rx) return;
  var pageLang = root.lang === 'en' ? 'en' : 'pl';
  var L = JSON.parse(rx.getAttribute('data-i18n') || '{}');
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var reduce = mqReduce.matches;
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function on(name, fn) { $$('[data-on-click="' + name + '"]').forEach(function (b) { b.addEventListener('click', fn); }); }
  root.classList.add('js');

  /* ---------- po odświeżeniu zawsze od góry (chyba że adres wskazuje sekcję, np. #kontakt) ---------- */
  function toStart() {
    if (location.hash && document.getElementById(location.hash.slice(1))) return;
    window.scrollTo(0, 0);
  }
  toStart();
  window.addEventListener('pageshow', function (e) { if (e.persisted) return; toStart(); });

  /* ---------- motyw ---------- */
  function theme() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' ? 'dark' : 'light';
  }
  function syncTheme() {
    var dark = theme() === 'dark';
    $$('[data-on-click="toggleTheme"]').forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      var l = dark ? L.light : L.dark;
      b.setAttribute('aria-label', l);
      if (b.hasAttribute('title')) b.setAttribute('title', l);
    });
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#0a0a0a' : '#ffffff');
  }
  on('toggleTheme', function () {
    var next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('br-theme', next);
    syncTheme();
  });
  if (window.matchMedia) {
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    var follow = function (e) { if (!read('br-theme')) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); syncTheme(); } };
    if (mqDark.addEventListener) mqDark.addEventListener('change', follow); else if (mqDark.addListener) mqDark.addListener(follow);
  }
  syncTheme();

  /* ---------- wybór języka zapamiętany ---------- */
  $$('a[data-lang], a.lang').forEach(function (a) {
    a.addEventListener('click', function () { store('br-lang', a.getAttribute('data-lang') || a.getAttribute('lang')); });
  });

  /* ---------- szuflada (menu na tablecie i telefonie) ---------- */
  var drawer = document.querySelector('.drawer-wrap');
  var burger = document.getElementById('rx-burger');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var c = document.getElementById('rx-close'); if (c) c.focus(); }
    else if (burger && document.activeElement && drawer.contains(document.activeElement)) burger.focus();
  }
  on('openDrawer', function () { setDrawer(true); });
  on('closeDrawer', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) setDrawer(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && drawer && !drawer.hidden) setDrawer(false); });

  /* ---------- wejścia sekcji ---------- */
  setTimeout(function () { $$('.js-hero').forEach(function (s) { s.classList.add('in'); }); }, 60);
  var rv = $$('[data-rv]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- przycisk „Zadzwoń” w nagłówku i pasek telefonu po hero ---------- */
  var heroCta = document.getElementById('hero-cta');
  var calls = $$('.call'), bars = $$('.pbar');
  function setPast(past) {
    calls.forEach(function (c) {
      c.classList.toggle('off', !past);
      c.setAttribute('aria-hidden', past ? 'false' : 'true');
      var a = c.querySelector('a'); if (a) a.setAttribute('tabindex', past ? '0' : '-1');
    });
    bars.forEach(function (b) { b.classList.toggle('off', !past); });
  }
  if (heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var e = es[0];
      setPast(!e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(heroCta);
  } else {
    setPast(true);
  }

  /* ---------- zdania, które zapalają się przy przewijaniu + paralaksa + kategorie menu ---------- */
  var stmts = $$('.stmt').map(function (p) { return { el: p, words: $$('.wd', p) }; });
  var plx = $$('[data-plx]').map(function (s) {
    var k = s.getAttribute('data-plx');
    return { sec: s, el: s.querySelector('.plx'), f: k === 'chef' ? 0.05 : -0.06 };
  });
  var chips = $$('#rx-chips a');
  var chipBar = document.getElementById('rx-chips');
  var active = null;
  function centerChip(a) {
    if (!chipBar || !a) return;
    var left = a.offsetLeft - chipBar.clientWidth / 2 + a.clientWidth / 2;
    try { chipBar.scrollTo({ left: left, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { chipBar.scrollLeft = left; }
  }
  function measure() {
    var vh = window.innerHeight;
    stmts.forEach(function (s) {
      var lit = s.words.length;
      if (!reduce) {
        var r = s.el.getBoundingClientRect();
        var prog = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.25)));
        lit = Math.round(prog * s.words.length * 1.25);
      }
      s.words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    });
    var wide = window.innerWidth >= 900 && !reduce;
    plx.forEach(function (p) {
      if (!p.el) return;
      if (!wide) { p.el.style.transform = ''; return; }
      var r = p.sec.getBoundingClientRect();
      p.el.style.transform = 'translateY(' + Math.round((r.top + r.height / 2 - vh / 2) * p.f) + 'px)';
    });
    if (chips.length) {
      var a = chips[0];
      chips.forEach(function (c) {
        var el = document.getElementById(c.getAttribute('href').slice(1));
        if (el && el.getBoundingClientRect().top < 240) a = c;
      });
      if (a !== active) {
        chips.forEach(function (c) { c.classList.toggle('on', c === a); c.setAttribute('aria-current', c === a ? 'true' : 'false'); });
        active = a; centerChip(a);
      }
    }
  }
  var raf = 0;
  function onScroll() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; measure(); }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();

  /* ---------- karuzela: autoodtwarzanie, pauza, strzałki, przeciąganie palcem ---------- */
  $$('.car').forEach(function (car) {
    var today = new Date().toISOString().slice(0, 10);
    $$('.slide[data-until]', car).forEach(function (s) {
      var u = s.getAttribute('data-until');
      if (u && today > u) s.parentNode.removeChild(s);
    });
    var slides = $$('.slide', car);
    var n = slides.length;
    if (!n) return;
    var cur = 0, prev = -1, paused = reduce, timer = 0, drag = null;
    var count = car.querySelector('.count');
    var countB = count && count.querySelector('b');
    var total = count && count.querySelector('.muted');
    var prog = car.querySelector('.prog');
    var link = car.querySelector('.slide-link');
    var pauseBtn = car.querySelector('[data-on-click="togglePause"]');
    var pad = function (v) { return (v < 10 ? '0' : '') + v; };
    if (total) total.textContent = '/ ' + pad(n);
    function render() {
      slides.forEach(function (s, i) {
        s.classList.toggle('cur', i === cur);
        s.classList.toggle('out', i === prev && i !== cur);
        s.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
        s.setAttribute('aria-label', pad(i + 1) + ' / ' + pad(n) + ': ' + (s.querySelector('.t-title') || {}).textContent);
        s.style.transform = ''; s.style.opacity = '';
      });
      if (countB) countB.textContent = pad(cur + 1);
      if (link) {
        var s = slides[cur];
        link.setAttribute('href', s.getAttribute('data-href') || '#');
        link.firstChild.nodeValue = (s.getAttribute('data-cta') || '') + ' ';
      }
      if (prog) {
        prog.innerHTML = '';
        if (!paused) { var f = document.createElement('span'); f.className = 'fill'; prog.appendChild(f); }
      }
      if (count) count.setAttribute('aria-live', paused ? 'polite' : 'off');
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-label', paused ? L.play : L.pause);
        var a = pauseBtn.querySelector('.ic-pause'), b = pauseBtn.querySelector('.ic-play');
        if (a) a.hidden = paused; if (b) b.hidden = !paused;
      }
    }
    function go(i) { if (i === cur) return; prev = cur; cur = (i + n) % n; render(); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        if (paused || drag || document.hidden || (drawer && !drawer.hidden) || n < 2) return;
        go(cur + 1);
      }, 5200);
    }
    car.querySelector('[data-on-click="prev"]').addEventListener('click', function () { go(cur - 1); restart(); });
    car.querySelector('[data-on-click="next"]').addEventListener('click', function () { go(cur + 1); restart(); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { paused = !paused; render(); restart(); });
    /* przeciąganie: slajd idzie za palcem, krótki ruch w bok zmienia slajd */
    car.addEventListener('pointerdown', function (e) {
      if (n < 2 || (e.button !== undefined && e.button !== 0)) return;
      if (e.target.closest && e.target.closest('button, a')) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false };
    });
    car.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        if (Math.abs(dx) < 8) return;
        drag.on = true;
        try { car.setPointerCapture(drag.id); } catch (x) {}
        car.classList.add('dragging');
      }
      var s = slides[cur];
      s.style.transform = 'translateX(' + dx + 'px)';
      s.style.opacity = Math.max(0.35, 1 - Math.abs(dx) / 900).toFixed(2);
    });
    function end(e) {
      var d = drag; drag = null;
      if (!d || !d.on) return;
      car.classList.remove('dragging');
      var dx = e.clientX - d.x;
      var lim = Math.min(80, car.clientWidth * 0.18);
      if (dx < -lim) go(cur + 1); else if (dx > lim) go(cur - 1); else render();
      restart();
    }
    car.addEventListener('pointerup', end);
    car.addEventListener('pointercancel', end);
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(cur - 1); restart(); }
      if (e.key === 'ArrowRight') { go(cur + 1); restart(); }
    });
    render(); restart();
  });

  /* ---------- mapa: wczytuje się dopiero po kliknięciu ---------- */
  on('showMap', function () {
    var map = document.querySelector('.map');
    if (!map) return;
    var a = map.querySelector('.map-a'), b = map.querySelector('.map-b');
    if (a) a.hidden = true;
    if (b) {
      b.hidden = false;
      b.innerHTML = '<iframe class="map-frame" title="' + L.mapTitle + '" src="' + map.getAttribute('data-embed') + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    }
  });

  /* ---------- pierwsza wizyta: wybór języka (tylko strona główna) ---------- */
  var lp = document.getElementById('lang-pick');
  if (lp) {
    var q = new URLSearchParams(location.search);
    if (!read('br-lang') && !document.referrer && !q.has('lang') && !location.hash) {
      var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'pl';
      var browserLang = nav.toLowerCase().indexOf('pl') === 0 ? 'pl' : 'en';
      var box = lp.querySelector('.lp-btns');
      var links = { pl: box.querySelector('[data-lang="pl"]'), en: box.querySelector('[data-lang="en"]') };
      var other = browserLang === 'pl' ? 'en' : 'pl';
      links[browserLang].className = 'btn btn-gold';
      links[other].className = 'btn btn-line';
      box.insertBefore(links[browserLang], box.firstChild);
      var lastFocus = null;
      var close = function () { lp.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
      var choose = function (l) {
        store('br-lang', l);
        if (l !== pageLang) location.href = links[l].href; else close();
      };
      [links.pl, links.en].forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); choose(a.getAttribute('data-lang')); });
      });
      lp.querySelector('.lp-x').addEventListener('click', function () { choose(browserLang); });
      lp.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { choose(browserLang); return; }
        if (e.key === 'Tab') {
          var f = $$('button, a[href]', lp); var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      lastFocus = document.activeElement;
      lp.hidden = false;
      document.body.style.overflow = 'hidden';
      links[browserLang].focus();
    }
  }
})();
