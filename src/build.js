// Builds the static Beef & Reef website into ../dist from shared templates.
// Menu data is read from the design's MenuList component so the web menu matches the canvas.
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'docs');
const MENU_SRC = process.argv[2] || path.join(__dirname, 'menu-source.dc.html');
const PHONE = '+48 222 538 860';
const TEL = 'tel:+48222538860';
const BOOK = 'https://online.beefandreef.pl/booking';
const DELIVERY = 'https://online.beefandreef.pl/delivery';
const MAIL = 'kontakt@beefandreef.pl';
const FB = 'https://www.facebook.com/beef.and.reef.wilanow';
const IG = 'https://www.instagram.com/beef.and.reef_steak_seafood';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const moon = '<svg class="i-moon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const sun = '<svg class="i-sun" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';

function head({ title, desc, page }) {
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/hero-poster.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/cormorant-garamond-latin-ext-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
<script>try{var t=localStorage.getItem('br-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Beef & Reef', servesCuisine: ['Steakhouse', 'Seafood'],
    telephone: '+48222538860', email: MAIL, priceRange: '$$$',
    address: { '@type': 'PostalAddress', streetAddress: 'Kazachska 1', postalCode: '02-999', addressLocality: 'Warszawa', addressCountry: 'PL' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '12:00', closes: '22:30' }],
    sameAs: [FB, IG], acceptsReservations: true
  })}</script>
</head>
<body class="page-${page}">
<a class="skip" href="#tresc">Przejdź do treści</a>
`;
}

function header(current, anchors) {
  const nav = [
    ['index.html', 'Menu', 'menu.html', 'menu'],
    [null, 'Przyjęcia', 'przyjecia.html', 'party'],
    [null, 'O nas', anchors.about, 'about'],
    [null, 'Szef kuchni', anchors.chef, 'chef'],
    [null, 'Kontakt', anchors.contact, 'contact']
  ];
  const cur = (k) => (k === current ? ' aria-current="page"' : '');
  const long = { menu: 'Menu', party: 'Przyjęcia i eventy', about: 'O nas', chef: 'Szef kuchni', contact: 'Kontakt' };
  return `<header class="site-header">
  <div class="header-bar">
    <div class="header-left">
      <a class="logo" href="index.html" aria-label="Beef &amp; Reef — strona główna"><img src="assets/img/logo-seal-192.png" alt="" width="56" height="56"></a>
      <nav class="nav-desk" aria-label="Główna">
${nav.map(([, l, h, k]) => `        <a href="${h}"${cur(k)}>${l}</a>`).join('\n')}
      </nav>
    </div>
    <div class="header-right">
      <div class="lang"><a href="#" aria-current="true" aria-label="Polski">PL</a><span aria-hidden="true" class="muted">/</span><a href="menu.html?lang=en" lang="en" aria-label="English menu">EN</a></div>
      <button class="icon-btn theme-btn" type="button" aria-pressed="false" data-label-dark="Włącz tryb ciemny" data-label-light="Włącz tryb jasny" aria-label="Włącz tryb ciemny">${moon}${sun}</button>
      <a class="call-desk" href="${TEL}"><span>Zadzwoń</span><span class="sep" aria-hidden="true"></span><span class="num">${PHONE}</span></a>
      <a class="call-mobile" href="${TEL}">Zadzwoń</a>
      <button class="icon-btn burger" type="button" aria-controls="menu-mobilne" aria-expanded="false" aria-label="Otwórz menu" data-label-open="Otwórz menu" data-label-close="Zamknij menu"><span class="burger-lines" aria-hidden="true"><span></span><span></span><span></span></span></button>
    </div>
  </div>
  <nav id="menu-mobilne" class="mnav" aria-label="Menu główne" hidden>
${nav.map(([, , h, k]) => `    <a href="${h}"${cur(k)}>${long[k]}</a>`).join('\n')}
    <div class="lang"><a href="#" aria-current="true" aria-label="Polski">PL</a><span aria-hidden="true" class="muted">/</span><a href="menu.html?lang=en" lang="en" aria-label="English menu">EN</a></div>
    <a class="btn btn-gold" href="${TEL}">Zadzwoń · ${PHONE}</a>
  </nav>
</header>
`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="col brand wide"><img src="assets/img/logo-seal-192.png" alt="Beef &amp; Reef" width="88" height="88" loading="lazy"><p>STEAKHOUSE · SEAFOOD</p></div>
      <div class="col wide"><h2>Odwiedź nas</h2><p>Kazachska 1<br>02-999 Warszawa</p><p style="margin-top:8px">Codziennie 12:00 – 22:30<br>Kuchnia czynna do 22:00</p></div>
      <div class="col wide"><h2>Rezerwacje</h2><a class="nowrap" href="${TEL}">${PHONE}</a><a href="mailto:${MAIL}">${MAIL}</a><a href="${BOOK}">Rezerwacja online</a></div>
      <nav class="col" aria-label="Stopka"><h2>Na skróty</h2><a href="menu.html">Menu</a><a href="przyjecia.html">Przyjęcia i eventy</a><a href="index.html#o-nas">O nas</a><a href="index.html#kontakt">Kontakt</a></nav>
      <div class="col"><h2>Obserwuj nas</h2><a href="${FB}">Facebook</a><a href="${IG}">Instagram</a><a class="dim" href="${DELIVERY}">Zamów online z dostawą</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 BEEF &amp; REEF</span><nav aria-label="Informacje prawne"><a href="#">POLITYKA PRYWATNOŚCI</a><a href="#">COOKIES</a></nav></div>
  </div>
</footer>
`;
}

function actionBar(alt) {
  return `<div class="action-bar"><a class="call" href="${TEL}">Zadzwoń</a><a class="alt" href="${alt.href}">${alt.label}</a></div>
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

const contactSection = `  <section id="kontakt" class="section contact" aria-labelledby="contact-title">
    <div class="contact-wrap">
      <h2 id="contact-title" class="section-title">Rezerwacja i kontakt</h2>
      <div class="contact-grid">
        <div><h3 class="label">Adres</h3><p class="val">Kazachska 1<br>02-999 Warszawa</p><a class="u" href="https://maps.google.com/?q=Kazachska+1,+02-999+Warszawa" style="font-size:17px;padding:10px 0">Wyznacz trasę</a></div>
        <div><h3 class="label">Rezerwacje</h3><a class="val nowrap" href="${TEL}">${PHONE}</a><a class="val" href="mailto:${MAIL}">${MAIL}</a></div>
        <div><h3 class="label">Godziny otwarcia</h3><p class="val">Codziennie: 12:00 – 22:30<br>Kuchnia czynna do 22:00</p></div>
      </div>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">Zadzwoń i zarezerwuj</a><a class="btn btn-line" href="${BOOK}">Rezerwacja online</a></div>
      <div class="map placeholder" role="img" aria-label="Miejsce na mapę dojazdu">[MAPA GOOGLE — KAZACHSKA 1]</div>
    </div>
  </section>
`;

/* ---------------- Home ---------------- */
function home() {
  return head({ title: 'Beef & Reef — steki i owoce morza w Wilanowie', desc: 'Steakhouse i owoce morza w Wilanowie, Kazachska 1, Warszawa. Rezerwacje telefoniczne: +48 222 538 860. Codziennie 12:00–22:30.', page: 'home' })
    + header('home', { about: '#o-nas', chef: '#szef', contact: '#kontakt' }) + `
<main id="tresc" tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="assets/img/hero-poster.jpg" aria-hidden="true" tabindex="-1"><source src="assets/video/hero.mp4" type="video/mp4"></video>
    <div class="hero-veil" aria-hidden="true"></div>
    <div class="hero-inner">
      <div class="masthead">
        <h1 id="hero-title" class="wordmark">BEEF &amp; REEF</h1>
        <p class="tagline">STEAKHOUSE · SEAFOOD</p>
        <div class="double-rule" aria-hidden="true"><span></span><span></span></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:16px">
        <p class="label">Rezerwacje telefoniczne</p>
        <a class="hero-phone" href="${TEL}">${PHONE}</a>
      </div>
      <div class="btn-row" style="margin-top:8px"><a class="btn btn-gold" href="${TEL}">Zadzwoń i zarezerwuj</a><a class="btn btn-line-light" href="${BOOK}">Rezerwacja online</a></div>
      <a class="u" href="menu.html" style="padding:10px 0">Zobacz menu</a>
      <div class="hero-hours">
        <div><span class="label">Codziennie</span><span>12:00 – 22:30</span></div>
        <div><span class="label">Kuchnia</span><span>do 22:00</span></div>
        <div><span class="label">Adres</span><a href="#kontakt">Kazachska 1, Warszawa</a></div>
      </div>
    </div>
    <button class="video-toggle" type="button" aria-pressed="false" data-label-pause="Zatrzymaj wideo" data-label-play="Odtwórz wideo">Zatrzymaj wideo</button>
  </section>

  <section class="section bg-warm" aria-labelledby="menu-title">
    <div class="wrap">
      <div class="center-head"><h2 id="menu-title" class="section-title">Menu</h2><p>Steki z najlepszych hodowli, przygotowywane z najwyższą precyzją, oraz regularnie dostarczane owoce morza.</p></div>
      <div class="dish-grid">
        <article class="dish-card"><div class="plate"><div class="placeholder round" role="img" aria-label="Miejsce na zdjęcie: stek z polędwicy">[ZDJĘCIE:<br>STEK Z POLĘDWICY]</div></div><h3>Stek z polędwicy</h3><p>Polędwica wołowa (filet mignon), wyjątkowo krucha i soczysta, o naturalnym, szlachetnym smaku</p><p class="price">200 g · 119 / 300 g · 179</p></article>
        <article class="dish-card"><div class="plate"><img src="assets/img/macka-osmiornicy.webp" alt="Macka ośmiornicy z cukinią i czerwonym kawiorem na białym talerzu" width="1000" height="903" loading="lazy"></div><h3>Macka ośmiornicy</h3><p>Ośmiornica, seler naciowy, kapary, cukinia, białe wino, oliwki, opiekane ziemniaki</p><p class="price">109</p></article>
        <article class="dish-card"><div class="plate"><img src="assets/img/piers-z-kaczki.webp" alt="Pierś z kaczki z sosem pomarańczowym i brokułem na białym talerzu" width="1000" height="909" loading="lazy"></div><h3>Pierś z kaczki</h3><p>Pierś z kaczki sous-vide, sos pomarańczowy, purée selerowe, brokuł łodygowy</p><p class="price">109</p></article>
      </div>
      <div class="teaser-foot">
        <a class="btn btn-ink" href="menu.html">Zobacz pełne menu</a>
        <p class="links"><span class="muted">Menu do pobrania:</span><a class="u" href="#">PDF po polsku</a><a class="u" href="#" lang="en">PDF in English</a></p>
        <p class="label muted">Ceny w PLN</p>
      </div>
    </div>
  </section>

  <section id="o-nas" class="section" aria-labelledby="about-title">
    <div class="narrow">
      <h2 id="about-title" class="section-title">O nas</h2>
      <p class="lead">Miejsce stworzone z pasji do najwyższej jakości steków oraz świeżych owoców morza.</p>
      <p>Łączymy klasyczne techniki kulinarne z nowoczesnym podejściem, tworząc dania o wyrazistym smaku, perfekcyjnej teksturze i wyjątkowej estetyce. Tworzymy miejsce, w którym doskonała kuchnia spotyka się z elegancką atmosferą i profesjonalną obsługą — idealną przestrzeń na wyjątkową kolację, spotkanie biznesowe i celebrację ważnych chwil.</p>
    </div>
    <div class="event-box">
      <span class="amp" aria-hidden="true">&amp;</span>
      <p class="eyebrow">W wybrane dni można doświadczyć:</p>
      <p class="big">Muzyki na żywo<br>Live cookingu*</p>
      <p class="note">*Siekany tatar wołowy przy stole oraz smażone krewetki z chorizo w formie live cookingu.</p>
      <a class="u" href="${TEL}" style="font-size:17px;padding:10px 0">Zapytaj o najbliższe terminy: ${PHONE}</a>
    </div>
  </section>

  <section id="szef" class="section bg-warm" aria-labelledby="chef-title">
    <div class="split">
      <div class="media placeholder" role="img" aria-label="Miejsce na zdjęcie szefa kuchni">[ZDJĘCIE: KLAUDIUSZ DANOWSKI]</div>
      <div class="text">
        <p class="eyebrow">Szef kuchni</p>
        <h2 id="chef-title" class="title">Klaudiusz Danowski</h2>
        <div class="short-rule" aria-hidden="true"></div>
        <p>Sercem naszej kuchni jest szef kuchni Klaudiusz Danowski, który z niezwykłą dbałością o detale komponuje każde danie, bazując wyłącznie na starannie wyselekcjonowanych produktach.</p>
        <p>Nasze steki pochodzą z najlepszych hodowli i są przygotowywane z najwyższą precyzją, aby osiągnąć idealny stopień wysmażenia i głębię smaku. Owoce morza dostarczane są regularnie, co gwarantuje ich świeżość i najwyższą jakość.</p>
      </div>
    </div>
  </section>

  <section id="przyjecia" class="section" aria-labelledby="party-title">
    <div class="split reverse">
      <div class="text">
        <p class="eyebrow">Przyjęcia i eventy</p>
        <h2 id="party-title" class="title">Świętuj z nami</h2>
        <div class="short-rule" aria-hidden="true"></div>
        <p>Organizujemy przyjęcia w naszej restauracji — wesela, urodziny, przyjęcia świąteczne i spotkania firmowe. Chcesz mieć restaurację tylko dla siebie i swoich gości? Zarezerwujemy ją na wyłączność.</p>
        <div class="actions"><a class="btn btn-ink" href="przyjecia.html">Poznaj ofertę</a><a class="u nowrap" href="${TEL}" style="display:inline-flex;align-items:center;min-height:56px">Zapytaj: ${PHONE}</a></div>
      </div>
      <div class="media placeholder" role="img" aria-label="Miejsce na zdjęcie sali przygotowanej na przyjęcie">[ZDJĘCIE: SALA NA PRZYJĘCIE]</div>
    </div>
  </section>

${contactSection}</main>
` + footer() + actionBar({ href: BOOK, label: 'Online' });
}

/* ---------------- Menu ---------------- */
function loadMenu(lang) {
  const html = fs.readFileSync(MENU_SRC, 'utf8');
  const code = html.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
  class DCLogic { constructor(p) { this.props = p || {}; this.state = {}; } }
  const Component = new Function('DCLogic', code + '\n;return Component;')(DCLogic);
  const c = new Component({ lang });
  c.props = { lang };
  return c.renderVals();
}
const CATS = [
  ['steaks', 'Steki', 'Steaks'], ['fish', 'Ryby i owoce morza', 'Fish & Seafood'], ['starters', 'Przystawki i sałatki', 'Starters & Salads'],
  ['mains', 'Makarony i dania główne', 'Pasta & Mains'], ['soups', 'Zupy i sandwiche', 'Soups & Sandwiches'], ['desserts', 'Desery', 'Desserts'],
  ['drinks', 'Kawa, herbata, napoje', 'Coffee, Tea & Soft Drinks'], ['bar', 'Piwo, alkohole, koktajle', 'Beer, Spirits & Cocktails'], ['wine', 'Wina', 'Wine']
];
function renderMenu(lang) {
  const v = loadMenu(lang);
  const suffix = lang === 'en' ? '-en' : '';
  const out = v.groups.map((g) => {
    const gid = g.anchor.replace(/^g-/, '');
    const cols = g.cols.map((col) => `<div class="m-col">${col.sections.map((s) => {
      let inner = '';
      if (s.isDishes) inner = `<div class="m-dishes">${s.items.map((it) => `<article class="m-dish"><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p><p class="price">${esc(it.price)}</p></article>`).join('')}</div>`;
      if (s.isList) inner = `<div class="m-list">${s.items.map((it) => it.isSub ? `<h3>${esc(it.name)}</h3>` : `<p class="m-row"><span>${esc(it.name)}</span><span>${esc(it.price)}</span></p>`).join('')}</div>`;
      return `<section class="m-section">${s.hasTitle ? `<h2 class="section-title">${esc(s.title)}</h2>` : ''}${inner}</section>`;
    }).join('')}</div>`).join('');
    return `<div class="m-group" id="${g.anchor}${suffix}" data-group="${gid}">${g.notFirst ? '<div class="double-rule m-sep" aria-hidden="true"><span></span><span></span></div>' : ''}${g.hasTitle ? `<h2 class="section-title">${esc(g.title)}</h2>` : ''}<div class="m-cols">${cols}</div></div>`;
  }).join('\n');
  return `<div class="menu-list" lang="${lang}"${lang === 'en' ? ' hidden' : ''}>\n${out}\n<p class="price-note">${esc(v.priceNote)}</p>\n</div>`;
}
function menuPage() {
  const labels = { pl: {}, en: {} };
  CATS.forEach(([id, pl, en]) => { labels.pl[id] = pl; labels.en[id] = en; });
  return head({ title: 'Menu — Beef & Reef', desc: 'Menu restauracji Beef & Reef: steki Black Angus, ryby i owoce morza, przystawki, desery, wina i koktajle. Ceny w PLN.', page: 'menu' })
    + header('menu', { about: 'index.html#o-nas', chef: 'index.html#szef', contact: 'index.html#kontakt' }) + `
<main id="tresc" tabindex="-1">
  <section class="menu-head" aria-labelledby="menu-h1">
    <h1 id="menu-h1" class="wordmark">BEEF &amp; REEF</h1>
    <p class="tagline">STEAKHOUSE · SEAFOOD</p>
    <div class="double-rule" aria-hidden="true"><span></span><span></span></div>
    <div class="menu-tools">
      <div class="seg" role="group" aria-label="Język menu / Menu language"><button type="button" data-lang="pl" aria-pressed="true">PL</button><button type="button" data-lang="en" lang="en" aria-pressed="false">EN</button></div>
      <a class="u" href="#" style="font-size:17px;padding:12px 0" data-i18n-pl="Pobierz menu w PDF" data-i18n-en="Download PDF menu">Pobierz menu w PDF</a>
      <span class="label muted" data-i18n-pl="Ceny w PLN" data-i18n-en="Prices in PLN">Ceny w PLN</span>
    </div>
  </section>
  <nav class="cat-bar" aria-label="Kategorie menu"><div class="chips">
${CATS.map(([id, pl], i) => `    <a href="#g-${id}" data-id="${id}"${i === 0 ? ' aria-current="location"' : ''}>${pl}</a>`).join('\n')}
  </div></nav>
  <script type="application/json" id="chip-labels">${JSON.stringify(labels)}</script>
  <div class="menu-body">
${renderMenu('pl')}
${renderMenu('en')}
  </div>
  <section class="section" aria-labelledby="res-title">
    <div class="res-block">
      <h2 id="res-title" class="section-title" data-i18n-pl="Zarezerwuj stolik" data-i18n-en="Reserve a table">Zarezerwuj stolik</h2>
      <a class="phone" href="${TEL}">${PHONE}</a>
      <p data-i18n-pl="Codziennie 12:00 – 22:30 · Kuchnia czynna do 22:00" data-i18n-en="Daily 12:00 – 22:30 · Kitchen open until 22:00">Codziennie 12:00 – 22:30 · Kuchnia czynna do 22:00</p>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">Zadzwoń</a><a class="btn btn-line" href="${BOOK}">Rezerwacja online</a></div>
    </div>
  </section>
</main>
` + footer() + actionBar({ href: BOOK, label: 'Online' });
}

/* ---------------- Party ---------------- */
function partyPage() {
  const mailto = `mailto:${MAIL}?subject=Zapytanie%20o%20przyj%C4%99cie`;
  return head({ title: 'Przyjęcia i eventy — Beef & Reef', desc: 'Przyjęcia w Beef & Reef w Wilanowie: wesela, urodziny, przyjęcia świąteczne, spotkania firmowe. Restauracja na wyłączność. Zadzwoń: +48 222 538 860.', page: 'party' })
    + header('party', { about: 'index.html#o-nas', chef: 'index.html#szef', contact: '#zapytanie' }) + `
<main id="tresc" tabindex="-1">
  <section class="party-intro" aria-labelledby="party-h1">
    <div class="inner">
      <p class="label" style="letter-spacing:.35em">Przyjęcia i eventy</p>
      <h1 id="party-h1">Twoje przyjęcie w Beef &amp; Reef</h1>
      <div class="double-rule" aria-hidden="true" style="width:min(520px,100%)"><span></span><span></span></div>
      <p class="intro">Organizujemy przyjęcia w naszej restauracji — od kameralnych kolacji po wydarzenia na całą salę. Wszystkie szczegóły ustalamy z Tobą indywidualnie.</p>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">Zadzwoń i zapytaj</a><a class="btn btn-line" href="${mailto}">Napisz do nas</a></div>
    </div>
  </section>
  <div class="wide-photo"><div class="placeholder" role="img" aria-label="Miejsce na zdjęcie sali przygotowanej na przyjęcie">[ZDJĘCIE: SALA NA PRZYJĘCIE]</div></div>

  <section class="section" aria-labelledby="okazje-title">
    <div class="wrap stack">
      <h2 id="okazje-title" class="section-title">Okazje</h2>
      <ul class="occasions">
        <li><h3>Wesela</h3><p>Przyjęcie weselne w eleganckiej oprawie</p></li>
        <li><h3>Urodziny</h3><p>Urodziny, jubileusze i rocznice</p></li>
        <li><h3>Przyjęcia świąteczne</h3><p>Wigilie firmowe i spotkania świąteczne</p></li>
        <li><h3>Spotkania firmowe</h3><p>Kolacje biznesowe i wydarzenia dla zespołów</p></li>
      </ul>
      <p style="text-align:center">…i każda inna okazja, którą chcesz świętować.</p>
    </div>
  </section>

  <section class="section bg-warm" aria-labelledby="wylacznosc-title">
    <div class="exclusive">
      <span class="amp" aria-hidden="true">&amp;</span>
      <p class="eyebrow">Tylko dla Ciebie i Twoich gości</p>
      <h2 id="wylacznosc-title">Restauracja<br>na wyłączność</h2>
      <p>Chcesz, aby cała restauracja była tylko dla Was? Nie ma problemu — zarezerwujemy ją na wyłączność na Twoje wydarzenie.</p>
    </div>
  </section>

  <section class="section" aria-labelledby="jak-title">
    <div class="wrap stack" style="max-width:1120px">
      <h2 id="jak-title" class="section-title">Jak to działa</h2>
      <ol class="steps">
        <li><span class="num" aria-hidden="true">I</span><h3>Skontaktuj się z nami</h3><p>Zadzwoń lub napisz — powiedz nam, jaką okazję chcesz świętować.</p></li>
        <li><span class="num" aria-hidden="true">II</span><h3>Ustalimy szczegóły</h3><p>Termin, liczbę gości, menu i oprawę dopasujemy indywidualnie do Twoich potrzeb.</p></li>
        <li><span class="num" aria-hidden="true">III</span><h3>Świętujcie</h3><p>Resztą zajmiemy się my — Ty możesz cieszyć się chwilą z gośćmi.</p></li>
      </ol>
    </div>
  </section>

  <section id="zapytanie" class="section" style="padding-top:0" aria-labelledby="zapytanie-title">
    <div class="inquiry">
      <h2 id="zapytanie-title" class="section-title">Zapytaj o przyjęcie</h2>
      <a class="phone" href="${TEL}">${PHONE}</a>
      <a class="u" href="${mailto}" style="font-size:22px;padding:6px 0">${MAIL}</a>
      <p>Codziennie 12:00 – 22:30 · Kazachska 1, Warszawa</p>
      <div class="btn-row" style="margin-top:12px"><a class="btn btn-gold" href="${TEL}">Zadzwoń i zapytaj</a><a class="btn btn-line" href="${mailto}">Napisz e-mail</a></div>
    </div>
  </section>
</main>
` + footer() + actionBar({ href: mailto, label: 'E-mail' });
}

fs.writeFileSync(path.join(DIST, 'index.html'), home());
fs.writeFileSync(path.join(DIST, 'menu.html'), menuPage());
fs.writeFileSync(path.join(DIST, 'przyjecia.html'), partyPage());
fs.writeFileSync(path.join(DIST, '404.html'), head({ title: 'Nie znaleziono strony — Beef & Reef', desc: 'Strona nie istnieje.', page: '404' }) + header('', { about: 'index.html#o-nas', chef: 'index.html#szef', contact: 'index.html#kontakt' }) + `
<main id="tresc" tabindex="-1"><section class="section"><div class="narrow"><h1 class="title">Nie znaleziono strony</h1><p>Ta strona nie istnieje. Wróć na <a class="u" href="index.html">stronę główną</a> lub zadzwoń: <a class="u nowrap" href="${TEL}">${PHONE}</a>.</p></div></section></main>
` + footer() + actionBar({ href: BOOK, label: 'Online' }));
console.log('built');
