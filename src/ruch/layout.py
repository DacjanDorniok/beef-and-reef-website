#!/usr/bin/env python3
# Plansze rozmiarów + nowy układ canvas.json płótna głównego.
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen
from gen import F, H, wrapper, OUT

# stare plansze (stan 1794089161-5ad1) — przenoszone na stronę „Archiwum — druk”
OLD = {
 "Cookies-Mobile.dc.html": dict(expand="fill", h=4400, is_interactive=True, page="legal", title="Cookies — telefon", w=390, x=3510, y=0),
 "Cookies.dc.html": dict(expand="fill", h=3000, is_interactive=True, page="legal", title="Cookies — desktop", w=1440, x=1990, y=0),
 "Footer.dc.html": dict(h=386, page="components", title="Komponent: stopka (wspólna dla wszystkich stron)", w=1440, x=1360, y=0),
 "Hero-A-Mobile.dc.html": dict(h=844, page="hero", title="Hero A — telefon", w=390, x=1520, y=0),
 "Hero-A.dc.html": dict(h=900, page="hero", title="Hero A — desktop", w=1440, x=0, y=0),
 "Hero-B-Mobile.dc.html": dict(h=844, page="hero", title="Hero B — telefon", w=390, x=1520, y=1320),
 "Hero-B.dc.html": dict(h=900, page="hero", title="Hero B — desktop", w=1440, x=0, y=1320),
 "Hero-C-Mobile.dc.html": dict(h=844, page="hero", title="Hero C — telefon", w=390, x=1520, y=2640),
 "Hero-C.dc.html": dict(h=900, page="hero", title="Hero C — desktop", w=1440, x=0, y=2640),
 "Hero-D-Mobile.dc.html": dict(h=844, page="hero", title="Hero D — telefon", w=390, x=1520, y=3960),
 "Hero-D.dc.html": dict(h=900, page="hero", title="Hero D — desktop", w=1440, x=0, y=3960),
 "Hero-E-Mobile.dc.html": dict(h=844, page="hero", title="Hero E — telefon", w=390, x=1520, y=5280),
 "Hero-E.dc.html": dict(h=900, page="hero", title="Hero E — desktop", w=1440, x=0, y=5280),
 "Hero-E-Light-Mobile.dc.html": dict(h=844, page="hero", title="Hero E Light — telefon", w=390, x=3510, y=5280),
 "Hero-E-Light.dc.html": dict(h=900, page="hero", title="Hero E Light — desktop", w=1440, x=1990, y=5280),
 "Language-Select.dc.html": dict(h=900, is_interactive=True, page="archiwum", y_off=33600, title="Wybór języka — desktop (pierwsza wizyta)", w=1440, x=0, y=0),
 "Language-Select-Mobile.dc.html": dict(h=844, is_interactive=True, page="archiwum", y_off=33600, title="Wybór języka — telefon (pierwsza wizyta)", w=390, x=1520, y=0),
 "Hero-F-Mobile.dc.html": dict(h=844, page="hero", title="Hero F — telefon", w=390, x=1520, y=6600),
 "Hero-F.dc.html": dict(h=900, page="hero", title="Hero F — desktop", w=1440, x=0, y=6600),
 "Hero-G-Mobile.dc.html": dict(h=844, page="hero", title="Hero G — telefon", w=390, x=1520, y=7920),
 "Hero-G.dc.html": dict(h=900, page="hero", title="Hero G — desktop", w=1440, x=0, y=7920),
 "Header-Warianty.dc.html": dict(h=1136, page="site", title="Nagłówek po przewinięciu hero — 3 warianty (A rekomendowany)", w=1440, x=1990, y=8400),
 "Home-Mobile-Dark.dc.html": dict(expand="fill", h=7400, is_interactive=True, page="site", title="Strona główna — telefon, tryb ciemny", w=390, x=1520, y=8400),
 "Home-Mobile-EN.dc.html": dict(expand="fill", h=7400, is_interactive=True, page="en", title="Home — phone (EN)", w=390, x=1520, y=0),
 "Home-Mobile.dc.html": dict(expand="fill", h=7400, is_interactive=True, page="site", title="Strona główna — telefon (kierunek „druk”)", w=390, x=3040, y=0),
 "Main-Dark.dc.html": dict(expand="fill", h=5900, is_interactive=True, page="site", title="Strona główna — desktop, tryb ciemny", w=1440, x=0, y=8400),
 "Main-EN.dc.html": dict(expand="fill", h=5900, is_interactive=True, page="en", title="Home — desktop (EN)", w=1440, x=0, y=0),
 "Main.dc.html": dict(expand="fill", h=6400, is_interactive=True, page="site", title="Strona główna — desktop (kierunek „druk”)", w=1440, x=0, y=0),
 "Menu-Mobile.dc.html": dict(expand="fill", h=8000, is_interactive=True, page="site", title="Menu — telefon", w=390, x=3510, y=0),
 "Menu.dc.html": dict(expand="fill", h=8000, is_interactive=True, page="site", title="Menu — desktop", w=1440, x=1520, y=0),
 "MenuList.dc.html": dict(h=8000, page="components", title="Komponent: lista menu (PL/EN)", w=1280, x=0, y=0),
 "Party-EN.dc.html": dict(expand="fill", h=3666, is_interactive=True, page="en", title="Parties & events — desktop (EN)", w=1440, x=1990, y=0),
 "Party-Mobile-EN.dc.html": dict(expand="fill", h=4228, is_interactive=True, page="en", title="Parties & events — phone (EN)", w=390, x=3510, y=0),
 "Party-Mobile.dc.html": dict(expand="fill", h=4228, is_interactive=True, page="site", title="Przyjęcia i eventy — telefon", w=390, x=5500, y=0),
 "Party.dc.html": dict(expand="fill", h=3666, is_interactive=True, page="site", title="Przyjęcia i eventy — desktop", w=1440, x=3980, y=0),
 "Privacy-Mobile.dc.html": dict(expand="fill", h=6400, is_interactive=True, page="legal", title="Polityka prywatności — telefon", w=390, x=1520, y=0),
 "Privacy.dc.html": dict(expand="fill", h=4300, is_interactive=True, page="legal", title="Polityka prywatności — desktop", w=1440, x=0, y=0),
}
OLD_ORDER = ["MenuList.dc.html","Footer.dc.html","Main.dc.html","Menu.dc.html","Home-Mobile.dc.html","Menu-Mobile.dc.html","Party.dc.html","Party-Mobile.dc.html","Main-Dark.dc.html","Home-Mobile-Dark.dc.html","Hero-A.dc.html","Hero-A-Mobile.dc.html","Hero-B.dc.html","Hero-B-Mobile.dc.html","Hero-C.dc.html","Hero-C-Mobile.dc.html","Hero-D.dc.html","Hero-D-Mobile.dc.html","Hero-E.dc.html","Hero-E-Mobile.dc.html","Hero-E-Light.dc.html","Hero-E-Light-Mobile.dc.html","Hero-F.dc.html","Hero-F-Mobile.dc.html","Hero-G.dc.html","Hero-G-Mobile.dc.html","Privacy.dc.html","Privacy-Mobile.dc.html","Cookies.dc.html","Cookies-Mobile.dc.html","Main-EN.dc.html","Home-Mobile-EN.dc.html","Party-EN.dc.html","Party-Mobile-EN.dc.html","Language-Select.dc.html","Language-Select-Mobile.dc.html","Header-Warianty.dc.html"]
OLD_NOTES = {
 "en1": {"kind":"title1","maxW":3900,"page":"en","text":"English version — home and parties","w":240,"x":0,"y":-300},
 "hA": {"kind":"title1","maxW":1910,"page":"hero","text":"A — Spokojne zdjęcie zamiast wideo","w":240,"x":0,"y":-300},
 "hB": {"kind":"title1","maxW":1910,"page":"hero","text":"B — Karta menu, sama typografia","w":240,"x":0,"y":1020},
 "hC": {"kind":"title1","maxW":1910,"page":"hero","text":"C — Tekst i talerz","w":240,"x":0,"y":2340},
 "hD": {"kind":"title1","maxW":1910,"page":"hero","text":"D — Martwa natura: stek i owoce morza","w":240,"x":0,"y":3660},
 "hE": {"kind":"title1","maxW":3900,"page":"hero","text":"E — Antrykoty: ciemna i jasna (wybrane)","w":240,"x":0,"y":4980},
 "hF": {"kind":"title1","maxW":1910,"page":"hero","text":"F — BEEF | zdjęcie | REEF (stock)","w":240,"x":0,"y":6300},
 "hG": {"kind":"title1","maxW":1910,"page":"hero","text":"G — Jasna: karta menu na zdjęciu (wybrana)","w":240,"x":0,"y":7620},
 "ls": {"kind":"title1","maxW":1910,"page":"lang","text":"Pierwsza wizyta — wybór języka","x":0,"y":-300},
 "ls2": {"page":"lang","text":"Zachowanie: okno pokazuje się tylko przy pierwszej wizycie. Złoty przycisk = język przeglądarki. Zamknięcie (✕ / Esc / klik w tło) = język przeglądarki. Wybór zapamiętany (localStorage br-lang) — dopisać do strony Cookies. Wejścia z linkiem do konkretnej wersji (Google, hreflang, ?lang=en) pomijają okno. Później: cichy przełącznik EN/PL w nagłówku (desktop) i w menu (telefon).","w":400,"size":"m","fill":"orange","x":1990,"y":0},
 "lg": {"kind":"title1","maxW":3900,"page":"legal","text":"Polityka prywatności i cookies","w":240,"x":0,"y":-300},
 "t1": {"kind":"title1","maxW":5890,"page":"site","text":"Beef & Reef — nowa strona: rezerwacja telefoniczna i czytelne menu","w":240,"x":0,"y":-320},
 "t2": {"kind":"title1","maxW":1910,"page":"site","text":"Tryb ciemny","w":240,"x":0,"y":8100},
}

boards = {}; order = []; notes = {}
written = []

# --- archiwum: stare plansze stron (site/en/legal) ---
ARCH_OFF = {'site': 0, 'en': 16400, 'legal': 24800}
for k, v in OLD.items():
    v = dict(v)
    if 'y_off' in v:
        v['y'] = v['y'] + v.pop('y_off')
    elif v['page'] in ARCH_OFF:
        v['y'] = v['y'] + ARCH_OFF[v['page']]
        v['page'] = 'archiwum'
    boards[k] = v
for k in ('t1', 't2'):
    n = dict(OLD_NOTES[k]); n['page'] = 'archiwum'; notes['a_' + k] = n
notes['a_t1']['text'] = 'Archiwum — kierunek „druk” (stan z 07.11): strona PL'
n = dict(OLD_NOTES['en1']); n.update(page='archiwum', y=16400 - 300, text='Archiwum — kierunek „druk”: English'); notes['a_en1'] = n
n = dict(OLD_NOTES['lg']); n.update(page='archiwum', y=24800 - 300, text='Archiwum — kierunek „druk”: prywatność i cookies'); notes['a_lg'] = n
for k in ('hA','hB','hC','hD','hE','hF','hG'):
    notes[k] = OLD_NOTES[k]

# --- nowe plansze ---
def X(widths):
    xs = []; x = 0
    for w in widths:
        xs.append(x); x += w + 80
    return xs

TITLES = {
  'home': {'pl': 'Strona główna', 'en': 'Home'}, 'menu': {'pl': 'Menu', 'en': 'Menu'},
  'party': {'pl': 'Przyjęcia i eventy', 'en': 'Parties & events'},
  'privacy': {'pl': 'Polityka prywatności', 'en': 'Privacy policy'}, 'cookies': {'pl': 'Cookies', 'en': 'Cookies'},
}
DEV = {'pl': {1440: 'desktop 1440', 1024: 'tablet poziomo 1024', 768: 'tablet pionowo 768', 390: 'telefon 390'},
       'en': {1440: 'desktop 1440', 1024: 'tablet landscape 1024', 768: 'tablet portrait 768', 390: 'phone 390'}}

def add(fn, x, y, w, h, page, title):
    boards[fn] = dict(x=x, y=y, w=w, h=h, page=page, title=title, expand='fill', is_interactive=True)
    order.append(fn)

def row(lang, kind, widths, page, y, dark=False, x0=0, extra=''):
    xs = X(widths)
    for w, x in zip(widths, xs):
        base = F[lang][kind]
        t = TITLES[kind][lang] + ' — ' + DEV[lang][w] + (' · ciemny' if dark and lang == 'pl' else (' · dark' if dark else ''))
        if w == 1440 and not dark:
            fn = base + '.dc.html'
        else:
            fn = f'{base}-{w}' + ('-Ciemny' if dark else '') + '.dc.html'
            open(os.path.join(OUT, fn), 'w').write(wrapper(lang, kind, w, 'dark' if dark else None, t.replace('&', '&amp;')))
            written.append(fn)
        add(fn, x0 + x, y, w, H[kind][w], page, t)
    return y + max(H[kind][w] for w in widths)

GAP = 420  # odstęp między rzędami (miejsce na tytuł rzędu)
ALL = [1440, 1024, 768, 390]

# Strona (PL)
y = 0
notes['n_home'] = {"kind": "title1", "page": "site", "text": "Strona główna — kierunek „Ruch” (desktop · tablet · telefon)", "x": 0, "y": y - 300, "maxW": 3862}
notes['n_tw'] = {"page": "site", "text": "Przełączniki w Tweaks każdej planszy: wariant Ruch / Druk (Druk = poprzedni projekt), wydarzenie Św. Marcin / Wyłączone, ruch Włączony / Wyłączony, przyciski Złote / Zielone / Zielone bez ramki, motyw auto / jasny / ciemny. Szerokości: 1440 · 1024 · 768 · 390 — to ta sama strona, pokazana na różnych urządzeniach.", "w": 400, "size": "m", "fill": "orange", "x": 3942, "y": 0}
y = row('pl', 'home', ALL, 'site', y) + GAP
notes['n_menu'] = {"kind": "title1", "page": "site", "text": "Menu", "x": 0, "y": y - 300, "maxW": 3862}
y = row('pl', 'menu', ALL, 'site', y) + GAP
notes['n_party'] = {"kind": "title1", "page": "site", "text": "Przyjęcia i eventy", "x": 0, "y": y - 300, "maxW": 3862}
y = row('pl', 'party', ALL, 'site', y) + GAP
notes['n_dark'] = {"kind": "title1", "page": "site", "text": "Tryb ciemny", "x": 0, "y": y - 300, "maxW": 3862}
yd = row('pl', 'home', [1440, 768, 390], 'site', y, dark=True)
# menu telefon ciemny obok
xm = X([1440, 768, 390])[-1] + 390 + 80
fn = 'Karta-390-Ciemny.dc.html'
open(os.path.join(OUT, fn), 'w').write(wrapper('pl', 'menu', 390, 'dark', 'Menu — telefon 390 · ciemny'))
written.append(fn)
add(fn, xm, y, 390, H['menu'][390], 'site', 'Menu — telefon 390 · ciemny')

# English
y = 0
notes['n_en'] = {"kind": "title1", "page": "en", "text": "English — home, menu, parties", "x": 0, "y": -300, "maxW": 3862}
y = row('en', 'home', [1440, 768, 390], 'en', y) + GAP
y2 = row('en', 'menu', [1440, 390], 'en', y)
row('en', 'party', [1440, 390], 'en', y, x0=1440 + 80 + 390 + 160)

# Wybór języka (nowy)
notes['ls'] = {"kind": "title1", "page": "lang", "text": "Pierwsza wizyta — wybór języka (kierunek „Ruch”)", "x": 0, "y": -300, "maxW": 1910}
notes['ls2'] = dict(OLD_NOTES['ls2']); notes['ls2']['size'] = 24
notes['ls2']['text'] = 'Okno pokazuje się tylko przy pierwszej wizycie na stronie głównej (wejście bezpośrednie, bez wybranego wcześniej języka). Złoty przycisk = język przeglądarki. ✕ / Esc = język przeglądarki. Wybór zapamiętany w localStorage (br-lang). Desktop: okno na środku nad przyciemnioną stroną; telefon: panel od dołu.'
add('Jezyk.dc.html', 0, 0, 1440, 900, 'lang', 'Wybór języka — desktop 1440')
add('Jezyk-390.dc.html', 1520, 0, 390, 844, 'lang', 'Wybór języka — telefon 390')
notes['a_ls'] = {"kind": "title1", "page": "archiwum", "text": "Archiwum — wybór języka (stary)", "x": 0, "y": 33600 - 300, "maxW": 1910}

# Prywatność i cookies
notes['n_lg'] = {"kind": "title1", "page": "legal", "text": "Polityka prywatności i cookies — PL", "x": 0, "y": -300, "maxW": 3862}
y = row('pl', 'privacy', [1440, 768, 390], 'legal', 0)
row('pl', 'cookies', [1440, 390], 'legal', 0, x0=X([1440, 768, 390])[-1] + 390 + 160)
y += GAP
notes['n_lg_en'] = {"kind": "title1", "page": "legal", "text": "Privacy & cookies — EN", "x": 0, "y": y - 300, "maxW": 3862}
row('en', 'privacy', [1440, 390], 'legal', y)
row('en', 'cookies', [1440, 390], 'legal', y, x0=1440 + 80 + 390 + 160)

for k in OLD_ORDER:
    order.append(k)

canvas = {
  "v": 3, "attachments": {}, "boards": boards,
  "createdOnFiles": {"at": "2026-10-19T15:10:00Z", "v": 1},
  "designSystems": [{"artifact": "https://claude.ai/code/artifact/b7eaf9d2-fdb1-4755-9f10-28ab5f3940c1", "copiedAt": "2026-10-19T15:10:00Z", "namespace": "beef-reef", "title": "Beef & Reef", "version": "1792430157-f3fa"}],
  "launch": {"page": "site", "view": "canvas"},
  "notes": notes, "order": order,
  "pages": [{"id": "site", "name": "Strona"}, {"id": "en", "name": "English"}, {"id": "legal", "name": "Prywatność i cookies"},
            {"id": "hero", "name": "Hero — warianty"}, {"id": "lang", "name": "Wybór języka"}, {"id": "components", "name": "Komponenty"},
            {"id": "archiwum", "name": "Archiwum — druk"}],
  "title": "Beef & Reef — redesign strony"
}
canvas['noteOrder'] = list(notes)
for k in ('n_tw',):
    notes[k]['size'] = 24
json.dump(canvas, open(os.path.join(OUT, 'canvas.json'), 'w'), ensure_ascii=False, indent=2)
json.dump(written, open(os.path.join(OUT, '..', 'wrappers.json'), 'w'))
print(len(written), 'wrappers;', len(boards), 'boards;', len(order), 'order')
missing = [k for k in boards if not os.path.exists(os.path.join(OUT, k)) and k not in OLD]
print('missing new files:', missing)
