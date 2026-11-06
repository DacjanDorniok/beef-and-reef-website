/* Beef & Reef — small progressive enhancements. The site works without JS. */
(function () {
  'use strict';
  var root = document.documentElement;
  var pageLang = root.lang === 'en' ? 'en' : 'pl';
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Theme (light / dark), remembers the visitor's choice ---- */
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeButtons() {
    var dark = currentTheme() === 'dark';
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      var label = dark ? b.getAttribute('data-label-light') : b.getAttribute('data-label-dark');
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
    });
  }
  document.querySelectorAll('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('br-theme', next);
      syncThemeButtons();
    });
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', syncThemeButtons);
  }
  syncThemeButtons();

  /* ---- Remember an explicit language choice ---- */
  document.querySelectorAll('a[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () { store('br-lang', a.getAttribute('data-lang')); });
  });

  /* ---- Burger menu ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('menu-mobilne');
  function setMenu(open) {
    if (!burger || !mnav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? burger.getAttribute('data-label-close') : burger.getAttribute('data-label-open'));
    mnav.hidden = !open;
    if (open) { var first = mnav.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1200) setMenu(false); });
  }

  /* ---- Menu page: category bar (scroll so the category title sits right under the bar) + scroll-spy ---- */
  var chips = document.querySelectorAll('.chips a');
  var catBar = document.querySelector('.cat-bar');
  if (chips.length && catBar) {
    var bar = document.querySelector('.chips');
    var header = document.querySelector('.site-header');
    var active = null;
    function stickyOffset() { return (header ? header.offsetHeight : 80) + catBar.offsetHeight; }
    function markActive(id) {
      if (id === active) return;
      active = id;
      chips.forEach(function (c) {
        if (c.getAttribute('data-id') === id) {
          c.setAttribute('aria-current', 'location');
          if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: c.offsetLeft - bar.clientWidth / 2 + c.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
        } else c.removeAttribute('aria-current');
      });
    }
    function groupTarget(id) {
      var g = document.querySelector('[data-group="' + id + '"]');
      return g ? (g.querySelector('h2') || g) : null;
    }
    function spy() {
      var line = stickyOffset() + 120;
      var current = chips[0].getAttribute('data-id');
      chips.forEach(function (c) {
        var id = c.getAttribute('data-id');
        var t = groupTarget(id);
        if (t && t.getBoundingClientRect().top <= line) current = id;
      });
      markActive(current);
    }
    function goTo(id, smooth) {
      var t = groupTarget(id);
      if (!t) return;
      var y = window.pageYOffset + t.getBoundingClientRect().top - stickyOffset() - 24;
      window.scrollTo({ top: Math.max(0, y), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
      markActive(id);
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        var id = c.getAttribute('data-id');
        goTo(id, true);
        history.replaceState(null, '', '#g-' + id);
      });
    });
    window.addEventListener('scroll', spy, { passive: true });
    var hashId = location.hash.replace(/^#g-/, '');
    if (location.hash.indexOf('#g-') === 0 && groupTarget(hashId)) {
      window.addEventListener('load', function () { goTo(hashId, false); });
    }
    spy();
  }

  /* ---- First visit: language picker (home pages only) ----
     Shown once, only on a direct visit (no referrer, no ?lang=, no #anchor) and before any language was chosen.
     Gold button = browser language. Close / Esc = keep the browser language. */
  var picker = document.getElementById('lang-pick');
  if (picker && typeof picker.showModal === 'function') {
    var q = new URLSearchParams(location.search);
    if (!read('br-lang') && !document.referrer && !q.has('lang') && !location.hash) {
      var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'pl';
      var browserLang = nav.toLowerCase().indexOf('pl') === 0 ? 'pl' : 'en';
      var choices = picker.querySelector('.lp-choices');
      var links = { pl: choices.querySelector('[data-lang="pl"]'), en: choices.querySelector('[data-lang="en"]') };
      var other = browserLang === 'pl' ? 'en' : 'pl';
      links[browserLang].className = 'btn btn-gold';
      links[other].className = 'btn btn-line';
      choices.insertBefore(links[browserLang], choices.firstChild);
      var choose = function (l) {
        store('br-lang', l);
        if (l !== pageLang) location.href = links[l].href; else picker.close();
      };
      [links.pl, links.en].forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); choose(a.getAttribute('data-lang')); });
      });
      picker.querySelector('.lp-close').addEventListener('click', function () { choose(browserLang); });
      picker.addEventListener('cancel', function (e) { e.preventDefault(); choose(browserLang); });
      picker.showModal();
      links[browserLang].focus();
    }
  }
})();
