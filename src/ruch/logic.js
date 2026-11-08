function words(str, lit) {
  return str.split(' ').map((t, i) => {
    const k = t.charAt(0) === '*';
    const tt = k ? t.slice(1) : t;
    return { t: tt, c: 'wd' + (k ? ' k' : '') + (i < lit ? ' on' : '') };
  });
}
class Component extends DCLogic {
  constructor(props) {
    super(props);
    let auto = 'light';
    try {
      const s = window.localStorage.getItem('br-theme');
      if (s === 'light' || s === 'dark') auto = s;
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) auto = 'dark';
    } catch (e) {}
    let reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    this.state = {
      userTheme: null, autoTheme: auto, heroIn: false, seen: {}, pastHero: !CFG.heroWatch,
      cur: 0, prev: -1, lit: {}, px: {}, drawer: false, paused: reduce, mapOpen: false,
      active: CFG.cats ? CFG.cats[0][0] : '', allLit: false, dragX: 0
    };
  }
  componentDidMount() {
    this.t = setTimeout(() => this.setState({ heroIn: true }), 60);
    this.startAuto();
    try {
      this.mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.onMq = (e) => { let s = null; try { s = window.localStorage.getItem('br-theme'); } catch (x) {} if (!s) this.setState({ autoTheme: e.matches ? 'dark' : 'light' }); };
      this.mq.addEventListener('change', this.onMq);
    } catch (e) {}
    const tall = window.innerHeight > 1200; // podgląd całego płótna: stan końcowy
    if (tall || typeof window.IntersectionObserver !== 'function') {
      const all = {};
      CFG.rv.forEach((k) => { all[k] = 1; });
      this.setState({ seen: all, allLit: true, pastHero: true });
      return;
    }
    this.io = new window.IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const k = e.target.getAttribute('data-rv');
          if (k && !this.state.seen[k]) this.setState({ seen: Object.assign({}, this.state.seen, { [k]: 1 }) });
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-rv]').forEach((el) => this.io.observe(el));
    if (CFG.heroWatch) {
      const h = document.getElementById(CFG.heroWatch);
      if (h) {
        this.io2 = new window.IntersectionObserver((en) => {
          const e = en[0];
          this.setState({ pastHero: !e.isIntersecting && e.boundingClientRect.top < 0 });
        }, { rootMargin: '-80px 0px 0px 0px' });
        this.io2.observe(h);
      }
    }
    this.onScroll = () => { if (this.raf) return; this.raf = window.requestAnimationFrame(() => { this.raf = 0; this.measure(); }); };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.measure();
  }
  componentDidUpdate(pp, ps) {
    if (this.state.drawer && !ps.drawer) { const b = document.getElementById('rx-close'); if (b) b.focus(); }
    if (!this.state.drawer && ps.drawer) { const b = document.getElementById('rx-burger'); if (b) b.focus(); }
  }
  measure() {
    const vh = window.innerHeight;
    const prog = (id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.25)));
    };
    const lit = {};
    Object.keys(CFG.words).forEach((id) => { lit[id] = Math.round(prog(id) * CFG.words[id].split(' ').length * 1.25); });
    const px = {};
    CFG.plx.forEach((p) => {
      const el = document.querySelector('[data-plx="' + p[0] + '"]');
      if (el) { const r = el.getBoundingClientRect(); px[p[0]] = Math.round((r.top + r.height / 2 - vh / 2) * p[1]); }
    });
    const st = { lit: lit, px: px };
    if (CFG.cats) {
      let a = CFG.cats[0][0];
      CFG.cats.forEach((c) => { const el = document.getElementById('g-' + c[0]); if (el && el.getBoundingClientRect().top < 240) a = c[0]; });
      if (a !== this.state.active) { st.active = a; this.centerChip(a); }
    }
    this.setState(st);
  }
  centerChip(id) {
    const bar = document.getElementById('rx-chips');
    const el = document.getElementById('chip-' + id);
    if (!bar || !el) return;
    try { bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' }); } catch (e) {}
  }
  list() {
    const ev = this.props.wydarzenie || CFG.eventDefault;
    return CFG.events.filter((e) => e.id === ev).concat(CFG.dishes);
  }
  startAuto() {
    clearInterval(this.iv);
    this.iv = setInterval(() => {
      const n = this.list().length;
      if (n < 2 || this.state.paused || this.props.ruch === 'Wyłączony' || this.state.drawer || this.drag) return;
      this.go((this.state.cur + 1) % n);
    }, 5200);
  }
  go(i) { if (i === this.state.cur) return; this.setState({ prev: this.state.cur, cur: i }); }
  componentWillUnmount() {
    clearTimeout(this.t); clearInterval(this.iv);
    if (this.io) this.io.disconnect();
    if (this.io2) this.io2.disconnect();
    if (this.onScroll) { window.removeEventListener('scroll', this.onScroll); window.removeEventListener('resize', this.onScroll); }
    try { if (this.mq) this.mq.removeEventListener('change', this.onMq); } catch (e) {}
  }
  renderVals() {
    const p = this.props.theme;
    const theme = this.state.userTheme || (p === 'light' || p === 'dark' ? p : this.state.autoTheme);
    const dark = theme === 'dark';
    const still = this.props.ruch === 'Wyłączony';
    const s = this.state.seen;
    const c = {};
    CFG.rv.forEach((k) => { c[k] = s[k] ? 'in' : ''; });
    c.hero = this.state.heroIn ? 'in' : '';
    const showCall = this.state.pastHero;
    const L = this.list();
    const n = L.length;
    const cur = Math.min(this.state.cur, Math.max(n - 1, 0));
    const pad = (v) => (v < 10 ? '0' : '') + v;
    const paused = this.state.paused || still;
    const slides = L.map((x, i) => ({
      src: x.src, alt: x.alt, kicker: x.kicker, title: x.title, desc: x.desc, price: x.price, imgCls: x.imgCls, size: x.size, cta: x.cta, href: x.href, until: x.until || '',
      label: pad(i + 1) + ' / ' + pad(n) + ': ' + x.title,
      cls: 'slide' + (i === cur ? ' cur' : (i === this.state.prev ? ' out' : '')),
      st: i === cur && this.state.dragX ? 'transform: translateX(' + this.state.dragX + 'px); opacity: ' + Math.max(0.35, 1 - Math.abs(this.state.dragX) / 900).toFixed(2) : '',
      hidden: i === cur ? 'false' : 'true', isCur: i === cur, isFill: i === cur && !paused
    }));
    const cc = L[cur] || {};
    const wide = window.innerWidth >= 900;
    const px = {};
    CFG.plx.forEach((q) => { px[q[0]] = still || !wide ? 0 : (this.state.px[q[0]] || 0); });
    const w = {};
    Object.keys(CFG.words).forEach((id) => { w[id] = words(CFG.words[id], still || this.state.allLit ? 999 : (this.state.lit[id] || 0)); });
    const chips = (CFG.cats || []).map((q) => ({ id: 'chip-' + q[0], href: '#g-' + q[0], t: q[1], cls: q[0] === this.state.active ? 'on' : '', cur: q[0] === this.state.active ? 'true' : 'false' }));
    const wariant = this.props.wariant || 'Ruch';
    const druk = !!CFG.druk && wariant === 'Druk';
    const narrow = window.innerWidth < 600;
    const close = () => this.setState({ drawer: false });
    return {
      theme: theme, isDark: dark, isLight: !dark,
      themeLabel: dark ? CFG.t.light : CFG.t.dark,
      toggleTheme: () => { const t = dark ? 'light' : 'dark'; try { window.localStorage.setItem('br-theme', t); } catch (e) {} this.setState({ userTheme: t }); },
      rootCls: 'rx' + (still ? ' still' : '') + (this.props.przyciski === 'Zielone' ? ' gbtn' : (this.props.przyciski === 'Zielone bez ramki' ? ' gbtn gflat' : '')),
      c: c,
      callCls: 'call' + (showCall ? '' : ' off'), callHidden: showCall ? 'false' : 'true', callTab: showCall ? '0' : '-1',
      barCls: 'pbar' + (showCall ? '' : ' off'),
      drawerOpen: this.state.drawer,
      openDrawer: () => this.setState({ drawer: true }),
      closeDrawer: close,
      slides: slides, cur: { n: pad(cur + 1), cta: cc.cta, href: cc.href }, total: pad(n),
      prev: () => { this.go((cur - 1 + n) % n); this.startAuto(); },
      next: () => { this.go((cur + 1) % n); this.startAuto(); },
      isPlaying: !paused, isPaused: paused, liveMode: paused ? 'polite' : 'off',
      pauseLabel: paused ? CFG.t.play : CFG.t.pause,
      togglePause: () => { this.setState({ paused: !this.state.paused }); this.startAuto(); },
      pDown: (e) => {
        if (n < 2 || (e.button !== undefined && e.button !== 0)) return;
        const tg = e.target;
        if (tg && tg.closest && tg.closest('button, a')) return;
        this.drag = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false, el: e.currentTarget };
      },
      pMove: (e) => {
        const d = this.drag;
        if (!d || e.pointerId !== d.id) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.on) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { this.drag = null; return; }
          if (Math.abs(dx) < 8) return;
          d.on = true;
          try { d.el.setPointerCapture(d.id); } catch (x) {}
        }
        this.setState({ dragX: dx });
      },
      pUp: (e) => {
        const d = this.drag;
        this.drag = null;
        if (!d || !d.on) return;
        const dx = e.clientX - d.x;
        const w = d.el ? d.el.clientWidth : 400;
        const lim = Math.min(80, w * 0.18);
        if (dx < -lim) this.go((cur + 1) % n);
        else if (dx > lim) this.go((cur - 1 + n) % n);
        this.setState({ dragX: 0 });
        this.startAuto();
      },
      carCls: 'car' + (this.state.dragX ? ' dragging' : ''),
      w: w, px: px, chips: chips,
      mapOpen: this.state.mapOpen, mapClosed: !this.state.mapOpen,
      showMap: () => this.setState({ mapOpen: true }),
      isRuch: !druk, drukDesk: druk && !narrow, drukMob: druk && narrow, drukTheme: p || 'auto'
    };
  }
}
