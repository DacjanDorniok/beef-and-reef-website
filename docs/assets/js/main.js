/* Beef & Reef — small progressive enhancements. The site works without JS. */
(function () {
  'use strict';
  var root = document.documentElement;
  var en = root.lang === 'en';

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
      try { localStorage.setItem('br-theme', next); } catch (e) {}
      syncThemeButtons();
    });
  });
  syncThemeButtons();

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

  /* ---- Hero video pause / play (WCAG 2.2.2) ---- */
  var video = document.querySelector('.hero-video');
  var vbtn = document.querySelector('.video-toggle');
  if (video && vbtn) {
    vbtn.addEventListener('click', function () {
      var paused = vbtn.getAttribute('aria-pressed') === 'true';
      if (paused) { video.play(); } else { video.pause(); }
      vbtn.setAttribute('aria-pressed', paused ? 'false' : 'true');
      vbtn.textContent = paused ? vbtn.getAttribute('data-label-pause') : vbtn.getAttribute('data-label-play');
    });
  }

  /* ---- Menu page: language switch + category scroll-spy ---- */
  var lists = document.querySelectorAll('.menu-list');
  if (lists.length) {
    var segBtns = document.querySelectorAll('.seg button');
    var chips = document.querySelectorAll('.chips a');
    var labels = JSON.parse(document.getElementById('chip-labels').textContent);
    function setLang(l) {
      lists.forEach(function (el) { el.hidden = el.getAttribute('lang') !== l; });
      segBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false'); });
      chips.forEach(function (c) { c.textContent = labels[l][c.getAttribute('data-id')]; });
      document.querySelectorAll('[data-i18n-pl]').forEach(function (el) { el.textContent = el.getAttribute('data-i18n-' + l); });
      try { localStorage.setItem('br-menu-lang', l); } catch (e) {}
    }
    segBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
    var qlang = new URLSearchParams(location.search).get('lang');
    if (qlang === 'en' || qlang === 'pl') setLang(qlang);
    else { try { var saved = localStorage.getItem('br-menu-lang'); if (saved === 'en' || saved === 'pl') setLang(saved); } catch (e) {} }

    var bar = document.querySelector('.chips');
    var active = null;
    function markActive(id) {
      if (id === active) return;
      active = id;
      chips.forEach(function (c) {
        if (c.getAttribute('data-id') === id) {
          c.setAttribute('aria-current', 'location');
          if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: c.offsetLeft - bar.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' });
        } else c.removeAttribute('aria-current');
      });
    }
    function spy() {
      var offset = (parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 85) + 90;
      var current = chips[0].getAttribute('data-id');
      chips.forEach(function (c) {
        var id = c.getAttribute('data-id');
        var visible = document.querySelector('.menu-list:not([hidden]) [data-group="' + id + '"]');
        if (visible && visible.getBoundingClientRect().top <= offset) current = id;
      });
      markActive(current);
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function (e) {
        var id = c.getAttribute('data-id');
        var target = document.querySelector('.menu-list:not([hidden]) [data-group="' + id + '"]');
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', '#' + target.id); markActive(id); }
      });
    });
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();
