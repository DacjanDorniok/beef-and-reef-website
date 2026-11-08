// Builds the static Beef & Reef website into ../docs (served by GitHub Pages).
// Polish pages live in the root, English pages in /en. Menu data is read from the design's
// MenuList component (src/menu-source.dc.html) so the web menu matches the design canvas.
// Rebuild: node src/build.js
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'docs');
// Cache-busting: CSS/JS links carry a hash of the file, so phones never mix new HTML with an old cached stylesheet.
const ver = (f) => require('crypto').createHash('md5').update(fs.readFileSync(path.join(DIST, f))).digest('hex').slice(0, 8);
const V_CSS = ver('assets/css/style.css');
const V_JS = ver('assets/js/main.js');
const MENU_SRC = process.argv[2] || path.join(__dirname, 'menu-source.dc.html');
const PHONE = '+48 222 538 860';
const TEL = 'tel:+48222538860';
const BOOK = 'https://online.beefandreef.pl/booking';
const DELIVERY = 'https://online.beefandreef.pl/delivery';
const MAIL = 'kontakt@beefandreef.pl';
const FB = 'https://www.facebook.com/beef.and.reef.wilanow';
const IG = 'https://www.instagram.com/beef.and.reef_steak_seafood';
const MAPS = 'https://www.google.com/maps/dir/?api=1&amp;destination=Beef%20%26%20Reef%2C%20Kazachska%201%2C%2002-999%20Warszawa';
const MAPS_OPEN = 'https://www.google.com/maps/search/?api=1&amp;query=Beef%20%26%20Reef%2C%20Kazachska%201%2C%2002-999%20Warszawa';
const MAPS_EMBED = 'https://www.google.com/maps?q=Beef+%26+Reef,+Kazachska+1,+02-999+Warszawa&amp;output=embed';
const arrow = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const handset = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
// Seasonal event block on the home page (PL + EN). Set on:false to hide it; it also hides itself after `until` (main.js).
const EVENT = {
  on: true, until: '2026-11-15',
  img: 'rogale-swietomarcinskie.webp', img800: 'rogale-swietomarcinskie-800.webp', w: 1600, h: 1222,
  pl: { badge: 'Od 7 do 15 listopada', kicker: 'Zapraszamy na wyjątkowe menu', title: 'Z okazji Świętego Marcina',
    text: 'Królować będzie gęsina, przygotowana z dbałością o każdy detal, w autorskich odsłonach naszego Szefa Kuchni.',
    book: 'Zarezerwuj stolik', noteHead: 'Dodatkowo <span class="nowrap"><b>11</b> listopada</span>',
    note: 'Serwujemy oryginalne rogale świętomarcińskie sprowadzane z certyfikowanej piekarni w Poznaniu.',
    alt: 'Rogale świętomarcińskie z lukrem i orzechami na papierze' },
  en: { badge: '7 to 15 November', kicker: 'Join us for a special menu', title: 'Celebrating St. Martin’s Day',
    text: 'Goose takes centre stage, prepared with care down to the last detail, in our head chef’s own creations.',
    book: 'Book a table', noteHead: 'Also on <span class="nowrap"><b>11</b> November</span>',
    note: 'We serve original St. Martin’s croissants (rogale świętomarcińskie) from a certified bakery in Poznań.',
    alt: 'St. Martin’s croissants with icing and nuts on paper' }
};
const noise = (id) => `<svg class="noise" aria-hidden="true" width="100%" height="100%"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
const badge = (text) => `<p class="badge"><span class="badge-frame" aria-hidden="true"></span><span class="badge-text">${text}</span></p>`;
// Public address of the site (used for og:image, og:url and hreflang). Change it when the site moves to its own domain.
const SITE = 'https://dacjandorniok.github.io/beef-and-reef-website/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------------- Pages and links ---------------- */
const PAGES = {
  pl: { home: 'index.html', menu: 'menu.html', party: 'przyjecia.html', privacy: 'polityka-prywatnosci.html', cookies: 'cookies.html' },
  en: { home: 'en/index.html', menu: 'en/menu.html', party: 'en/parties.html', privacy: 'en/privacy.html', cookies: 'en/cookies.html' }
};
const ANCHOR = {
  pl: { about: 'o-nas', chef: 'szef', contact: 'kontakt', enquiry: 'zapytanie', content: 'tresc' },
  en: { about: 'about', chef: 'chef', contact: 'contact', enquiry: 'enquiry', content: 'content' }
};
// relative link from one output file to another
function rel(from, to) {
  const r = path.posix.relative(path.posix.dirname(from), to);
  return r || path.posix.basename(to);
}

/* ---------------- Copy ---------------- */
const T = {
  pl: {
    skip: 'Przejdź do treści', logo: 'Beef &amp; Reef — strona główna', navLabel: 'Główna', mainMenu: 'Menu główne',
    home: 'Start', menu: 'Menu', party: 'Przyjęcia', partyLong: 'Przyjęcia i eventy', about: 'O nas', contact: 'Kontakt',
    other: 'EN', otherAria: 'English version', otherLang: 'en',
    themeDark: 'Włącz tryb ciemny', themeLight: 'Włącz tryb jasny', open: 'Otwórz menu', close: 'Zamknij menu',
    drawerCall: 'Zadzwoń', barCall: 'Zadzwoń', email: 'E-mail',
    // footer
    visit: 'Odwiedź nas', daily: 'Codziennie', kitchenOpen: 'Kuchnia czynna do 22:00', reserve: 'Rezerwacje', online: 'Rezerwacja online',
    shortcuts: 'Na skróty', footerLabel: 'Stopka', follow: 'Obserwuj nas', delivery: 'Zamów online z dostawą',
    privacy: 'POLITYKA PRYWATNOŚCI', legalLabel: 'Informacje prawne', city: 'Warszawa'
  },
  en: {
    skip: 'Skip to content', logo: 'Beef &amp; Reef — home', navLabel: 'Main', mainMenu: 'Main menu',
    home: 'Home', menu: 'Menu', party: 'Parties', partyLong: 'Parties &amp; events', about: 'About', contact: 'Contact',
    other: 'PL', otherAria: 'Wersja polska', otherLang: 'pl',
    themeDark: 'Switch to dark mode', themeLight: 'Switch to light mode', open: 'Open menu', close: 'Close menu',
    drawerCall: 'Call us', barCall: 'Call', email: 'Email',
    visit: 'Visit us', daily: 'Daily', kitchenOpen: 'Kitchen open until 22:00', reserve: 'Reservations', online: 'Book online',
    shortcuts: 'Explore', footerLabel: 'Footer', follow: 'Follow us', delivery: 'Order online for delivery',
    privacy: 'PRIVACY POLICY', legalLabel: 'Legal information', city: 'Warsaw'
  }
};

const moon = '<svg class="i-moon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const sun = '<svg class="i-sun" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const globe = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9s1.2-6.4 3.7-9z"/></svg>';
const cross = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';

/* ---------------- Shared parts ---------------- */
function alternates(ctx) {
  if (!(ctx.page in PAGES.pl)) return '';
  const url = (f) => SITE + f.replace(/(^|\/)index\.html$/, '$1');
  return `<link rel="canonical" href="${url(ctx.file)}">
<link rel="alternate" hreflang="pl" href="${url(PAGES.pl[ctx.page])}">
<link rel="alternate" hreflang="en" href="${url(PAGES.en[ctx.page])}">
<link rel="alternate" hreflang="x-default" href="${url(PAGES.pl[ctx.page])}">
`;
}
function head(ctx, { title, desc, extraHead = '' }) {
  const a = (p) => rel(ctx.file, p);
  return `<!doctype html>
<html lang="${ctx.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${ctx.lang === 'en' ? 'en_GB' : 'pl_PL'}">
<meta property="og:image" content="${SITE}assets/img/og-image.jpg">
<meta property="og:url" content="${SITE}${ctx.file.replace(/(^|\/)index\.html$/, '$1')}">
${alternates(ctx)}
${extraHead}<link rel="icon" type="image/png" sizes="32x32" href="${a('assets/img/favicon-32.png')}">
<link rel="apple-touch-icon" href="${a('assets/img/apple-touch-icon.png')}">
<link rel="preload" href="${a('assets/fonts/cormorant-garamond-latin-ext-400-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${a('assets/css/style.css')}?v=${V_CSS}">
<script>try{var t=localStorage.getItem('br-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Beef & Reef', servesCuisine: ['Steakhouse', 'Seafood'],
    telephone: '+48222538860', email: MAIL, priceRange: '$$$',
    address: { '@type': 'PostalAddress', streetAddress: 'Kazachska 1', postalCode: '02-999', addressLocality: 'Warszawa', addressCountry: 'PL' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '12:00', closes: '23:00' }],
    sameAs: [FB, IG], acceptsReservations: true
  })}</script>
</head>
<body class="page-${ctx.page}">
<a class="skip" href="#${ANCHOR[ctx.lang].content}">${T[ctx.lang].skip}</a>
`;
}

// href to a page key in the same language (optionally with an anchor key)
function link(ctx, key, anchorKey) {
  const target = PAGES[ctx.lang][key];
  const hash = anchorKey ? '#' + ANCHOR[ctx.lang][anchorKey] : '';
  if (target === ctx.file) return hash || rel(ctx.file, target);
  return rel(ctx.file, target) + hash;
}

function header(ctx) {
  const t = T[ctx.lang];
  const contactHref = ctx.page === 'party' ? '#' + ANCHOR[ctx.lang].enquiry : link(ctx, 'home', 'contact');
  const items = [
    ['home', t.home, t.home, link(ctx, 'home')],
    ['menu', t.menu, t.menu, link(ctx, 'menu')],
    ['party', t.party, t.partyLong, link(ctx, 'party')],
    ['about', t.about, t.about, link(ctx, 'home', 'about')],
    ['contact', t.contact, t.contact, contactHref]
  ];
  const cur = (k) => (k === ctx.page ? ' aria-current="page"' : '');
  const otherFile = PAGES[t.otherLang][ctx.page] || PAGES[t.otherLang].home;
  const otherHref = rel(ctx.file, otherFile);
  const plHref = ctx.lang === 'pl' ? link(ctx, ctx.page in PAGES.pl ? ctx.page : 'home') : otherHref;
  const enHref = ctx.lang === 'en' ? link(ctx, ctx.page in PAGES.en ? ctx.page : 'home') : otherHref;
  const curLang = (l) => (l === ctx.lang ? ' aria-current="true"' : '');
  return `<header class="site-header">
  <div class="header-bar">
    <div class="header-left">
      <a class="logo" href="${link(ctx, 'home')}" aria-label="${t.logo}"><img src="${rel(ctx.file, 'assets/img/logo-seal-192.png')}" alt="" width="56" height="56"></a>
      <nav class="nav-desk" aria-label="${t.navLabel}">
${items.map(([k, short, , h]) => `        <a href="${h}"${cur(k)}>${short}</a>`).join('\n')}
      </nav>
    </div>
    <div class="header-right">
      <a class="lang-switch quiet" href="${otherHref}" lang="${t.otherLang}" hreflang="${t.otherLang}" data-lang="${t.otherLang}" aria-label="${t.otherAria}">${globe}<span>${t.other}</span></a>
      <span class="hdr-sep" aria-hidden="true"></span>
      <button class="theme-btn quiet" type="button" aria-pressed="false" data-label-dark="${t.themeDark}" data-label-light="${t.themeLight}" aria-label="${t.themeDark}" title="${t.themeDark}">${moon}${sun}</button>
${ctx.page === 'home' ? `      <div class="call-slot" aria-hidden="true"><a class="btn btn-gold btn-sm" href="${TEL}" tabindex="-1" aria-label="${t.drawerCall}: ${PHONE}">${handset}<span>${PHONE}</span></a></div>\n` : ''}      <button class="icon-btn burger" type="button" aria-controls="menu-mobilne" aria-expanded="false" aria-label="${t.open}" data-label-open="${t.open}" data-label-close="${t.close}"><span class="burger-lines" aria-hidden="true"><span></span><span></span><span></span></span></button>
    </div>
  </div>
  <nav id="menu-mobilne" class="mnav" aria-label="${t.mainMenu}" hidden>
${items.map(([k, , long, h]) => `    <a href="${h}"${cur(k)}>${long}</a>`).join('\n')}
    <div class="lang"><a href="${plHref}" lang="pl" hreflang="pl" data-lang="pl" aria-label="Polski"${curLang('pl')}>PL</a><span aria-hidden="true" class="muted">/</span><a href="${enHref}" lang="en" hreflang="en" data-lang="en" aria-label="English"${curLang('en')}>EN</a></div>
    <a class="btn btn-gold" href="${TEL}">${t.drawerCall} · ${PHONE}</a>
  </nav>
</header>
`;
}

function footer(ctx) {
  const t = T[ctx.lang];
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-mast"><p class="footer-word">BEEF &amp; REEF</p><p class="footer-tag">STEAKHOUSE · SEAFOOD</p></div>
    <div class="double-rule full" aria-hidden="true"><span></span><span></span></div>
    <div class="footer-grid">
      <div class="col wide"><h2>${t.visit}</h2><p>Kazachska 1<br>02-999 Warszawa</p><p style="margin-top:8px">${t.daily} 12:00 – 23:00<br>${t.kitchenOpen}</p></div>
      <div class="col wide"><h2>${t.reserve}</h2><a class="nowrap" href="${TEL}">${PHONE}</a><a href="mailto:${MAIL}">${MAIL}</a><a href="${BOOK}">${t.online}</a></div>
      <nav class="col" aria-label="${t.footerLabel}"><h2>${t.shortcuts}</h2><a href="${link(ctx, 'menu')}">Menu</a><a href="${link(ctx, 'party')}">${t.partyLong}</a><a href="${link(ctx, 'home', 'about')}">${ctx.lang === 'en' ? 'About us' : t.about}</a><a href="${link(ctx, 'home', 'contact')}">${t.contact}</a></nav>
      <div class="col"><h2>${t.follow}</h2><a href="${FB}">Facebook</a><a href="${IG}">Instagram</a><a class="dim" href="${DELIVERY}">${t.delivery}</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 BEEF &amp; REEF · ${ctx.lang === 'en' ? 'PRICES IN PLN' : 'CENY W PLN'}</span><nav aria-label="${t.legalLabel}"><a href="${link(ctx, 'privacy')}"${ctx.page === 'privacy' ? ' aria-current="page"' : ''}>${t.privacy}</a><a href="${link(ctx, 'cookies')}"${ctx.page === 'cookies' ? ' aria-current="page"' : ''}>COOKIES</a></nav></div>
  </div>
</footer>
`;
}

function actionBar(ctx, alt) {
  const t = T[ctx.lang];
  return `<div class="action-bar"><a class="call" href="${TEL}">${t.barCall}</a><a class="alt" href="${alt.href}">${alt.label}</a></div>
${ctx.extraBody || ''}<script src="${rel(ctx.file, 'assets/js/main.js')}?v=${V_JS}" defer></script>
</body>
</html>
`;
}

/* ---------------- First-visit language picker (home pages) ---------------- */
function langPicker(ctx) {
  const pl = rel(ctx.file, PAGES.pl.home);
  const en = rel(ctx.file, PAGES.en.home);
  return `<dialog id="lang-pick" class="lang-pick" aria-labelledby="lp-title" aria-describedby="lp-desc">
  <button class="lp-close" type="button" aria-label="Zamknij · Close">${cross}</button>
  <img src="${rel(ctx.file, 'assets/img/logo-seal-192.png')}" alt="Beef &amp; Reef" width="72" height="72">
  <div class="lp-head">
    <h2 id="lp-title">Witamy <span aria-hidden="true" class="gold">·</span> <span lang="en">Welcome</span></h2>
    <div class="double-rule" aria-hidden="true"><span></span><span></span></div>
    <p id="lp-desc" class="label">Wybierz język · <span lang="en">Choose language</span></p>
  </div>
  <div class="lp-choices">
    <a class="btn btn-gold" href="${pl}" hreflang="pl" data-lang="pl">Polski</a>
    <a class="btn btn-line" href="${en}" lang="en" hreflang="en" data-lang="en">English</a>
  </div>
  <p class="lp-note">Język zmienisz w każdej chwili w nagłówku strony.<br><span lang="en">You can switch the language any time in the header.</span></p>
</dialog>
`;
}

/* ---------------- Home ---------------- */
const HOME = {
  pl: {
    title: 'Beef & Reef — steki i owoce morza w Wilanowie',
    desc: 'Steakhouse i owoce morza w Wilanowie, Kazachska 1, Warszawa. Rezerwacje telefoniczne: +48 222 538 860. Codziennie 12:00–23:00.',
    heroAlt: 'Dwa surowe, marmurkowe antrykoty na drewnianej desce z tymiankiem i papryczkami chili',
    res: 'Rezerwacje telefoniczne', callBook: 'Zadzwoń i zarezerwuj', order: 'Zamów', or: 'lub', book: 'zarezerwuj online',
    daily: 'Codziennie', kitchen: 'Kuchnia', kitchenTime: 'do 22:00', seeMenu: 'Zobacz menu',
    menuLead: 'Steki z najlepszych hodowli, przygotowywane z najwyższą precyzją, oraz regularnie dostarczane owoce morza.',
    dishes: [
      ['stek-z-poledwicy.webp', 1000, 1000, 'Stek z polędwicy z kiełkami groszku i oliwą ziołową na białym talerzu', 'Stek z polędwicy', 'Polędwica wołowa (filet mignon), wyjątkowo krucha i soczysta, o naturalnym, szlachetnym smaku', '200 g · 119 / 300 g · 179'],
      ['macka-osmiornicy.webp', 1000, 903, 'Macka ośmiornicy z cukinią i czerwonym kawiorem na białym talerzu', 'Macka ośmiornicy', 'Ośmiornica, seler naciowy, kapary, cukinia, białe wino, oliwki, opiekane ziemniaki', '109'],
      ['piers-z-kaczki.webp', 1000, 909, 'Pierś z kaczki z sosem pomarańczowym i brokułem na białym talerzu', 'Pierś z kaczki', 'Pierś z kaczki sous-vide, sos pomarańczowy, purée selerowe, brokuł łodygowy', '109']
    ],
    fullMenu: 'Zobacz pełne menu', download: 'Menu do pobrania:', pdfs: [['PDF po polsku', 'pl'], ['PDF in English', 'en']], prices: 'Ceny w PLN',
    aboutTitle: 'O nas', aboutLead: 'Miejsce stworzone z pasji do najwyższej jakości steków oraz świeżych owoców morza.',
    aboutText: 'Łączymy klasyczne techniki kulinarne z nowoczesnym podejściem, tworząc dania o wyrazistym smaku, perfekcyjnej teksturze i wyjątkowej estetyce. Tworzymy miejsce, w którym doskonała kuchnia spotyka się z elegancką atmosferą i profesjonalną obsługą — idealną przestrzeń na wyjątkową kolację, spotkanie biznesowe i celebrację ważnych chwil.',
    eventEyebrow: 'W wybrane dni można doświadczyć:', eventBig: 'Muzyki na żywo<br>Live cookingu*',
    eventNote: '*Siekany tatar wołowy przy stole oraz smażone krewetki z chorizo w formie live cookingu.', eventAsk: 'Zapytaj o najbliższe terminy',
    chefAria: 'Miejsce na zdjęcie szefa kuchni', chefPh: '[ZDJĘCIE: KLAUDIUSZ DANOWSKI]', chefEyebrow: 'Szef kuchni',
    chefText: ['Sercem naszej kuchni jest szef kuchni Klaudiusz Danowski, który z niezwykłą dbałością o detale komponuje każde danie, bazując wyłącznie na starannie wyselekcjonowanych produktach.',
      'Nasze steki pochodzą z najlepszych hodowli i są przygotowywane z najwyższą precyzją, aby osiągnąć idealny stopień wysmażenia i głębię smaku. Owoce morza dostarczane są regularnie, co gwarantuje ich świeżość i najwyższą jakość.'],
    partyEyebrow: 'Przyjęcia i eventy', partyTitle: 'Świętuj z nami',
    partyText: 'Organizujemy przyjęcia w naszej restauracji — wesela, urodziny, przyjęcia świąteczne i spotkania firmowe. Chcesz mieć restaurację tylko dla siebie i swoich gości? Zarezerwujemy ją na wyłączność.',
    partyBtn: 'Poznaj ofertę', partyAsk: 'Zapytaj', partyAria: 'Miejsce na zdjęcie sali przygotowanej na przyjęcie', partyPh: '[ZDJĘCIE: SALA NA PRZYJĘCIE]',
    contactTitle: 'Rezerwacja i kontakt', address: 'Adres', directions: 'Wyznacz trasę', reservations: 'Rezerwacje', hours: 'Godziny otwarcia',
    hoursText: 'Codziennie: 12:00 – 23:00<br>Kuchnia czynna do 22:00', bookOnline: 'Rezerwacja online', mapAria: 'Miejsce na mapę dojazdu', mapPh: '[MAPA GOOGLE — KAZACHSKA 1]'
  },
  en: {
    title: 'Beef & Reef — steakhouse & seafood in Wilanów, Warsaw',
    desc: 'Steakhouse and seafood restaurant in Wilanów, Kazachska 1, Warsaw. Phone reservations: +48 222 538 860. Open daily 12:00–23:00.',
    heroAlt: 'Two raw marbled ribeye steaks on a wooden board with thyme and chillies',
    res: 'Reservations by phone', callBook: 'Call to book', order: 'Order', or: 'or', book: 'book online',
    daily: 'Daily', kitchen: 'Kitchen', kitchenTime: 'until 22:00', seeMenu: 'See the menu',
    menuLead: 'Steaks from the finest farms, prepared with the utmost precision, and seafood delivered regularly.',
    dishes: [
      ['stek-z-poledwicy.webp', 1000, 1000, 'Fillet steak with pea shoots and herb oil on a white plate', 'Fillet Steak', 'Beef fillet (filet mignon), exceptionally tender and juicy, with a pure, refined flavour', '200 g · 119 / 300 g · 179'],
      ['macka-osmiornicy.webp', 1000, 903, 'Octopus tentacle with courgette and red caviar on a white plate', 'Octopus Tentacle', 'Octopus, celery, capers, courgette, white wine, olives, roasted potatoes', '109'],
      ['piers-z-kaczki.webp', 1000, 909, 'Duck breast with orange sauce and broccoli on a white plate', 'Duck Breast', 'Sous-vide duck breast, orange sauce, celeriac purée, tenderstem broccoli', '109']
    ],
    fullMenu: 'See the full menu', download: 'Download the menu:', pdfs: [['PDF in English', 'en'], ['PDF in Polish', 'pl']], prices: 'Prices in PLN',
    aboutTitle: 'About us', aboutLead: 'A place born of a passion for top-quality steaks and fresh seafood.',
    aboutText: 'We combine classic culinary techniques with a modern approach, creating dishes with bold flavour, perfect texture and exceptional presentation. Here fine cooking meets an elegant atmosphere and professional service — the ideal setting for a special dinner, a business meeting or celebrating the moments that matter.',
    eventEyebrow: 'On selected days you can enjoy:', eventBig: 'Live music<br>Live cooking*',
    eventNote: '*Hand-chopped beef tartare at your table and pan-fried prawns with chorizo, cooked live.', eventAsk: 'Ask about upcoming dates',
    chefAria: 'Photo placeholder: head chef', chefPh: '[PHOTO: KLAUDIUSZ DANOWSKI]', chefEyebrow: 'Head chef',
    chefText: ['At the heart of our kitchen is head chef Klaudiusz Danowski, who composes every dish with remarkable attention to detail, using only carefully selected produce.',
      'Our steaks come from the finest farms and are prepared with the utmost precision for perfect doneness and depth of flavour. Our seafood is delivered regularly, guaranteeing freshness and the highest quality.'],
    partyEyebrow: 'Parties &amp; events', partyTitle: 'Celebrate with us',
    partyText: 'We host parties at our restaurant — weddings, birthdays, Christmas parties and corporate events. Want the whole restaurant to yourself and your guests? We’ll reserve it exclusively for you.',
    partyBtn: 'View the offer', partyAsk: 'Ask', partyAria: 'Photo placeholder: room set for a party', partyPh: '[PHOTO: ROOM SET FOR A PARTY]',
    contactTitle: 'Reservations &amp; contact', address: 'Address', directions: 'Get directions', reservations: 'Reservations', hours: 'Opening hours',
    hoursText: 'Daily: 12:00 – 23:00<br>Kitchen open until 22:00', bookOnline: 'Book online', mapAria: 'Map placeholder', mapPh: '[GOOGLE MAP — KAZACHSKA 1]'
  }
};

// Copy added with the "print" direction (St. Martin insert + print menu, 07.11.2026)
const HOME_X = {
  pl: {
    hoursBadge: 'Codziennie 12:00 – 23:00', heroText: 'Steki z najlepszych hodowli i regularnie dostarczane owoce morza. Kuchnia czynna do 22:00.',
    partyShort: 'Organizujemy przyjęcia w naszej restauracji — wesela, urodziny, przyjęcia świąteczne i spotkania firmowe.',
    exclusiveHead: 'Restauracja na wyłączność', exclusiveText: 'Chcesz mieć restaurację tylko dla siebie i swoich gości? Zarezerwujemy ją na wyłączność.',
    mapKicker: 'Jak dojechać', mapPlace: 'Kazachska 1, Warszawa', showMap: 'Pokaż mapę', openMaps: 'Otwórz w Mapach Google',
    newTab: ' (otwiera się w nowej karcie)', mapNote: 'Mapa Google wczyta się dopiero po kliknięciu. Google może wtedy zapisać pliki cookies —', more: 'więcej',
    mapTitle: 'Mapa dojazdu do Beef &amp; Reef, Kazachska 1, Warszawa'
  },
  en: {
    hoursBadge: 'Daily 12:00 – 23:00', heroText: 'Steaks from the finest farms and seafood delivered regularly. Kitchen open until 22:00.',
    partyShort: 'We host parties at our restaurant — weddings, birthdays, Christmas parties and corporate events.',
    exclusiveHead: 'Exclusive hire', exclusiveText: 'Want the whole restaurant to yourself and your guests? We’ll reserve it exclusively for you.',
    mapKicker: 'Getting here', mapPlace: 'Kazachska 1, Warsaw', showMap: 'Show map', openMaps: 'Open in Google Maps',
    newTab: ' (opens in a new tab)', mapNote: 'The Google map loads only after you click. Google may then set cookies —', more: 'learn more',
    mapTitle: 'Map: how to find Beef &amp; Reef, Kazachska 1, Warsaw'
  }
};

function home(lang) {
  const ctx = { lang, page: 'home', file: PAGES[lang].home };
  const c = Object.assign({}, HOME[lang], HOME_X[lang]);
  const ev = EVENT[lang];
  const A = ANCHOR[lang];
  const img = (f) => rel(ctx.file, 'assets/img/' + f);
  ctx.extraBody = langPicker(ctx);
  return head(ctx, { title: c.title, desc: c.desc })
    + header(ctx) + `
<main id="${A.content}" tabindex="-1">
  <section class="hero pg" aria-labelledby="hero-title">
    <h1 id="hero-title" class="wordmark">BEEF &amp; REEF</h1>
    <p class="tagline">STEAKHOUSE · SEAFOOD</p>
    <div class="double-rule full" aria-hidden="true"><span></span><span></span></div>
    <p class="kicker">${c.res}</p>
    <a class="hero-phone" href="${TEL}">${PHONE}</a>
    <p class="hero-text">${c.heroText}</p>
    <div class="hero-cta">
      <a class="btn btn-gold" href="${TEL}">${c.callBook}</a>
      <p class="hero-links"><a class="u" href="${DELIVERY}">${c.order}</a><span>${c.or}</span><a class="u" href="${BOOK}">${c.book}</a></p>
    </div>
    <p class="hero-hours"><span>${c.daily} 12:00 – 23:00</span><span class="hh-dot" aria-hidden="true"></span><span>${c.kitchen} ${c.kitchenTime}</span></p>
    <div class="hero-stage"><img class="hero-img" src="${img('steki-hero.webp')}" srcset="${img('steki-hero-702.webp')} 702w, ${img('steki-hero.webp')} 1404w" sizes="(max-width: 1092px) 116vw, 1180px" width="1404" height="503" alt="${c.heroAlt}" fetchpriority="high"></div>
  </section>
${EVENT.on ? `
  <section id="${lang === 'en' ? 'event' : 'wydarzenie'}" class="section pg event" aria-labelledby="event-title" data-until="${EVENT.until}">
    ${badge(ev.badge)}
    <p class="kicker">${ev.kicker}</p>
    <h2 id="event-title" class="headline">${ev.title}</h2>
    <p class="body-l">${ev.text}</p>
    <a class="u event-book" href="${TEL}">${ev.book}: ${PHONE}</a>
    <div class="event-media">
      <div class="callout"><div class="callout-frame"><p class="kicker">${ev.noteHead}</p><p class="body-l">${ev.note}</p></div></div>
      <div class="event-photo"><img class="fade-photo" src="${img(EVENT.img)}" srcset="${img(EVENT.img800)} 800w, ${img(EVENT.img)} 1600w" sizes="(max-width: 1120px) 100vw, 1120px" width="${EVENT.w}" height="${EVENT.h}" alt="${ev.alt}" loading="lazy" style="height:auto"></div>
    </div>
  </section>
` : ''}
  <section id="${A.about}" class="section pg" aria-labelledby="about-title">
    <div class="narrow">
      <h2 id="about-title" class="section-title">${c.aboutTitle}</h2>
      <p class="lead">${c.aboutLead}</p>
      <p class="body-l">${c.aboutText}</p>
      <a class="u see-menu" href="${link(ctx, 'menu')}">${c.seeMenu}</a>
    </div>
    <div class="event-box">
      <span class="amp" aria-hidden="true">&amp;</span>
      <p class="eyebrow">${c.eventEyebrow.replace(/ (można|you can)/, '<br>$1')}</p>
      <p class="big">${c.eventBig}</p>
      <p class="note">${c.eventNote}</p>
      <a class="u ask" href="${TEL}">${c.eventAsk}: ${PHONE}</a>
    </div>
  </section>

  <section id="${A.chef}" class="section pg" aria-labelledby="chef-title">
    <div class="split">
      <div class="media placeholder" role="img" aria-label="${c.chefAria}">${c.chefPh}</div>
      <div class="text">
        <p class="kicker">${c.chefEyebrow}</p>
        <h2 id="chef-title" class="headline">Klaudiusz Danowski</h2>
        <div class="double-rule short" aria-hidden="true"><span></span><span></span></div>
${c.chefText.map((p) => `        <p class="body-l">${p}</p>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section pg" aria-labelledby="party-title">
    <div class="split reverse">
      <div class="text">
        <p class="kicker">${c.partyEyebrow}</p>
        <h2 id="party-title" class="headline">${c.partyTitle}</h2>
        <p class="body-l">${c.partyShort}</p>
        <div class="callout"><div class="callout-frame"><p class="kicker sm">${c.exclusiveHead}</p><p class="body-l">${c.exclusiveText}</p></div></div>
        <div class="actions"><a class="btn btn-ink" href="${link(ctx, 'party')}">${c.partyBtn}</a><a class="u nowrap" href="${TEL}">${c.partyAsk}: ${PHONE}</a></div>
      </div>
      <div class="media placeholder" role="img" aria-label="${c.partyAria}">${c.partyPh}</div>
    </div>
  </section>

  <section id="${A.contact}" class="section pg contact" aria-labelledby="contact-title">
    <div class="contact-wrap">
      <h2 id="contact-title" class="section-title">${c.contactTitle}</h2>
      <div class="contact-grid">
        <div><h3 class="label">${c.address}</h3><p class="val">Kazachska 1<br>02-999 ${T[lang].city}</p><a class="u ext" href="${MAPS}" target="_blank" rel="noopener">${c.directions}${arrow}<span class="sr-only">${c.newTab}</span></a></div>
        <div><h3 class="label">${c.reservations}</h3><a class="val strong nowrap" href="${TEL}">${PHONE}</a><a class="val" href="mailto:${MAIL}">${MAIL}</a></div>
        <div><h3 class="label">${c.hours}</h3><p class="val">${c.hoursText}</p></div>
      </div>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">${c.callBook}</a><a class="btn btn-line" href="${BOOK}">${c.bookOnline}</a></div>
      <div class="callout map-card">
        <div class="callout-frame map" data-embed="${MAPS_EMBED}" data-title="${c.mapTitle}">
          <svg class="rings" aria-hidden="true" width="640" height="640" viewBox="0 0 640 640" fill="none"><circle cx="320" cy="320" r="96" stroke="#d2ac5a" stroke-opacity=".55" stroke-width=".5"/><circle cx="320" cy="320" r="176" stroke="#d2ac5a" stroke-opacity=".38" stroke-width=".5"/><circle cx="320" cy="320" r="256" stroke="#d2ac5a" stroke-opacity=".22" stroke-width=".5"/><path d="M0 320H640M320 0V640" stroke="#d2ac5a" stroke-opacity=".18" stroke-width=".5"/></svg>
          <div class="map-facade">
            <p class="kicker sm">${c.mapKicker}</p>
            <p class="map-place">${c.mapPlace}</p>
            <a class="btn btn-ink map-dir" href="${MAPS}" target="_blank" rel="noopener">${c.directions}${arrow}<span class="sr-only">${c.newTab}</span></a>
            <div class="map-actions">
              <button class="btn btn-line btn-sm map-load" type="button">${c.showMap}</button>
              <a class="u ext" href="${MAPS_OPEN}" target="_blank" rel="noopener">${c.openMaps}${arrow}<span class="sr-only">${c.newTab}</span></a>
            </div>
            <p class="map-note">${c.mapNote} <a class="u" href="${link(ctx, 'cookies')}">${c.more}</a>.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
` + footer(ctx) + actionBar(ctx, { href: BOOK, label: 'Online' });
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
  const out = v.groups.map((g) => {
    const gid = g.anchor.replace(/^g-/, '');
    const cols = g.cols.map((col) => `<div class="m-col">${col.sections.map((s) => {
      let inner = '';
      if (s.isDishes) inner = `<div class="m-dishes">${s.items.map((it) => `<article class="m-dish"><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p><p class="price">${esc(it.price)}</p></article>`).join('')}</div>`;
      if (s.isList) inner = `<div class="m-list">${s.items.map((it) => it.isSub ? `<h3>${esc(it.name)}</h3>` : `<p class="m-row"><span>${esc(it.name)}</span><span>${esc(it.price)}</span></p>`).join('')}</div>`;
      return `<section class="m-section">${s.hasTitle ? `<h2 class="section-title">${esc(s.title)}</h2>` : ''}${inner}</section>`;
    }).join('')}</div>`).join('');
    return `<div class="m-group" id="${g.anchor}" data-group="${gid}">${g.notFirst ? '<div class="double-rule m-sep" aria-hidden="true"><span></span><span></span></div>' : ''}${g.hasTitle ? `<h2 class="section-title">${esc(g.title)}</h2>` : ''}<div class="m-cols">${cols}</div></div>`;
  }).join('\n');
  return `<div class="menu-list">\n${out}\n<p class="price-note">${esc(v.priceNote)}</p>\n</div>`;
}
const MENU = {
  pl: { title: 'Menu — Beef & Reef', desc: 'Menu restauracji Beef & Reef: steki Black Angus, ryby i owoce morza, przystawki, desery, wina i koktajle. Ceny w PLN.',
    langLabel: 'Język menu', pdf: 'Pobierz menu w PDF', catLabel: 'Kategorie menu', resTitle: 'Zarezerwuj stolik',
    hours: 'Codziennie 12:00 – 23:00 · Kuchnia czynna do 22:00', call: 'Zadzwoń', online: 'Rezerwacja online' },
  en: { title: 'Menu — Beef & Reef', desc: 'The Beef & Reef menu: Black Angus steaks, fish and seafood, starters, desserts, wine and cocktails. Prices in PLN.',
    langLabel: 'Menu language', pdf: 'Download PDF menu', catLabel: 'Menu sections', resTitle: 'Reserve a table',
    hours: 'Daily 12:00 – 23:00 · Kitchen open until 22:00', call: 'Call us', online: 'Book online' }
};
function menuPage(lang) {
  const ctx = { lang, page: 'menu', file: PAGES[lang].menu };
  const c = MENU[lang];
  const idx = lang === 'en' ? 2 : 1;
  // old links used menu.html?lang=en — send them to the English page
  const redirect = lang === 'pl' ? `<script>if(/[?&]lang=en\\b/.test(location.search))location.replace('${PAGES.en.menu}'+location.hash)</script>\n` : '';
  const seg = (l, label) => l === lang
    ? `<a href="${link(ctx, 'menu')}" aria-current="true" lang="${l}">${label}</a>`
    : `<a href="${rel(ctx.file, PAGES[l].menu)}" lang="${l}" hreflang="${l}" data-lang="${l}">${label}</a>`;
  return head(ctx, { title: c.title, desc: c.desc, extraHead: redirect })
    + header(ctx) + `
<main id="${ANCHOR[lang].content}" tabindex="-1">
  <section class="menu-head" aria-labelledby="menu-h1">
    <h1 id="menu-h1" class="wordmark">BEEF &amp; REEF</h1>
    <p class="tagline">STEAKHOUSE · SEAFOOD</p>
    <div class="double-rule" aria-hidden="true"><span></span><span></span></div>
    <div class="menu-tools">
      <div class="seg" role="group" aria-label="${c.langLabel}">${seg('pl', 'PL')}${seg('en', 'EN')}</div>
      <a class="u" href="#" style="font-size:17px;padding:12px 0">${c.pdf}</a>
    </div>
  </section>
  <nav class="cat-bar" aria-label="${c.catLabel}"><div class="chips">
${CATS.map((cat, i) => `    <a href="#g-${cat[0]}" data-id="${cat[0]}"${i === 0 ? ' aria-current="location"' : ''}>${esc(cat[idx])}</a>`).join('\n')}
  </div></nav>
  <div class="menu-body" lang="${lang}">
${renderMenu(lang)}
  </div>
  <section class="section" aria-labelledby="res-title">
    <div class="res-block">
      <h2 id="res-title" class="section-title">${c.resTitle}</h2>
      <a class="phone" href="${TEL}">${PHONE}</a>
      <p>${c.hours}</p>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">${c.call}</a><a class="btn btn-line" href="${BOOK}">${c.online}</a></div>
    </div>
  </section>
</main>
` + footer(ctx) + actionBar(ctx, { href: BOOK, label: 'Online' });
}

/* ---------------- Party ---------------- */
const PARTY = {
  pl: {
    title: 'Przyjęcia i eventy — Beef & Reef', desc: 'Przyjęcia w Beef & Reef w Wilanowie: wesela, urodziny, przyjęcia świąteczne, spotkania firmowe. Restauracja na wyłączność. Zadzwoń: +48 222 538 860.',
    subject: 'Zapytanie%20o%20przyj%C4%99cie', eyebrow: 'Przyjęcia i eventy', h1: 'Twoje przyjęcie w Beef &amp; Reef',
    intro: 'Organizujemy przyjęcia w naszej restauracji — od kameralnych kolacji po wydarzenia na całą salę. Wszystkie szczegóły ustalamy z Tobą indywidualnie.',
    callAsk: 'Zadzwoń i zapytaj', write: 'Napisz do nas', photoAria: 'Miejsce na zdjęcie sali przygotowanej na przyjęcie', photoPh: '[ZDJĘCIE: SALA NA PRZYJĘCIE]',
    occTitle: 'Okazje', occId: 'okazje-title',
    occasions: [['Wesela', 'Przyjęcie weselne w eleganckiej oprawie'], ['Urodziny', 'Urodziny, jubileusze i rocznice'], ['Przyjęcia świąteczne', 'Wigilie firmowe i spotkania świąteczne'], ['Spotkania firmowe', 'Kolacje biznesowe i wydarzenia dla zespołów']],
    occMore: '…i każda inna okazja, którą chcesz świętować.',
    exEyebrow: 'Tylko dla Ciebie i Twoich gości', exTitle: 'Restauracja<br>na wyłączność', exId: 'wylacznosc-title',
    exText: 'Chcesz, aby cała restauracja była tylko dla Was? Nie ma problemu — zarezerwujemy ją na wyłączność na Twoje wydarzenie.',
    howTitle: 'Jak to działa', howId: 'jak-title',
    steps: [['Skontaktuj się z nami', 'Zadzwoń lub napisz — powiedz nam, jaką okazję chcesz świętować.'], ['Ustalimy szczegóły', 'Termin, liczbę gości, menu i oprawę dopasujemy indywidualnie do Twoich potrzeb.'], ['Świętujcie', 'Resztą zajmiemy się my — Ty możesz cieszyć się chwilą z gośćmi.']],
    askTitle: 'Zapytaj o przyjęcie', askLine: 'Codziennie 12:00 – 23:00 · Kazachska 1, Warszawa', mail: 'Napisz e-mail'
  },
  en: {
    title: 'Parties & events — Beef & Reef', desc: 'Parties at Beef & Reef in Wilanów: weddings, birthdays, Christmas parties and corporate events. Exclusive hire of the whole restaurant. Call +48 222 538 860.',
    subject: 'Party%20enquiry', eyebrow: 'Parties &amp; events', h1: 'Your party at Beef &amp; Reef',
    intro: 'We host parties at our restaurant — from intimate dinners to events for the whole dining room. Every detail is arranged with you individually.',
    callAsk: 'Call to ask', write: 'Write to us', photoAria: 'Photo placeholder: room set for a party', photoPh: '[PHOTO: ROOM SET FOR A PARTY]',
    occTitle: 'Occasions', occId: 'occasions-title',
    occasions: [['Weddings', 'A wedding reception in an elegant setting'], ['Birthdays', 'Birthdays, milestones and anniversaries'], ['Christmas parties', 'Company Christmas dinners and festive gatherings'], ['Corporate events', 'Business dinners and team events']],
    occMore: '…and any other occasion you’d like to celebrate.',
    exEyebrow: 'Just for you and your guests', exTitle: 'The whole<br>restaurant to yourself', exId: 'exclusive-title',
    exText: 'Want the entire restaurant just for your group? No problem — we’ll reserve it exclusively for your event.',
    howTitle: 'How it works', howId: 'how-title',
    steps: [['Get in touch', 'Call or write — tell us what you’d like to celebrate.'], ['We arrange the details', 'Date, number of guests, menu and setting — all tailored to your needs.'], ['Celebrate', 'Leave the rest to us — you can simply enjoy the moment with your guests.']],
    askTitle: 'Ask about a party', askLine: 'Daily 12:00 – 23:00 · Kazachska 1, Warsaw', mail: 'Send an email'
  }
};
function partyPage(lang) {
  const ctx = { lang, page: 'party', file: PAGES[lang].party };
  const c = PARTY[lang];
  const mailto = `mailto:${MAIL}?subject=${c.subject}`;
  return head(ctx, { title: c.title, desc: c.desc })
    + header(ctx) + `
<main id="${ANCHOR[lang].content}" tabindex="-1">
  <section class="party-intro" aria-labelledby="party-h1">
    <div class="inner">
      <p class="label" style="letter-spacing:.35em">${c.eyebrow}</p>
      <h1 id="party-h1">${c.h1}</h1>
      <div class="double-rule" aria-hidden="true" style="width:min(520px,100%)"><span></span><span></span></div>
      <p class="intro">${c.intro}</p>
      <div class="btn-row"><a class="btn btn-gold" href="${TEL}">${c.callAsk}</a><a class="btn btn-line" href="${mailto}">${c.write}</a></div>
    </div>
  </section>
  <div class="wide-photo"><div class="placeholder" role="img" aria-label="${c.photoAria}">${c.photoPh}</div></div>

  <section class="section" aria-labelledby="${c.occId}">
    <div class="wrap stack">
      <h2 id="${c.occId}" class="section-title">${c.occTitle}</h2>
      <ul class="occasions">
${c.occasions.map(([h, p]) => `        <li><h3>${h}</h3><p>${p}</p></li>`).join('\n')}
      </ul>
      <p style="text-align:center">${c.occMore}</p>
    </div>
  </section>

  <section class="section bg-warm" aria-labelledby="${c.exId}">
    <div class="exclusive">
      <span class="amp" aria-hidden="true">&amp;</span>
      <p class="eyebrow">${c.exEyebrow}</p>
      <h2 id="${c.exId}">${c.exTitle}</h2>
      <p>${c.exText}</p>
    </div>
  </section>

  <section class="section" aria-labelledby="${c.howId}">
    <div class="wrap stack" style="max-width:1120px">
      <h2 id="${c.howId}" class="section-title">${c.howTitle}</h2>
      <ol class="steps">
${c.steps.map(([h, p], i) => `        <li><span class="num" aria-hidden="true">${['I', 'II', 'III'][i]}</span><h3>${h}</h3><p>${p}</p></li>`).join('\n')}
      </ol>
    </div>
  </section>

  <section id="${ANCHOR[lang].enquiry}" class="section" style="padding-top:0" aria-labelledby="enquiry-title">
    <div class="inquiry">
      <h2 id="enquiry-title" class="section-title">${c.askTitle}</h2>
      <a class="phone" href="${TEL}">${PHONE}</a>
      <a class="u" href="${mailto}" style="font-size:22px;padding:6px 0">${MAIL}</a>
      <p>${c.askLine}</p>
      <div class="btn-row" style="margin-top:12px"><a class="btn btn-gold" href="${TEL}">${c.callAsk}</a><a class="btn btn-line" href="${mailto}">${c.mail}</a></div>
    </div>
  </section>
</main>
` + footer(ctx) + actionBar(ctx, { href: mailto, label: T[lang].email });
}

/* ---------------- Legal pages ---------------- */
const mailLink = `<a class="u" href="mailto:${MAIL}">${MAIL}</a>`;
const telLink = `<a class="u nowrap" href="${TEL}">${PHONE}</a>`;
const bookLink = `<a class="u" href="${BOOK}">online.beefandreef.pl</a>`;
function legalShell(ctx, { title, desc, eyebrow, h1, since, lead, toc, body }) {
  return head(ctx, { title, desc }) + header(ctx) + `
<main id="${ANCHOR[ctx.lang].content}" tabindex="-1" class="legal">
  <section class="legal-head" aria-labelledby="legal-h1">
    <p class="label" style="letter-spacing:.35em">${eyebrow}</p>
    <h1 id="legal-h1">${h1}</h1>
    <div class="double-rule" aria-hidden="true"><span></span><span></span></div>
    <p class="muted">${since}</p>
  </section>
  <div class="legal-body">
    <p class="legal-lead">${lead}</p>
${toc || ''}${body}
  </div>
</main>
` + footer(ctx) + actionBar(ctx, { href: BOOK, label: 'Online' });
}
function sections(list) {
  return list.map(([id, h, html]) => `    <section id="${id}" aria-labelledby="${id}-h">
      <h2 id="${id}-h">${h}</h2>
${html}
    </section>`).join('\n');
}
const ul = (items) => `      <ul>\n${items.map((i) => `        <li>${i}</li>`).join('\n')}\n      </ul>`;
const p = (t) => `      <p>${t}</p>`;

function privacyPage(lang) {
  const ctx = { lang, page: 'privacy', file: PAGES[lang].privacy };
  const cookiesHref = link(ctx, 'cookies');
  const L = lang === 'pl' ? {
    title: 'Polityka prywatności — Beef & Reef', desc: 'Jakie dane zbiera Beef & Reef przy rezerwacji i zapytaniach o przyjęcia, w jakim celu i jakie masz prawa.',
    eyebrow: 'INFORMACJE PRAWNE', h1: 'Polityka prywatności', since: 'Obowiązuje od [DATA]', tocTitle: 'SPIS TREŚCI',
    lead: 'Szanujemy Twoją prywatność. Poniżej wyjaśniamy, jakie dane zbieramy, gdy rezerwujesz stolik lub pytasz o przyjęcie, w jakim celu i jakie masz prawa.',
    s: [
      ['Administrator danych', [p('Administratorem Twoich danych osobowych jest [NAZWA FIRMY], ul. Kazachska 1, 02-999 Warszawa, NIP [NIP], [KRS lub CEIDG: NUMER] — dalej „Beef &amp; Reef”.'), p(`W sprawach dotyczących danych osobowych napisz na ${mailLink} lub zadzwoń: ${telLink}.`)]],
      ['Jakie dane zbieramy', [p('Zbieramy tylko dane, które sam nam przekażesz:'), ul(['przy rezerwacji stolika — imię i nazwisko, numer telefonu, ewentualnie adres e-mail, termin i liczbę gości;', 'przy zapytaniu o przyjęcie — dane kontaktowe oraz informacje o wydarzeniu, które opiszesz w rozmowie lub wiadomości;', 'przy organizacji przyjęcia na fakturę — dane potrzebne do jej wystawienia.']), p('Podanie danych jest dobrowolne, ale bez nich nie przyjmiemy rezerwacji ani nie odpowiemy na zapytanie.')]],
      ['Cele i podstawy prawne', [ul(['Obsługa rezerwacji i organizacja przyjęć — art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy i jej wykonanie).', 'Odpowiedzi na wiadomości i kontakt w sprawie wizyty — art. 6 ust. 1 lit. f RODO (nasz prawnie uzasadniony interes).', 'Wystawianie faktur i prowadzenie księgowości — art. 6 ust. 1 lit. c RODO (obowiązek prawny).', 'Ustalenie, dochodzenie lub obrona ewentualnych roszczeń — art. 6 ust. 1 lit. f RODO.'])]],
      ['Rezerwacja online', [p(`Rezerwacja online odbywa się w zewnętrznym systemie rezerwacyjnym pod adresem ${bookLink}, prowadzonym przez [DOSTAWCA SYSTEMU REZERWACJI]. Dane z formularza trafiają do tego systemu i są przetwarzane w naszym imieniu na podstawie umowy powierzenia.`)]],
      ['Komu przekazujemy dane', [p('Dane mogą otrzymać wyłącznie firmy, które pomagają nam prowadzić restaurację — w zakresie niezbędnym do wykonania ich zadań:'), ul(['dostawca systemu rezerwacji online,', 'dostawca hostingu strony i poczty e-mail,', 'biuro rachunkowe — w przypadku faktur.']), p('Nie sprzedajemy danych i nie przekazujemy ich do celów marketingowych innych firm.')]],
      ['Jak długo przechowujemy dane', [ul(['Dane rezerwacji — do czasu realizacji wizyty, a następnie przez [OKRES], jeśli będą potrzebne do wyjaśnienia ewentualnych roszczeń.', 'Korespondencja w sprawie przyjęć — do zakończenia sprawy, a następnie przez [OKRES].', 'Dokumenty księgowe — przez okres wymagany przepisami podatkowymi.'])]],
      ['Twoje prawa', [p('Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia, a także do sprzeciwu wobec przetwarzania opartego na naszym prawnie uzasadnionym interesie.'), p(`Aby skorzystać z tych praw, napisz na ${mailLink}. Masz też prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.`)]],
      ['Cookies i media społecznościowe', [p(`Strona nie używa plików cookies do analityki ani reklamy. Szczegóły znajdziesz w <a class="u" href="${cookiesHref}">informacji o cookies</a>.`), p('Linki do Facebooka i Instagrama prowadzą do zewnętrznych serwisów — nie osadzamy na stronie ich wtyczek. Po przejściu do nich obowiązują zasady prywatności tych serwisów.')]],
      ['Zmiany polityki', [p('Jeśli zmienimy sposób przetwarzania danych, zaktualizujemy tę stronę i datę na jej początku.')]]
    ]
  } : {
    title: 'Privacy policy — Beef & Reef', desc: 'What data Beef & Reef collects when you book a table or ask about a party, why, and what rights you have.',
    eyebrow: 'LEGAL INFORMATION', h1: 'Privacy Policy', since: 'Effective from [DATE]', tocTitle: 'CONTENTS',
    lead: 'We respect your privacy. Below we explain what data we collect when you book a table or ask about a party, why we collect it and what rights you have.',
    s: [
      ['Data controller', [p('The controller of your personal data is [COMPANY NAME], ul. Kazachska 1, 02-999 Warszawa, NIP (tax ID) [NIP], [KRS or CEIDG: NUMBER] — hereinafter “Beef &amp; Reef”.'), p(`For any matters concerning your personal data, write to ${mailLink} or call ${telLink}.`)]],
      ['What data we collect', [p('We only collect the data you give us yourself:'), ul(['when you book a table — your name, phone number, possibly your e-mail address, the date and the number of guests;', 'when you ask about a party — your contact details and the information about the event that you describe in a conversation or message;', 'when a party is paid by invoice — the details needed to issue it.']), p('Providing your data is voluntary, but without it we cannot accept a booking or reply to an enquiry.')]],
      ['Purposes and legal bases', [ul(['Handling bookings and organising parties — Art. 6(1)(b) GDPR (steps taken before entering into a contract, and its performance).', 'Replying to messages and contacting you about your visit — Art. 6(1)(f) GDPR (our legitimate interest).', 'Issuing invoices and keeping accounts — Art. 6(1)(c) GDPR (legal obligation).', 'Establishing, pursuing or defending possible claims — Art. 6(1)(f) GDPR.'])]],
      ['Online booking', [p(`Online booking takes place in an external booking system at ${bookLink}, operated by [BOOKING SYSTEM PROVIDER]. Data from the form goes to that system and is processed on our behalf under a data processing agreement.`)]],
      ['Who we share data with', [p('Your data may only be received by companies that help us run the restaurant — to the extent necessary for their tasks:'), ul(['the online booking system provider,', 'the website and e-mail hosting provider,', 'our accounting office — in the case of invoices.']), p('We do not sell your data or share it for other companies’ marketing purposes.')]],
      ['How long we keep data', [ul(['Booking data — until your visit, and then for [PERIOD] if it is needed to resolve possible claims.', 'Correspondence about parties — until the matter is closed, and then for [PERIOD].', 'Accounting documents — for the period required by tax law.'])]],
      ['Your rights', [p('You have the right to access your data, to have it rectified, erased, restricted and transferred, and to object to processing based on our legitimate interest.'), p(`To exercise these rights, write to ${mailLink}. You also have the right to lodge a complaint with the President of the Personal Data Protection Office (UODO).`)]],
      ['Cookies and social media', [p(`This website does not use cookies for analytics or advertising. You will find the details in the <a class="u" href="${cookiesHref}">cookie information</a>.`), p('The links to Facebook and Instagram lead to external services — we do not embed their plugins on the website. Once you go there, those services’ privacy policies apply.')]],
      ['Changes to this policy', [p('If we change the way we process data, we will update this page and the date at the top.')]]
    ]
  };
  const toc = `    <nav class="legal-toc" aria-labelledby="toc-h"><h2 id="toc-h" class="label muted">${L.tocTitle}</h2><ol>
${L.s.map(([h], i) => `      <li><a class="u" href="#pp-${i + 1}">${h}</a></li>`).join('\n')}
    </ol></nav>
`;
  const body = sections(L.s.map(([h, parts], i) => [`pp-${i + 1}`, `${i + 1}. ${h}`, parts.join('\n')]));
  return legalShell(ctx, { title: L.title, desc: L.desc, eyebrow: L.eyebrow, h1: L.h1, since: L.since, lead: L.lead, toc, body });
}

function dl(rows) {
  return `      <dl class="store-table">\n${rows.map(([k, v]) => `        <div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n')}\n      </dl>`;
}
function cookiesPage(lang) {
  const ctx = { lang, page: 'cookies', file: PAGES[lang].cookies };
  const privacyHref = link(ctx, 'privacy');
  const pl = lang === 'pl';
  const L = pl ? {
    title: 'Cookies — Beef & Reef', desc: 'Strona Beef & Reef nie używa plików cookies do analityki ani reklamy. Sprawdź, co zapisujemy w przeglądarce.',
    eyebrow: 'INFORMACJE PRAWNE', since: 'Obowiązuje od [DATA]',
    lead: 'W skrócie: ta strona nie śledzi Cię i nie używa plików cookies do analityki ani reklamy. Dlatego nie wyświetlamy banera zgody na cookies.',
    s: [
      ['ck-1', 'Co zapisujemy na Twoim urządzeniu', [p('Zapisujemy tylko dwie informacje, i to wyłącznie wtedy, gdy sam coś wybierzesz:'),
        dl([['NAZWA', '<strong>br-theme</strong>'], ['RODZAJ', 'Pamięć lokalna przeglądarki (localStorage), nie plik cookie'], ['CEL', 'Zapamiętuje, czy wybrałeś tryb jasny czy ciemny'], ['KIEDY', 'Tylko po kliknięciu przełącznika trybu'], ['JAK DŁUGO', 'Do czasu, aż usuniesz dane tej strony w przeglądarce']]),
        dl([['NAZWA', '<strong>br-lang</strong>'], ['RODZAJ', 'Pamięć lokalna przeglądarki (localStorage), nie plik cookie'], ['CEL', 'Zapamiętuje wybrany język strony (polski lub angielski)'], ['KIEDY', 'Tylko po wybraniu języka'], ['JAK DŁUGO', 'Do czasu, aż usuniesz dane tej strony w przeglądarce']]),
        p('Te informacje zostają w Twojej przeglądarce — nie wysyłamy ich do nas ani nikomu innemu.')]],
      ['ck-2', 'Usługi zewnętrzne', [
        '      <div class="sub"><h3>Mapa dojazdu</h3><p>Mapa Google wczytuje się dopiero wtedy, gdy klikniesz „Pokaż mapę”. Od tego momentu Google może zapisać własne pliki cookies, zgodnie ze swoją polityką prywatności.</p></div>',
        `      <div class="sub"><h3>Rezerwacja online</h3><p>Formularz rezerwacji działa w osobnym serwisie ${bookLink}, który ma własne zasady dotyczące cookies.</p></div>`,
        '      <div class="sub"><h3>Czcionki</h3><p>Krój pisma ładujemy z naszego serwera, a nie z Google Fonts, więc przy wyświetlaniu strony Twój adres IP nie trafia do Google.</p></div>']],
      ['ck-3', 'Jak usunąć zapisane dane', [p('W ustawieniach przeglądarki usuń pliki cookies i dane tej witryny. Strona wróci wtedy do trybu zgodnego z ustawieniami Twojego urządzenia.')]],
      ['ck-4', 'Więcej informacji', [p(`Jak przetwarzamy dane z rezerwacji i zapytań, opisujemy w <a class="u" href="${privacyHref}">polityce prywatności</a>. Pytania? Napisz na ${mailLink}.`)]]
    ]
  } : {
    title: 'Cookies — Beef & Reef', desc: 'The Beef & Reef website does not use cookies for analytics or advertising. See what we store in your browser.',
    eyebrow: 'LEGAL INFORMATION', since: 'Effective from [DATE]',
    lead: 'In short: this website does not track you and does not use cookies for analytics or advertising. That is why we do not show a cookie consent banner.',
    s: [
      ['ck-1', 'What we store on your device', [p('We store only two pieces of information, and only when you choose something yourself:'),
        dl([['NAME', '<strong>br-theme</strong>'], ['TYPE', 'Browser local storage (localStorage), not a cookie'], ['PURPOSE', 'Remembers whether you chose light or dark mode'], ['WHEN', 'Only after you click the mode switch'], ['HOW LONG', 'Until you delete this website’s data in your browser']]),
        dl([['NAME', '<strong>br-lang</strong>'], ['TYPE', 'Browser local storage (localStorage), not a cookie'], ['PURPOSE', 'Remembers the language you chose for the website (Polish or English)'], ['WHEN', 'Only after you choose a language'], ['HOW LONG', 'Until you delete this website’s data in your browser']]),
        p('This information stays in your browser — we do not send it to ourselves or to anyone else.')]],
      ['ck-2', 'Third-party services', [
        '      <div class="sub"><h3>Directions map</h3><p>The Google map loads only when you click “Show map”. From that moment Google may store its own cookies, in line with its privacy policy.</p></div>',
        `      <div class="sub"><h3>Online booking</h3><p>The booking form runs on a separate service, ${bookLink}, which has its own cookie rules.</p></div>`,
        '      <div class="sub"><h3>Fonts</h3><p>We load the typeface from our own server, not from Google Fonts, so your IP address is not sent to Google when the page is displayed.</p></div>']],
      ['ck-3', 'How to delete stored data', [p('In your browser settings, delete the cookies and data for this website. The website will then return to the mode that matches your device settings.')]],
      ['ck-4', 'More information', [p(`We describe how we process booking and enquiry data in the <a class="u" href="${privacyHref}">privacy policy</a>. Questions? Write to ${mailLink}.`)]]
    ]
  };
  const body = sections(L.s.map(([id, h, parts]) => [id, h, parts.join('\n')]));
  return legalShell(ctx, { title: L.title, desc: L.desc, eyebrow: L.eyebrow, h1: 'Cookies', since: L.since, lead: L.lead, toc: '', body });
}

/* ---------------- 404 ---------------- */
function notFound() {
  // GitHub Pages serves 404.html for any missing URL, also nested ones — set a <base> so relative assets resolve.
  const ctx = { lang: 'pl', page: '404', file: '404.html' };
  const baseScript = `<script>document.write('<base href="'+(/^\\/beef-and-reef-website\\//.test(location.pathname)?'/beef-and-reef-website/':'/')+'">')</script>\n`;
  return head(ctx, { title: 'Nie znaleziono strony — Beef & Reef', desc: 'Strona nie istnieje.', extraHead: baseScript }) + header(ctx) + `
<main id="tresc" tabindex="-1"><section class="section"><div class="narrow"><h1 class="title">Nie znaleziono strony</h1><p>Ta strona nie istnieje. Wróć na <a class="u" href="index.html">stronę główną</a> lub zadzwoń: <a class="u nowrap" href="${TEL}">${PHONE}</a>.</p><p lang="en">This page does not exist. Go to the <a class="u" href="en/index.html">home page</a>.</p></div></section></main>
` + footer(ctx) + actionBar(ctx, { href: BOOK, label: 'Online' });
}

/* ---------------- Write ----------------
   Since 08.11.2026 the pages are built by src/ruch (direction "Ruch"); this file is the copy/content source.
     node src/ruch/extract.js && python3 src/ruch/site.py
   Run with --legacy to rebuild the previous "druk" pages instead. */
const write = (file, html) => fs.writeFileSync(path.join(DIST, file), html);
if (process.argv.includes('--legacy')) {
  fs.mkdirSync(path.join(DIST, 'en'), { recursive: true });
  for (const lang of ['pl', 'en']) {
    write(PAGES[lang].home, home(lang));
    write(PAGES[lang].menu, menuPage(lang));
    write(PAGES[lang].party, partyPage(lang));
    write(PAGES[lang].privacy, privacyPage(lang));
    write(PAGES[lang].cookies, cookiesPage(lang));
  }
  write('404.html', notFound());
  console.log('built (legacy)');
} else {
  console.log('Pages are built by src/ruch: node src/ruch/extract.js && python3 src/ruch/site.py  (or: node src/build.js --legacy)');
}
