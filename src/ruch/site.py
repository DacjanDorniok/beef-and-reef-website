#!/usr/bin/env python3
"""Statyczna wersja strony (GitHub Pages) z tych samych szablonów co płótno Claude Design.

Uruchom z katalogu repozytorium:
    node src/ruch/extract.js      # teksty i menu z src/build.js + src/menu-source.dc.html -> content.json
    python3 src/ruch/site.py      # strony -> docs/
"""
import hashlib, html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen
from gen import B, T, F, D, TEL, MAIL

DOCS = os.path.normpath(os.path.join(HERE, '..', '..', 'docs'))
# adres strony; na produkcji: SITE=https://beefandreef.pl/ python3 src/ruch/site.py
SITE = os.environ.get('SITE', 'https://dacjandorniok.github.io/beef-and-reef-website/')
PAGES = D['PAGES']  # pl/en -> home, menu, party, privacy, cookies
KINDS = ('home', 'menu', 'party', 'privacy', 'cookies')
MAPS_EMBED = 'https://www.google.com/maps?q=Beef+%26+Reef,+Kazachska+1,+02-999+Warszawa&amp;output=embed'
BUTTONS = ''  # przyciski na stronie: '' = złote, 'gbtn' = zielone ze złotą ramką, 'gbtn gflat' = zielone bez ramki

# zasoby płótna -> pliki strony
IMG = {
    B['logo']: 'assets/img/logo-seal-192.png',
    B['steki']: 'assets/img/steki-hero.webp',
    B['osm']: 'assets/img/macka-osmiornicy.webp',
    B['pol']: 'assets/img/stek-z-poledwicy.webp',
    B['kacz']: 'assets/img/piers-z-kaczki.webp',
    B['rog']: 'assets/img/rogale-swietomarcinskie.webp',
    B['sernf']: 'assets/img/sernik.webp',
    B['stekf']: 'assets/img/steki-foto.webp',
    B['kaczf']: 'assets/img/kaczka.webp',
    B['osmf']: 'assets/img/osmiornica.webp',
    B['ext']: 'assets/img/zewnatrz.webp',
    B['bar']: 'assets/img/bar-sala.webp',
    B['sala']: 'assets/img/sala.webp',
    B['salap']: 'assets/img/sala-pion.webp',
    B['chef']: 'assets/img/szef-kuchni.webp',
}
SMALL = {  # mniejsze wersje dla telefonów
    'assets/img/rogale-swietomarcinskie.webp': ('assets/img/rogale-swietomarcinskie-800.webp', 1600),
    'assets/img/sernik.webp': ('assets/img/sernik-800.webp', 1550),
    'assets/img/steki-foto.webp': ('assets/img/steki-foto-600.webp', 756, 600),
    'assets/img/kaczka.webp': ('assets/img/kaczka-800.webp', 1600),
    'assets/img/osmiornica.webp': ('assets/img/osmiornica-800.webp', 1600),
    'assets/img/zewnatrz.webp': ('assets/img/zewnatrz-800.webp', 1600),
    'assets/img/bar-sala.webp': ('assets/img/bar-sala-800.webp', 1600),
    'assets/img/sala.webp': ('assets/img/sala-800.webp', 1600),
    'assets/img/sala-pion.webp': ('assets/img/sala-pion-800.webp', 1200),
    'assets/img/szef-kuchni.webp': ('assets/img/szef-kuchni-640.webp', 1086, 640),
}
SIZES = {'w': '(max-width: 899px) 100vw, 60vw'}

# ---------- mini-renderer szablonów .dc.html ----------
class Wrap:
    """sc-if, które na stronie zostaje w kodzie, a pokazuje/ukrywa je skrypt."""
    def __init__(self, tag, cls, hidden=False):
        self.tag, self.cls, self.hidden = tag, cls, hidden

TOK = re.compile(r'<sc-(for|if)\b([^>]*)>|</sc-(for|if)>')

def parse(s):
    pos, stack = 0, [('root', None, [])]
    for m in TOK.finditer(s):
        if m.start() > pos:
            stack[-1][2].append(s[pos:m.start()])
        if m.group(1):
            stack.append((m.group(1), m.group(2), []))
        else:
            kind, attrs, kids = stack.pop()
            stack[-1][2].append((kind, attrs, kids))
        pos = m.end()
    stack[-1][2].append(s[pos:])
    assert len(stack) == 1, 'niezamknięty sc-*'
    return stack[0][2]

def look(ctx, path):
    path = path.strip()
    if path in ('true', 'false'):
        return path == 'true'
    cur = ctx
    for p in path.split('.'):
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            raise KeyError(path)
    return cur

def attr(attrs, name):
    m = re.search(name + r'="\{\{\s*([^}]+?)\s*\}\}"', attrs)
    return m.group(1) if m else None

def holes(text, ctx):
    # obsługa zdarzeń -> data-on-* (skrypt podpina je po nazwie)
    text = re.sub(r'\son([A-Z][A-Za-z]+)="\{\{\s*(\w+)\s*\}\}"', lambda m: f' data-on-{m.group(1).lower()}="{m.group(2)}"', text)
    def rep(m):
        v = look(ctx, m.group(1))
        if isinstance(v, Wrap):
            return 'false'
        if isinstance(v, bool):
            return 'true' if v else 'false'
        return html.escape(str(v), quote=True) if not isinstance(v, Raw) else str(v)
    return re.sub(r'\{\{\s*([^}]+?)\s*\}\}', rep, text)

class Raw(str):
    pass

def render(nodes, ctx):
    out = []
    for n in nodes:
        if isinstance(n, str):
            out.append(holes(n, ctx))
            continue
        kind, attrs, kids = n
        if kind == 'if':
            v = look(ctx, attr(attrs, 'value'))
            if isinstance(v, Wrap):
                h = ' hidden' if v.hidden else ''
                out.append(f'<{v.tag} class="{v.cls}"{h}>' + render(kids, ctx) + f'</{v.tag}>')
            elif v:
                out.append(render(kids, ctx))
        else:
            lst = look(ctx, attr(attrs, 'list'))
            name = re.search(r'\bas="(\w+)"', attrs).group(1)
            for i, item in enumerate(lst):
                c = dict(ctx); c[name] = item; c['$index'] = i
                out.append(render(kids, c))
    return ''.join(out)

# ---------- ścieżki ----------
def page_file(lang, kind):
    return PAGES[lang][kind]

def rel(frm, to):
    d = os.path.dirname(frm)
    r = os.path.relpath(to, d or '.')
    return r

def fix_links(s, cur_file):
    inv = {}
    for lang in ('pl', 'en'):
        for kind in KINDS:
            inv[F[lang][kind] + '.dc.html'] = page_file(lang, kind)
    def rep(m):
        target, anchor = m.group(1), m.group(2) or ''
        to = inv[target]
        if to == cur_file:
            return f'href="{anchor or rel(cur_file, to)}"'
        return f'href="{rel(cur_file, to)}{anchor}"'
    s = re.sub(r'href="([A-Za-z]+\.dc\.html)(#[^"]*)?"', rep, s)
    def img(m):
        blob = m.group(1)
        path = IMG[blob]
        out = f'src="{rel(cur_file, path)}"'
        if path in SMALL:
            small, w = SMALL[path][:2]
            sw = SMALL[path][2] if len(SMALL[path]) > 2 else 800
            out += f' srcset="{rel(cur_file, small)} {sw}w, {rel(cur_file, path)} {w}w" sizes="{SIZES["w"]}"'
        return out
    s = re.sub(r'src="(/_blob/[0-9a-f]+)"', img, s)
    # dane slajdów (src w JSON nie występują — slajdy są już wyrenderowane)
    return s

# ---------- kontekst startowy (stan przed uruchomieniem skryptu) ----------
def words(text):
    out = []
    for t in text.split(' '):
        k = t.startswith('*')
        out.append({'t': t[1:] if k else t, 'c': 'wd' + (' k' if k else '')})
    return out

def ctx_for(lang, kind):
    t = T[lang]
    cfg = {'words': {}, 'cats': None, 'events': [], 'dishes': []}
    if kind == 'home':
        ev, di = gen.slides(lang)
        # zdjęcie steków: podgląd z Adobe Stock (nr 328832358) do akceptacji właściciela — po zakupie licencji podmienić plik assets/img/steki-foto.webp
        events = ev if (kind == 'home' and D['EVENT']['on']) else []
        L = events + di
    else:
        L = []
    n = len(L)
    pad = lambda v: ('0' if v < 10 else '') + str(v)
    slides = [dict(x, cls='slide' + (' cur' if i == 0 else ''), st='', hidden='false' if i == 0 else 'true',
                   label=f'{pad(i+1)} / {pad(n)}: {x["title"]}', isFill=(i == 0), until=x.get('until', ''))
              for i, x in enumerate(L)]
    for s in slides:
        for k in ('cta', 'href'):
            s.setdefault(k, '')
        s.setdefault('descS', s['desc'])
    home = kind == 'home'
    c = {k: '' for k in ('about', 'chef', 'party', 'live', 'contact', 'picks', 'res', 'photo', 'occ', 'excl', 'how', 'ask')}
    c['hero'] = 'js-hero'
    w = {}
    if kind == 'home':
        w = {'stmt1': words(gen.S1[lang]), 'stmt2': words(gen.S2[lang])}
    elif kind == 'menu':
        w = {'stmt2': words(gen.S2[lang])}
    elif kind == 'party':
        w = {'stmt3': words(gen.S3[lang])}
    cats = []
    if kind == 'menu':
        idx = 1 if lang == 'pl' else 2
        cats = [{'id': 'chip-' + q[0], 'href': '#g-' + q[0], 't': q[idx], 'cls': 'on' if i == 0 else '', 'cur': 'true' if i == 0 else 'false'}
                for i, q in enumerate(D['CATS'])]
    first = slides[0] if slides else {'cta': '', 'href': ''}
    return {
        'theme': 'light', 'isDark': False,
        'isLight': Wrap('span', 'ic-l'), 'isDarkW': None,
        'themeLabel': html.unescape(t['dark']),
        'rootCls': ('rx ' + BUTTONS).strip(),
        'c': c,
        'callCls': 'call off' if home else 'call', 'callHidden': 'true' if home else 'false', 'callTab': '-1' if home else '0',
        'barCls': 'pbar off' if home else 'pbar',
        'drawerOpen': Wrap('div', 'drawer-wrap', True),
        'slides': slides, 'cur': {'n': '01', 'cta': first['cta'], 'href': first['href']}, 'total': pad(n),
        'isPlaying': Wrap('span', 'ic-pause'), 'isPaused': Wrap('span', 'ic-play', True), 'liveMode': 'off',
        'pauseLabel': html.unescape(t['pause']), 'carCls': 'car',
        'w': w, 'px': {'chef': 0, 'party': 0}, 'chips': cats,
        'mapClosed': Wrap('div', 'map-a'), 'mapOpen': Wrap('div', 'map-b', True),
    }

PDF = {'pl': 'assets/pdf/beef-and-reef-menu-pl.pdf', 'en': 'assets/pdf/beef-and-reef-menu-en.pdf'}  # z Karta_Menu/DRUCK, przycięte do formatu A4, 150–170 dpi

def pdf_links(lang):
    """Linki „Pobierz menu w PDF” na stronie menu (na płótnie zostają jako #)."""
    file = page_file(lang, 'menu')
    names = gen.MENUC[lang]['pdf']
    order = ['pl', 'en'] if lang == 'pl' else ['en', 'pl']
    return [(n, rel(file, PDF[l])) for (n, _), l in zip(names, order)]

def body_for(lang, kind):
    saved = gen.MENUC[lang]['pdf']
    if kind == 'menu':
        gen.MENUC[lang]['pdf'] = pdf_links(lang)
    try:
        full = gen.page(lang, kind)
    finally:
        gen.MENUC[lang]['pdf'] = saved
    start = full.index('<sc-if value="{{isRuch}}"')
    start = full.index('>', start) + 1
    end = full.index('</sc-if>\n<sc-if value="{{drukDesk}}"') if '{{drukDesk}}' in full else full.rindex('</sc-if>')
    tpl = full[start:end]
    # przyciski motywu: obie ikony w kodzie, CSS pokazuje właściwą
    tpl = tpl.replace('<sc-if value="{{isDark}}" hint-placeholder-val="{{ false }}">', '<sc-if value="{{isDarkW}}" hint-placeholder-val="{{ false }}">')
    tpl = tpl.replace(' data-theme="{{theme}}"', '')
    tpl = re.sub(r' style="\{\{s\.st\}\}"', '', tpl)
    ctx = ctx_for(lang, kind)
    ctx['isDarkW'] = Wrap('span', 'ic-d')
    out = render(parse(tpl), ctx)
    out = out.replace(' style="transform: translateY(0px)"', '')
    out = out.replace('aria-expanded="<div', 'aria-expanded="false"')  # (bezpiecznik, nie powinno wystąpić)
    if kind == 'menu':
        menu = D['menuHtml'][lang]
        out = re.sub(r'<dc-import name="MenuList"[^>]*></dc-import>', lambda m: menu, out)
    # PDF menu: otwiera się w nowej karcie
    nt = ' (PDF, otwiera się w nowej karcie)' if lang == 'pl' else ' (PDF, opens in a new tab)'
    out = re.sub(r'<a class="u" href="([^"]*\.pdf)">([^<]+)</a>', lambda m: f'<a class="u" href="{m.group(1)}" target="_blank" rel="noopener" type="application/pdf" aria-label="{m.group(2)}{nt}">{m.group(2)}</a>', out)
    # mapa: adres osadzenia dla skryptu
    out = out.replace('class="rise d4 map" role="region"', f'class="rise d4 map" data-embed="{MAPS_EMBED}" role="region"')
    return out

# ---------- <head> ----------
TITLES = {
    'home': {'pl': D['HOME']['pl']['title'], 'en': D['HOME']['en']['title']},
    'menu': {'pl': D['MENU']['pl']['title'], 'en': D['MENU']['en']['title']},
    'party': {'pl': D['PARTY']['pl']['title'], 'en': D['PARTY']['en']['title']},
    'privacy': {'pl': D['legal']['privacy_pl']['title'], 'en': D['legal']['privacy_en']['title']},
    'cookies': {'pl': D['legal']['cookies_pl']['title'], 'en': D['legal']['cookies_en']['title']},
}
DESCS = {
    'home': {'pl': D['HOME']['pl']['desc'], 'en': D['HOME']['en']['desc']},
    'menu': {'pl': D['MENU']['pl']['desc'], 'en': D['MENU']['en']['desc']},
    'party': {'pl': D['PARTY']['pl']['desc'], 'en': D['PARTY']['en']['desc']},
    'privacy': {'pl': D['legal']['privacy_pl']['desc'], 'en': D['legal']['privacy_en']['desc']},
    'cookies': {'pl': D['legal']['cookies_pl']['desc'], 'en': D['legal']['cookies_en']['desc']},
}
LD = {
    '@context': 'https://schema.org', '@type': 'Restaurant', 'name': 'Beef & Reef', 'servesCuisine': ['Steakhouse', 'Seafood'],
    'telephone': '+48222538860', 'email': MAIL, 'priceRange': '$$$',
    'address': {'@type': 'PostalAddress', 'streetAddress': 'Kazachska 1', 'postalCode': '02-999', 'addressLocality': 'Warszawa', 'addressCountry': 'PL'},
    'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'opens': '12:00', 'closes': '23:00'}],
    'sameAs': [gen.FB, gen.IG], 'acceptsReservations': True,
}

def ver(path):
    return hashlib.md5(open(os.path.join(DOCS, path), 'rb').read()).hexdigest()[:8]

def head(lang, kind, file, title, desc, extra=''):
    a = lambda p: rel(file, p)
    url = lambda f: SITE + re.sub(r'(^|/)index\.html$', r'\1', f)
    alt = ''
    if kind in KINDS:
        alt = (f'<link rel="canonical" href="{url(file)}">\n'
               f'<link rel="alternate" hreflang="pl" href="{url(PAGES["pl"][kind])}">\n'
               f'<link rel="alternate" hreflang="en" href="{url(PAGES["en"][kind])}">\n'
               f'<link rel="alternate" hreflang="x-default" href="{url(PAGES["pl"][kind])}">\n')
    e = lambda s: html.escape(html.unescape(s), quote=True)
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="{'en_GB' if lang == 'en' else 'pl_PL'}">
<meta property="og:image" content="{SITE}assets/img/og-image.jpg">
<meta property="og:url" content="{url(file)}">
{alt}{extra}<link rel="icon" type="image/png" sizes="32x32" href="{a('assets/img/favicon-32.png')}">
<link rel="apple-touch-icon" href="{a('assets/img/apple-touch-icon.png')}">
<link rel="preload" href="{a('assets/fonts/cormorant-garamond-latin-ext-400-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{a('assets/css/style.css')}?v={ver('assets/css/style.css')}">
<script>(function(){{try{{if('scrollRestoration' in history)history.scrollRestoration='manual'}}catch(e){{}}var d=document.documentElement,t=null;try{{t=localStorage.getItem('br-theme')}}catch(e){{}}if(t!=='light'&&t!=='dark')t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t)}})()</script>
<noscript><style>.rx .float,.rx .rise,.rx .bar{{opacity:1!important;transform:none!important}}.rx .wd{{color:var(--ink)}}.rx .call.off{{opacity:1;visibility:visible;transform:none}}.rx .pbar.off{{transform:none;visibility:visible}}</style></noscript>
<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False)}</script>
</head>
<body>
'''

def i18n(lang):
    t = T[lang]
    d = {k: html.unescape(t[k]) for k in ('dark', 'light', 'play', 'pause')}
    d['mapTitle'] = 'Mapa dojazdu do Beef & Reef, Kazachska 1, Warszawa' if lang == 'pl' else 'Map: how to find Beef & Reef, Kazachska 1, Warsaw'
    return html.escape(json.dumps(d, ensure_ascii=False), quote=True)

def write_page(lang, kind):
    file = page_file(lang, kind)
    body = body_for(lang, kind)
    body = fix_links(body, file)
    body = re.sub(r'<div class="rx[^"]*"', lambda m: m.group(0) + f' data-i18n="{i18n(lang)}"', body, count=1)
    picker = ''
    if kind == 'home':
        lp = gen.lang_picker(gen.href('pl', 'home'), gen.href('en', 'home'))
        lp = fix_links(lp, file)
        picker = f'<div id="lang-pick" class="{("rx lp-layer " + BUTTONS).strip()}" hidden>\n  {lp}\n</div>\n'
    redirect = ''
    if lang == 'pl' and kind == 'menu':
        redirect = f"<script>if(/[?&]lang=en\\b/.test(location.search))location.replace('{PAGES['en']['menu']}'+location.hash)</script>\n"
    doc = (head(lang, kind, file, TITLES[kind][lang], DESCS[kind][lang], redirect) + body + picker +
           f'<script src="{rel(file, "assets/js/main.js")}?v={ver("assets/js/main.js")}" defer></script>\n</body>\n</html>\n')
    path = os.path.join(DOCS, file)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(doc)
    return file

def not_found():
    file = '404.html'
    F['pl']['404'] = F['pl']['home']; F['en']['404'] = F['en']['home']
    base = "<script>document.write('<base href=\"'+(/^\\/beef-and-reef-website\\//.test(location.pathname)?'/beef-and-reef-website/':'/')+'\">')</script>\n"
    hdr = fix_links(render(parse(gen.header('pl', '404').replace('<sc-if value="{{isDark}}" hint-placeholder-val="{{ false }}">', '<sc-if value="{{isDarkW}}" hint-placeholder-val="{{ false }}">')), dict(ctx_for('pl', 'privacy'), isDarkW=Wrap('span', 'ic-d'))), file)
    ftr = fix_links(gen.footer('pl'), file)
    main = f'''  <main id="tresc" tabindex="-1">
  <section class="js-hero lhead">
    <div class="wrap">
      <p class="float kicker">BŁĄD 404</p>
      <h1 class="split"><span class="float">Nie</span> <span class="bar" aria-hidden="true"></span> <span class="float d1 b">ma strony.</span></h1>
      <p class="float d2 since">Ta strona nie istnieje. Wróć na <a class="u" href="index.html">stronę główną</a> lub zadzwoń: <a class="u nw" href="{TEL}">{gen.PHONE}</a>.</p>
      <p class="float d3 since" lang="en">This page does not exist. Go to the <a class="u" href="en/index.html">home page</a>.</p>
    </div>
  </section>
  </main>
'''
    bar = fix_links(gen.pbar('pl', gen.BOOK, 'ONLINE').replace('{{barCls}}', 'pbar'), file)
    root_open = f'<div class="{("rx " + BUTTONS).strip()}" data-i18n="{i18n("pl")}">\n'
    doc = (head('pl', '404', file, 'Nie znaleziono strony — Beef & Reef', 'Strona nie istnieje.', base) + root_open + hdr + main + ftr + bar + '</div>\n' +
           f'<script src="assets/js/main.js?v={ver("assets/js/main.js")}" defer></script>\n</body>\n</html>\n')
    open(os.path.join(DOCS, file), 'w').write(doc)
    return file

def site_css():
    css = gen.CSS
    css = css.replace('.rx[data-theme="light"]{', 'html:not([data-theme="dark"]) .rx{')
    css = css.replace('.rx[data-theme="dark"]{', 'html[data-theme="dark"] .rx{')
    fonts = open(os.path.join(HERE, 'fonts.css')).read()
    menu = open(os.path.join(HERE, 'menu.css')).read()
    extra = '''
/* tylko strona: ikony motywu, mapa, html */
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
html[data-theme="dark"],html[data-theme="dark"] body{background:#0a0a0a}
.rx .m-group{scroll-margin-top:calc(var(--hh) + 80px)}
@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
html[data-theme="dark"] .rx .ic-l{display:none}
html:not([data-theme="dark"]) .rx .ic-d{display:none}
.rx .ic-l,.rx .ic-d,.rx .ic-pause,.rx .ic-play{display:inline-flex}
.rx [hidden],.rx[hidden]{display:none !important}
.rx .map-a,.rx .map-b{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.rx .map-b{position:absolute;inset:0;z-index:4}
.rx .map-frame{position:absolute;inset:0;width:100%;height:100%;border:0}
.rx .car:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
'''
    return '/* Beef & Reef — kierunek „Ruch” (generowane przez src/ruch/site.py, nie edytuj ręcznie) */\n' + fonts + css + menu + extra

if __name__ == '__main__':
    os.makedirs(os.path.join(DOCS, 'assets', 'css'), exist_ok=True)
    open(os.path.join(DOCS, 'assets', 'css', 'style.css'), 'w').write(site_css())
    open(os.path.join(DOCS, 'assets', 'js', 'main.js'), 'w').write(open(os.path.join(HERE, 'site.js')).read())
    done = [write_page(l, k) for l in ('pl', 'en') for k in KINDS] + [not_found()]
    # robots.txt, sitemap.xml i CNAME (tylko dla własnej domeny)
    pages = [f for f in done if f != '404.html']
    pretty = lambda f: SITE + re.sub(r'(^|/)index\.html$', r'\1', f)
    open(os.path.join(DOCS, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n')
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f in sorted(pages, key=lambda f: (f.startswith('en/'), f != 'index.html', f)):
        sm.append(f'  <url><loc>{pretty(f)}</loc></url>')
    sm.append('</urlset>')
    open(os.path.join(DOCS, 'sitemap.xml'), 'w').write('\n'.join(sm) + '\n')
    host = re.sub(r'^https?://([^/]+)/.*$', r'\1', SITE)
    cname = os.path.join(DOCS, 'CNAME')
    if host.endswith('github.io'):
        if os.path.exists(cname): os.remove(cname)
    else:
        open(cname, 'w').write(host + '\n')
    print('\n'.join(done))
