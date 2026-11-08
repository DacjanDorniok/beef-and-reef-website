#!/usr/bin/env python3
# Generator stron Beef & Reef (kierunek „Ruch”) dla płótna Claude Design.
# Jeden system: wspólne tokeny, nagłówek, szuflada, stopka, pasek telefonu; PL + EN; jasny/ciemny.
import json, re, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get('CANVAS_OUT', '/home/claude/main/project')
D = json.load(open(os.path.join(HERE, 'content.json')))
CSS = open(os.path.join(HERE, 'style.css')).read()
JS = open(os.path.join(HERE, 'logic.js')).read()

B = {  # zasoby w płótnie głównym
    'logo': '/_blob/1c27d77ff5685a332ef36e418abf2880',
    'steki': '/_blob/fe74022f6b865a732f832cd0d185e131',
    'osm': '/_blob/9002d228cc5b98e6a8841c7871b8174f',
    'pol': '/_blob/d89ba95b176d8b55a8e1c18bfe417d1e',
    'kacz': '/_blob/8924f7504f174bf4fe303ff8ed79cd5b',
    'rog': '/_blob/0add22fb1759d259627c7231358ccea6',
    'stekf': '/_blob/131233dd41ce2602c94462e6dc1b5635', 'sern': '/_blob/edc38a1a589a155b433557cc48e4d307', 'kaczf': '/_blob/12886983c40a57629921236ecfeb055a', 'osmf': '/_blob/de19542d18064fb333f5d47ac25ac5a4',
    'sernf': '/_blob/fac3d419120a5ceb1566718411036d81',
    'ext': '/_blob/b17878b93c23b62318611e04dfd9a8b0', 'bar': '/_blob/d3a302a65a5e0399e24e0a8b90191e2e', 'sala': '/_blob/a26fb76d3d464d2cb8ce72e25a1375ba', 'salap': '/_blob/1925f10e8f4d5b92649197f69be95066',
}
TEL = 'tel:+48222538860'; PHONE = '+48 222 538 860'
BOOK = 'https://online.beefandreef.pl/booking'; DELIV = 'https://online.beefandreef.pl/delivery'
MAIL = 'kontakt@beefandreef.pl'
IG = 'https://www.instagram.com/beef.and.reef_steak_seafood'; FB = 'https://www.facebook.com/beef.and.reef.wilanow'
MAPS = 'https://www.google.com/maps/dir/?api=1&amp;destination=Beef%20%26%20Reef%2C%20Kazachska%201%2C%2002-999%20Warszawa'
MAPS_OPEN = 'https://www.google.com/maps/search/?api=1&amp;query=Beef%20%26%20Reef%2C%20Kazachska%201%2C%2002-999%20Warszawa'

F = {  # pliki stron
    'pl': {'home': 'Start', 'menu': 'Karta', 'party': 'Przyjecia', 'privacy': 'Prywatnosc', 'cookies': 'PlikiCookies'},
    'en': {'home': 'StartEN', 'menu': 'KartaEN', 'party': 'PrzyjeciaEN', 'privacy': 'PrywatnoscEN', 'cookies': 'PlikiCookiesEN'},
}
def href(lang, page, anchor=''):
    return F[lang][page] + '.dc.html' + anchor

# ---------- ikony ----------
I_GLOBE = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9s1.2-6.4 3.7-9z"></path></svg>'
I_MOON = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path></svg>'
I_SUN = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"></path></svg>'
I_X = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>'
I_L = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M15 5l-7 7 7 7"></path></svg>'
I_R = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M9 5l7 7-7 7"></path></svg>'
I_PAUSE = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 5v14M15 5v14"></path></svg>'
I_PLAY = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M8 5l11 7-11 7z"></path></svg>'
I_ARR = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>'

# ---------- teksty wspólne ----------
T = {
    'pl': dict(skip='Przejdź do treści', logo='Beef &amp; Reef — strona główna', nav='Główna',
               home='START', menu='MENU', party='PRZYJĘCIA', about='O NAS', contact='KONTAKT',
               dHome='Start', dMenu='Menu', dParty='Przyjęcia i eventy', dAbout='O nas', dContact='Kontakt',
               other='EN', otherAria='EN — English version', otherLang='en', open='Otwórz menu', close='Zamknij menu', menuDlg='Menu strony',
               dark='Włącz tryb ciemny', light='Włącz tryb jasny', play='Wznów pokaz slajdów', pause='Zatrzymaj pokaz slajdów',
               prevS='Poprzedni slajd', nextS='Następny slajd', slide='slajd', car='karuzela',
               callLong=PHONE, callShort='ZADZWOŃ', callAria='Zadzwoń i zarezerwuj: ' + PHONE,
               drawerCall='Zadzwoń · ' + PHONE, online='Rezerwacja online', daily='CODZIENNIE 12:00 – 23:00 · KUCHNIA DO 22:00',
               addr='Kazachska 1, Warszawa', bar='ZADZWOŃ', barOnline='ONLINE', email='E-MAIL',
               fVisit='Odwiedź nas', fRes='Rezerwacje', fShort='Na skróty', fFollow='Obserwuj nas',
               fAddr='Kazachska 1<br>02-999 Warszawa', fHours='Codziennie 12:00 – 23:00<br>Kuchnia czynna do 22:00',
               dir='Wyznacz trasę ↗', fMenu='Menu', fParty='Przyjęcia i eventy', fDeliv='Zamów online z dostawą',
               fLeft='© 2026 BEEF &amp; REEF · STEAKHOUSE · SEAFOOD · CENY W PLN', privacy='POLITYKA PRYWATNOŚCI', cookies='COOKIES',
               footLabel='Stopka', legal='Informacje prawne', newTab=' (otwiera się w nowej karcie)'),
    'en': dict(skip='Skip to content', logo='Beef &amp; Reef — home', nav='Main',
               home='HOME', menu='MENU', party='PARTIES', about='ABOUT', contact='CONTACT',
               dHome='Home', dMenu='Menu', dParty='Parties &amp; events', dAbout='About', dContact='Contact',
               other='PL', otherAria='PL — wersja polska', otherLang='pl', open='Open menu', close='Close menu', menuDlg='Site menu',
               dark='Switch to dark mode', light='Switch to light mode', play='Resume slideshow', pause='Pause slideshow',
               prevS='Previous slide', nextS='Next slide', slide='slide', car='carousel',
               callLong=PHONE, callShort='CALL', callAria='Call to book: ' + PHONE,
               drawerCall='Call · ' + PHONE, online='Book online', daily='DAILY 12:00 – 23:00 · KITCHEN UNTIL 22:00',
               addr='Kazachska 1, Warsaw', bar='CALL', barOnline='ONLINE', email='EMAIL',
               fVisit='Visit us', fRes='Reservations', fShort='Explore', fFollow='Follow us',
               fAddr='Kazachska 1<br>02-999 Warsaw', fHours='Daily 12:00 – 23:00<br>Kitchen open until 22:00',
               dir='Get directions ↗', fMenu='Menu', fParty='Parties &amp; events', fDeliv='Order online for delivery',
               fLeft='© 2026 BEEF &amp; REEF · STEAKHOUSE · SEAFOOD · PRICES IN PLN', privacy='PRIVACY POLICY', cookies='COOKIES',
               footLabel='Footer', legal='Legal information', newTab=' (opens in a new tab)'),
}

def up(x):
    return html.escape(html.unescape(x).upper(), quote=False)

def R(tpl, **kw):
    for k, v in kw.items():
        tpl = tpl.replace('[[' + k + ']]', str(v))
    return tpl

# ---------- nagłówek + szuflada ----------
def header(lang, page):
    t = T[lang]
    home = page == 'home'
    a = lambda key: (' aria-current="page"' if key == page else '')
    about = '#o-nas' if home else href(lang, 'home', '#o-nas')
    contact = '#kontakt' if home else href(lang, 'home', '#kontakt')
    nav = (f'<a href="{href(lang,"home")}"{a("home")}>{t["home"]}</a>'
           f'<a href="{href(lang,"menu")}"{a("menu")}>{t["menu"]}</a>'
           f'<a href="{href(lang,"party")}"{a("party")}>{t["party"]}</a>'
           f'<a href="{about}">{t["about"]}</a>'
           f'<a href="{contact}">{t["contact"]}</a>')
    other = 'en' if lang == 'pl' else 'pl'
    langLink = href(other, page)
    dnav = (f'<a href="{href(lang,"home")}"{a("home")} onClick="{{{{closeDrawer}}}}">{t["dHome"]}</a>'
            f'<a href="{href(lang,"menu")}"{a("menu")} onClick="{{{{closeDrawer}}}}">{t["dMenu"]}</a>'
            f'<a href="{href(lang,"party")}"{a("party")} onClick="{{{{closeDrawer}}}}">{t["dParty"]}</a>'
            f'<a href="{about}" onClick="{{{{closeDrawer}}}}">{t["dAbout"]}</a>'
            f'<a href="{contact}" onClick="{{{{closeDrawer}}}}">{t["dContact"]}</a>')
    theme_icons = ('<sc-if value="{{isLight}}" hint-placeholder-val="{{ true }}">' + I_MOON + '</sc-if>'
                   '<sc-if value="{{isDark}}" hint-placeholder-val="{{ false }}">' + I_SUN + '</sc-if>')
    return f'''  <a class="skip" href="#tresc">{t["skip"]}</a>
  <header class="hdr">
    <div class="wrap hdr-in">
      <div class="hdr-l">
        <a class="logo" href="{href(lang,"home")}" aria-label="{t["logo"]}"><img src="{B["logo"]}" alt=""></a>
        <nav class="nav" aria-label="{t["nav"]}">{nav}</nav>
      </div>
      <div class="hdr-r">
        <a class="lang" href="{langLink}" lang="{t["otherLang"]}" aria-label="{t["otherAria"]}">{I_GLOBE}<span>{t["other"]}</span></a>
        <button class="ghost" type="button" aria-pressed="{{{{isDark}}}}" aria-label="{{{{themeLabel}}}}" title="{{{{themeLabel}}}}" onClick="{{{{toggleTheme}}}}">{theme_icons}</button>
        <div class="{{{{callCls}}}}" aria-hidden="{{{{callHidden}}}}">
          <a class="btn btn-gold btn-m" href="{TEL}" tabindex="{{{{callTab}}}}" aria-label="{t["callAria"]}"><span class="long">{t["callLong"]}</span><span class="short">{t["callShort"]}</span></a>
        </div>
        <button id="rx-burger" class="icon-btn burger" type="button" aria-label="{t["open"]}" aria-expanded="{{{{drawerOpen}}}}" onClick="{{{{openDrawer}}}}"><span class="burger-i" aria-hidden="true"><span></span><span></span><span></span></span></button>
      </div>
    </div>
  </header>
  <sc-if value="{{{{drawerOpen}}}}" hint-placeholder-val="{{{{ false }}}}">
    <div class="drawer" role="dialog" aria-modal="true" aria-label="{t["menuDlg"]}">
      <div class="wrap drawer-top">
        <a class="logo" href="{href(lang,"home")}" aria-label="{t["logo"]}"><img src="{B["logo"]}" alt=""></a>
        <button id="rx-close" class="icon-btn" type="button" aria-label="{t["close"]}" onClick="{{{{closeDrawer}}}}">{I_X}</button>
      </div>
      <nav class="wrap drawer-nav" aria-label="{t["nav"]}">{dnav}</nav>
      <div class="wrap drawer-foot">
        <a class="btn btn-gold" href="{TEL}">{t["drawerCall"]}</a>
        <a class="btn btn-line" href="{BOOK}">{t["online"]}</a>
        <div class="row">
          <a class="lang" href="{langLink}" lang="{t["otherLang"]}" aria-label="{t["otherAria"]}" style="padding-left: 0">{I_GLOBE}<span>{t["other"]}</span></a>
          <button class="ghost" type="button" aria-pressed="{{{{isDark}}}}" aria-label="{{{{themeLabel}}}}" onClick="{{{{toggleTheme}}}}">{theme_icons}</button>
        </div>
        <p class="label">{t["daily"]}</p>
        <p class="info">{t["addr"]}</p>
      </div>
    </div>
  </sc-if>
'''

def footer(lang):
    t = T[lang]
    return f'''  <footer class="foot" aria-label="{t["footLabel"]}">
    <div class="wrap">
      <p class="foot-word">BEEF <i class="amp">&amp;</i> REEF</p>
      <div class="dbl" aria-hidden="true"><span></span><span></span></div>
      <div class="foot-cols">
        <div><h2>{t["fVisit"]}</h2><p>{t["fAddr"]}</p><p class="muted" style="margin-top: 8px">{t["fHours"]}</p><ul><li><a class="u" href="{MAPS}" target="_blank" rel="noopener">{t["dir"]}</a></li></ul></div>
        <div><h2>{t["fRes"]}</h2><ul><li><a class="u nw" href="{TEL}">{PHONE}</a></li><li><a class="u" href="{BOOK}">{t["online"]}</a></li><li><a class="u" href="mailto:{MAIL}">{MAIL}</a></li></ul></div>
        <div><h2>{t["fShort"]}</h2><ul><li><a class="u" href="{href(lang,"menu")}">{t["fMenu"]}</a></li><li><a class="u" href="{href(lang,"party")}">{t["fParty"]}</a></li><li><a class="u" href="{DELIV}">{t["fDeliv"]}</a></li></ul></div>
        <div><h2>{t["fFollow"]}</h2><ul><li><a class="u" href="{IG}">Instagram</a></li><li><a class="u" href="{FB}">Facebook</a></li></ul></div>
      </div>
      <div class="foot-bot">
        <span>{t["fLeft"]}</span>
        <nav class="links" aria-label="{t["legal"]}"><a href="{href(lang,"privacy")}">{t["privacy"]}</a><a href="{href(lang,"cookies")}">{t["cookies"]}</a></nav>
      </div>
    </div>
  </footer>
'''

def pbar(lang, second_href, second_label):
    t = T[lang]
    return f'''  <div class="{{{{barCls}}}}">
    <a class="btn btn-gold" href="{TEL}">{t["bar"]}</a>
    <a class="btn btn-line" href="{second_href}">{second_label}</a>
  </div>
'''

def carousel(lang, label, slides_hint):
    t = T[lang]
    return f'''      <div class="{{{{carCls}}}}" role="region" aria-roledescription="{t["car"]}" aria-label="{label}" onPointerDown="{{{{pDown}}}}" onPointerMove="{{{{pMove}}}}" onPointerUp="{{{{pUp}}}}" onPointerCancel="{{{{pUp}}}}">
        <sc-for list="{{{{slides}}}}" as="s" hint-placeholder-count="{slides_hint}">
          <div class="{{{{s.cls}}}}" style="{{{{s.st}}}}" data-cta="{{{{s.cta}}}}" data-href="{{{{s.href}}}}" data-until="{{{{s.until}}}}" role="group" aria-roledescription="{t["slide"]}" aria-label="{{{{s.label}}}}" aria-hidden="{{{{s.hidden}}}}">
            <div class="s-text">
              <p class="t1 kicker">{{{{s.kicker}}}}</p>
              <p class="t2 t-title">{{{{s.title}}}}</p>
              <p class="t3 t-desc"><span class="d-l">{{{{s.desc}}}}</span><span class="d-s">{{{{s.descS}}}}</span></p>
              <p class="t4 t-price">{{{{s.price}}}}</p>
            </div>
            <div class="s-img"><img class="bgfill {{{{s.imgCls}}}}" src="{{{{s.src}}}}" alt="" aria-hidden="true" draggable="false"><img class="{{{{s.imgCls}}}}" src="{{{{s.src}}}}" alt="{{{{s.alt}}}}" style="{{{{s.size}}}}" draggable="false"></div>
          </div>
        </sc-for>
        <span class="frame" aria-hidden="true"></span>
        <div class="ctrl">
          <div class="ctrl-row">
            <p class="count" aria-live="{{{{liveMode}}}}"><b>{{{{cur.n}}}}</b> <span class="muted">/ {{{{total}}}}</span></p>
            <span class="prog" aria-hidden="true"><sc-for list="{{{{slides}}}}" as="s" hint-placeholder-count="1"><sc-if value="{{{{s.isFill}}}}" hint-placeholder-val="{{{{ true }}}}"><span class="fill"></span></sc-if></sc-for></span>
            <button class="icon-btn" type="button" aria-label="{{{{pauseLabel}}}}" onClick="{{{{togglePause}}}}"><sc-if value="{{{{isPlaying}}}}" hint-placeholder-val="{{{{ true }}}}">{I_PAUSE}</sc-if><sc-if value="{{{{isPaused}}}}" hint-placeholder-val="{{{{ false }}}}">{I_PLAY}</sc-if></button>
            <button class="icon-btn" type="button" aria-label="{t["prevS"]}" onClick="{{{{prev}}}}">{I_L}</button>
            <button class="icon-btn" type="button" aria-label="{t["nextS"]}" onClick="{{{{next}}}}">{I_R}</button>
          </div>
          <a class="u slide-link" href="{{{{cur.href}}}}">{{{{cur.cta}}}} <span aria-hidden="true">→</span></a>
        </div>
      </div>
'''

def stmt(id_, cls='stmt'):
    return f'<p id="{id_}" class="{cls}"><sc-for list="{{{{w.{id_}}}}}" as="wd" hint-placeholder-count="24"><span class="{{{{wd.c}}}}">{{{{wd.t}}}} </span></sc-for></p>'

def split(a, b, tag='h2', id_='', extra='', b_is_tel=False):
    idattr = f' id="{id_}"' if id_ else ''
    right = (f'<a class="float d1 tel" href="{TEL}">{b}</a>' if b_is_tel else f'<span class="float d1 b">{b}</span>')
    return f'<{tag}{idattr} class="split{extra}"><span class="float">{a}</span> <span class="bar" aria-hidden="true"></span> {right}</{tag}>'

# ---------- dane karuzeli ----------
def slides(lang):
    m = href(lang, 'menu')
    if lang == 'pl':
        ev = [dict(id='Św. Marcin', src=B['rog'], alt='Rogale świętomarcińskie z lukrem i orzechami', kicker='WYDARZENIE · 7–15 LISTOPADA', title='Z okazji Świętego Marcina',
                   desc='Królować będzie gęsina w autorskich odsłonach naszego Szefa Kuchni. 11 listopada — oryginalne rogale świętomarcińskie z certyfikowanej piekarni w Poznaniu.', descS='Gęsina w autorskich odsłonach Szefa Kuchni. 11 listopada — rogale świętomarcińskie z Poznania.',
                   price='Udko z gęsi confit · 450 g · 199', cta='Zarezerwuj stolik', href=TEL, imgCls='photo', size='', until=D['EVENT']['until'])]
        di = [dict(src=B['stekf'], alt='Dwa surowe, marmurkowe antrykoty na drewnianej desce z tymiankiem i papryczkami chili', kicker='STEKI', title='Steki z najlepszych hodowli', desc='Wołowina rasy Black Angus, sezonowana na sucho min. 21 dni. Polędwica, ribeye, T-bone, porterhouse i tomahawk.', descS='Black Angus, sezonowana na sucho min. 21 dni.', price='od 119', cta='Zobacz steki w menu', href=m + '#g-steaks', imgCls='photo', size='object-position: 60% 80%'),
              dict(src=B['osmf'], alt='Macka ośmiornicy z cukinią, kiełkami groszku i czerwonym kawiorem w głębokim talerzu', kicker='RYBY I OWOCE MORZA', title='Macka ośmiornicy', desc='Ośmiornica, seler naciowy, kapary, cukinia, białe wino, oliwki, opiekane ziemniaki.', descS='Seler naciowy, kapary, cukinia, białe wino, oliwki.', price='109', cta='Zobacz ryby i owoce morza', href=m + '#g-fish', imgCls='photo', size='object-position: 50% 50%'),
              dict(src=B['kaczf'], alt='Pierś z kaczki z sosem pomarańczowym, brokułem i purée selerowym', kicker='DANIA GŁÓWNE', title='Pierś z kaczki', desc='Pierś z kaczki sous-vide, sos pomarańczowy, purée selerowe, brokuł łodygowy.', descS='Sous-vide, sos pomarańczowy, purée selerowe.', price='109', cta='Zobacz dania główne', href=m + '#g-mains', imgCls='photo', size='object-position: 50% 50%'),
              dict(src=B['sernf'], alt='Kremowy sernik z płatkami migdałów i gałką lodów waniliowych na stoliku w ogródku', kicker='DESERY', title='Kremowy sernik', desc='Lody waniliowe, mus malinowy, owoce.', price='39', cta='Zobacz desery', href=m + '#g-desserts', imgCls='photo', size='object-position: 50% 50%')]
    else:
        ev = [dict(id='Św. Marcin', src=B['rog'], alt='St. Martin’s croissants with icing and nuts', kicker='EVENT · 7–15 NOVEMBER', title='Celebrating St. Martin’s Day',
                   desc='Goose takes centre stage in our head chef’s own creations. On 11 November — original St. Martin’s croissants from a certified bakery in Poznań.', descS='Goose in our head chef’s own creations. On 11 November — St. Martin’s croissants from Poznań.',
                   price='Confit goose leg · 450 g · 199', cta='Book a table', href=TEL, imgCls='photo', size='', until=D['EVENT']['until'])]
        di = [dict(src=B['stekf'], alt='Two raw marbled ribeye steaks on a wooden board with thyme and chillies', kicker='STEAKS', title='Steaks from the finest farms', desc='Black Angus beef, dry-aged for at least 21 days. Fillet, ribeye, T-bone, porterhouse and tomahawk.', descS='Black Angus, dry-aged for at least 21 days.', price='from 119', cta='See steaks on the menu', href=m + '#g-steaks', imgCls='photo', size='object-position: 60% 80%'),
              dict(src=B['osmf'], alt='Octopus tentacle with courgette, pea shoots and red caviar in a deep plate', kicker='FISH &amp; SEAFOOD', title='Octopus Tentacle', desc='Octopus, celery, capers, courgette, white wine, olives, roasted potatoes.', descS='Celery, capers, courgette, white wine, olives.', price='109', cta='See fish &amp; seafood', href=m + '#g-fish', imgCls='photo', size='object-position: 50% 50%'),
              dict(src=B['kaczf'], alt='Duck breast with orange sauce, broccoli and celeriac purée', kicker='MAINS', title='Duck Breast', desc='Sous-vide duck breast, orange sauce, celeriac purée, tenderstem broccoli.', descS='Sous-vide, orange sauce, celeriac purée.', price='109', cta='See mains', href=m + '#g-mains', imgCls='photo', size='object-position: 50% 50%'),
              dict(src=B['sernf'], alt='Creamy cheesecake with flaked almonds and a scoop of vanilla ice cream on a terrace table', kicker='DESSERTS', title='Creamy Cheesecake', desc='Vanilla ice cream, raspberry mousse, fruit.', price='39', cta='See desserts', href=m + '#g-desserts', imgCls='photo', size='object-position: 50% 50%')]
    # JSON trafia do skryptu: encje HTML w danych zamieniamy na znaki
    for x in ev + di:
        for k in list(x):
            if isinstance(x[k], str):
                x[k] = html.unescape(x[k])
    return ev, di

# ---------- strona główna ----------
HOMEC = {
    'pl': dict(res='REZERWACJE TELEFONICZNE', cta='ZADZWOŃ I ZAREZERWUJ', order='Zamów', orr='lub', book='zarezerwuj online',
               daily='CODZIENNIE', kitchen='KUCHNIA', kt='do 22:00', addr='Kazachska 1, Warszawa', seeMenu='Zobacz menu', car='Wydarzenia i dania z karty',
               aboutL='O NAS',
               chefA='Szef', chefB='kuchni.', chefPh='[ZDJĘCIE: KLAUDIUSZ DANOWSKI]', chefAria='Miejsce na zdjęcie szefa kuchni', chefCap='KLAUDIUSZ DANOWSKI', chefRole='SZEF KUCHNI',
               chefLead='Sercem naszej kuchni jest <b>Klaudiusz Danowski</b>, który z niezwykłą dbałością o detale komponuje każde danie.',
               pr=[('Starannie wybrane produkty', 'Każde danie powstaje wyłącznie z wyselekcjonowanych składników.'), ('Precyzja', 'Steki z najlepszych hodowli — do idealnego stopnia wysmażenia i głębi smaku.'), ('Świeżość', 'Owoce morza dostarczane regularnie, dla świeżości i najwyższej jakości.')],
               partyA='Świętuj', partyB='z nami.', partyPh='[ZDJĘCIE: SALA NA PRZYJĘCIE]', partyAlt='Sala Beef & Reef: marmurowy bar, stoły nakryte do kolacji i zielone loże', extAlt='Wejście do Beef & Reef i ogródek z girlandą świateł przy Kazachskiej 1', extCap='KAZACHSKA 1 · OGRÓDEK', partyAria='Miejsce na zdjęcie sali przygotowanej na przyjęcie',
               partyP='Wesela, urodziny, przyjęcia świąteczne i spotkania firmowe — wszystkie szczegóły ustalamy z Tobą indywidualnie.',
               exH='NA WYŁĄCZNOŚĆ', exV='Cała restauracja tylko dla Ciebie i Twoich gości.', offer='POZNAJ OFERTĘ', askDate='Zapytaj o termin', liveAria='Muzyka na żywo i live cooking',
               liveNote='*Siekany tatar wołowy przy stole i smażone krewetki z chorizo.', liveAsk='Zapytaj o najbliższe terminy',
               resA='Rezerwacje', lAddr='ADRES', vAddr='Kazachska 1, 02-999 Warszawa', lHours='GODZINY', vHours='Codziennie 12:00 – 23:00<br>Kuchnia do 22:00', lOnline='ONLINE', vOnline='Rezerwacja online',
               mapK='JAK DOJECHAĆ', mapPlace='Kazachska 1, Warszawa', showMap='POKAŻ MAPĘ', openMaps='Otwórz w Mapach Google ↗',
               mapNote='Mapa Google wczyta się dopiero po kliknięciu. Google może wtedy zapisać pliki cookies —', more='więcej', mapPh='[MAPA GOOGLE — KAZACHSKA 1]', mapAria='Mapa dojazdu do Beef &amp; Reef'),
    'en': dict(res='RESERVATIONS BY PHONE', cta='CALL TO BOOK', order='Order', orr='or', book='book online',
               daily='DAILY', kitchen='KITCHEN', kt='until 22:00', addr='Kazachska 1, Warsaw', seeMenu='See the menu', car='Events and dishes from the menu',
               aboutL='ABOUT US',
               chefA='Head', chefB='chef.', chefPh='[PHOTO: KLAUDIUSZ DANOWSKI]', chefAria='Photo placeholder: head chef', chefCap='KLAUDIUSZ DANOWSKI', chefRole='HEAD CHEF',
               chefLead='At the heart of our kitchen is <b>Klaudiusz Danowski</b>, who composes every dish with remarkable attention to detail.',
               pr=[('Carefully selected produce', 'Every dish is made only from hand-picked ingredients.'), ('Precision', 'Steaks from the finest farms — cooked to perfect doneness and depth of flavour.'), ('Freshness', 'Seafood delivered regularly, for freshness and the highest quality.')],
               partyA='Celebrate', partyB='with us.', partyPh='[PHOTO: ROOM SET FOR A PARTY]', partyAlt='The Beef & Reef dining room: marble bar, tables set for dinner and green banquettes', extAlt='The Beef & Reef entrance and terrace with string lights at Kazachska 1', extCap='KAZACHSKA 1 · TERRACE', partyAria='Photo placeholder: room set for a party',
               partyP='Weddings, birthdays, Christmas parties and corporate events — every detail is arranged with you individually.',
               exH='EXCLUSIVE HIRE', exV='The whole restaurant just for you and your guests.', offer='VIEW THE OFFER', askDate='Ask about a date', liveAria='Live music and live cooking',
               liveNote='*Hand-chopped beef tartare at your table and pan-fried prawns with chorizo.', liveAsk='Ask about upcoming dates',
               resA='Reservations', lAddr='ADDRESS', vAddr='Kazachska 1, 02-999 Warsaw', lHours='OPENING HOURS', vHours='Daily 12:00 – 23:00<br>Kitchen until 22:00', lOnline='ONLINE', vOnline='Book online',
               mapK='GETTING HERE', mapPlace='Kazachska 1, Warsaw', showMap='SHOW MAP', openMaps='Open in Google Maps ↗',
               mapNote='The Google map loads only after you click. Google may then set cookies —', more='learn more', mapPh='[GOOGLE MAP — KAZACHSKA 1]', mapAria='Map: how to find Beef &amp; Reef'),
}
S1 = {'pl': 'Łączymy klasyczne techniki kulinarne z nowoczesnym podejściem. *Steki *z *najlepszych *hodowli, *owoce *morza dostarczane regularnie i elegancka atmosfera — na wyjątkową kolację, spotkanie biznesowe i *celebrację *ważnych *chwil.',
      'en': 'We combine classic culinary techniques with a modern approach. *Steaks *from *the *finest *farms, *seafood delivered regularly and an elegant atmosphere — for a special dinner, a business meeting or *celebrating *the *moments *that *matter.'}
S2 = {'pl': 'W wybrane dni można u nas doświadczyć *muzyki *na *żywo & *live *cookingu*.',
      'en': 'On selected days you can enjoy *live *music & *live *cooking*.'}

def numlist(items, cls='num-list chef-list', rise=True):
    rom = ['I', 'II', 'III', 'IV']
    out = []
    for i, (h, p) in enumerate(items):
        out.append(f'<li class="{"rise d" + str(i+1) if rise else ""}"><span class="num" aria-hidden="true">{rom[i]}</span><div><p class="li-h">{h}</p><p class="li-p">{p}</p></div></li>')
    return f'<ol class="{cls}">' + ''.join(out) + '</ol>'

def home_body(lang):
    c = HOMEC[lang]; t = T[lang]
    return f'''  <main id="tresc" tabindex="-1">
  <section class="{{{{c.hero}}}} hero" aria-labelledby="hero-title">
    <div class="wrap">
      <div class="hero-in">
        <h1 id="hero-title" class="float h1">BEEF <i class="amp">&amp;</i> REEF</h1>
        <p class="float d1 label">{c["res"]}</p>
        <a class="float d1 hero-tel" href="{TEL}">{PHONE}</a>
        <div class="float d2 hero-cta">
          <a id="hero-cta" class="btn btn-gold" href="{TEL}">{c["cta"]}</a>
          <p><a class="u" href="{DELIV}">{c["order"]}</a>{c["orr"]}<a class="u" href="{BOOK}">{c["book"]}</a></p>
        </div>
        <p class="float d3 hero-info">
          <span><span class="k">{c["daily"]}</span>12:00 – 23:00</span><span class="dot" aria-hidden="true"></span>
          <span><span class="k">{c["kitchen"]}</span>{c["kt"]}</span><span class="dot" aria-hidden="true"></span>
          <span>{c["addr"]}</span><span class="dot" aria-hidden="true"></span>
          <a class="u" href="{href(lang,"menu")}">{c["seeMenu"]}</a>
        </p>
      </div>
      <div class="rise d4 car-wrap">
{carousel(lang, c["car"], 5)}      </div>
    </div>
  </section>

  <section id="o-nas" data-rv="about" class="{{{{c.about}}}} about sec" aria-labelledby="about-title" style="scroll-margin-top: 64px">
    <div class="wrap">
      <h2 id="about-title" class="rise label">{c["aboutL"]}</h2>
      {stmt("stmt1")}
      <a class="u rise tlink" href="{href(lang,"menu")}" style="margin-top: 48px">{c["seeMenu"]} <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section data-rv="chef" data-plx="chef" class="{{{{c.chef}}}} sec on-ground ruled" aria-labelledby="chef-title">
    <div class="wrap">
      {split(c["chefA"], c["chefB"], id_="chef-title")}
      <div class="chef">
        <figure class="chef-fig plx" style="transform: translateY({{{{px.chef}}}}px)">
          <div class="ph" role="img" aria-label="{c["chefAria"]}"><span class="t">{c["chefPh"]}</span><span class="frame" aria-hidden="true"></span></div>
          <figcaption>{c["chefCap"]} <span class="muted">· {c["chefRole"]}</span></figcaption>
        </figure>
        <p class="rise chef-lead">{c["chefLead"]}</p>
        {numlist(c["pr"])}
      </div>
    </div>
  </section>

  <section id="przyjecia" data-rv="party" data-plx="party" class="{{{{c.party}}}} sec ruled" aria-labelledby="party-title">
    <div class="wrap">
      {split(c["partyA"], c["partyB"], id_="party-title")}
      <div class="party">
        <figure class="pic party-ph plx" style="transform: translateY({{{{px.party}}}}px)"><img src="{B["bar"]}" alt="{c["partyAlt"]}" loading="lazy"><span class="frame" aria-hidden="true"></span></figure>
        <div class="rise party-txt">
          <p class="p">{c["partyP"]}</p>
          <div class="callout"><div class="callout-in"><p class="h">{c["exH"]}</p><p class="v">{c["exV"]}</p></div></div>
          <div class="btns">
            <a class="btn btn-ink" href="{href(lang,"party")}">{c["offer"]}</a>
            <a class="u tlink" href="{TEL}">{c["askDate"]}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section data-rv="live" class="{{{{c.live}}}} sec on-ground ruled live" aria-label="{c["liveAria"]}">
    <div class="wrap">
      {stmt("stmt2")}
      <p class="rise note">{c["liveNote"]} <a class="u" href="{TEL}">{c["liveAsk"]}</a></p>
    </div>
  </section>

  <section id="kontakt" data-rv="contact" class="{{{{c.contact}}}} sec ruled" aria-labelledby="contact-title" style="scroll-margin-top: 64px">
    <div class="wrap">
      {split(c["resA"], PHONE, id_="contact-title", extra=" sm", b_is_tel=True)}
      <div class="rise d2 info-grid">
        <div class="info"><p class="label">{c["lAddr"]}</p><p class="v">{c["vAddr"]}</p><a class="u tlink" href="{MAPS}" target="_blank" rel="noopener">{T[lang]["dir"]}</a></div>
        <div class="info"><p class="label">{c["lHours"]}</p><p class="v">{c["vHours"]}</p></div>
        <div class="info"><p class="label">{c["lOnline"]}</p><a class="u v" href="{BOOK}">{c["vOnline"]}</a><br><a class="u v" href="mailto:{MAIL}">{MAIL}</a></div>
      </div>
      <div class="find">
      <figure class="rise d3 pic"><img src="{B["ext"]}" alt="{c["extAlt"]}" loading="lazy"><span class="frame" aria-hidden="true"></span><figcaption>{c["extCap"]}</figcaption></figure>
      <div class="rise d4 map" role="region" aria-label="{c["mapAria"]}">
        <span class="map-lines" aria-hidden="true"></span>
        <span class="frame" aria-hidden="true"></span>
        <sc-if value="{{{{mapClosed}}}}" hint-placeholder-val="{{{{ true }}}}">
          <div class="map-in">
            <span class="map-pin" aria-hidden="true"></span>
            <p class="label" style="margin-top: 16px">{c["mapK"]}</p>
            <p class="map-place">{c["mapPlace"]}</p>
            <div class="btns" style="justify-content: center">
              <button class="btn btn-ink btn-m" type="button" onClick="{{{{showMap}}}}">{c["showMap"]}</button>
              <a class="u tlink" href="{MAPS_OPEN}" target="_blank" rel="noopener" style="font-size: 18px">{c["openMaps"]}<span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0)">{t["newTab"]}</span></a>
            </div>
            <p class="map-note">{c["mapNote"]} <a class="u" href="{href(lang,"cookies")}">{c["more"]}</a></p>
          </div>
        </sc-if>
        <sc-if value="{{{{mapOpen}}}}" hint-placeholder-val="{{{{ false }}}}">
          <div class="map-in"><span class="map-pin" aria-hidden="true"></span><p class="label" style="margin-top: 16px">{c["mapPh"]}</p><a class="u tlink" href="{MAPS_OPEN}" target="_blank" rel="noopener" style="font-size: 18px">{c["openMaps"]}</a></div>
        </sc-if>
      </div>
      </div>
    </div>
  </section>
  </main>
'''

# ---------- menu ----------
MENUC = {
    'pl': dict(a='Nasza', b='karta.', kick='KARTA MENU', lead='Steki z najlepszych hodowli, przygotowywane z najwyższą precyzją, oraz regularnie dostarczane owoce morza. Ceny w PLN.',
               langL='Język menu', pdf=[('PDF po polsku', '#'), ('PDF in English', '#')], pdfL='MENU DO POBRANIA', picks='POLECA SZEF KUCHNI', car='Polecane dania', cats='Kategorie menu',
               resA='Zarezerwuj', resB='stolik.', resLine='Codziennie 12:00 – 23:00 · Kuchnia czynna do 22:00', call='ZADZWOŃ', online='REZERWACJA ONLINE',
               liveNote='*Siekany tatar wołowy przy stole oraz smażone krewetki z chorizo w formie live cookingu.', liveAsk='Zapytaj o najbliższe terminy', liveAria='Muzyka na żywo i live cooking'),
    'en': dict(a='Our', b='menu.', kick='THE MENU', lead='Steaks from the finest farms, prepared with the utmost precision, and seafood delivered regularly. Prices in PLN.',
               langL='Menu language', pdf=[('PDF in English', '#'), ('PDF in Polish', '#')], pdfL='DOWNLOAD THE MENU', picks='THE CHEF RECOMMENDS', car='Recommended dishes', cats='Menu sections',
               resA='Book', resB='a table.', resLine='Daily 12:00 – 23:00 · Kitchen open until 22:00', call='CALL', online='BOOK ONLINE',
               liveNote='*Hand-chopped beef tartare at your table and pan-fried prawns with chorizo, cooked live.', liveAsk='Ask about upcoming dates', liveAria='Live music and live cooking'),
}

def menu_body(lang):
    c = MENUC[lang]
    seg = (f'<a href="{href("pl","menu")}" lang="pl"' + (' aria-current="true"' if lang == 'pl' else '') + '>PL</a>'
           f'<a href="{href("en","menu")}" lang="en"' + (' aria-current="true"' if lang == 'en' else '') + '>EN</a>')
    pdfs = ''.join(f'<a class="u" href="{h}">{n}</a>' for n, h in c['pdf'])
    return f'''  <main id="tresc" tabindex="-1">
  <section class="{{{{c.hero}}}} phead" aria-labelledby="menu-title">
    <div class="wrap">
      <p class="float kicker">{c["kick"]}</p>
      {split(c["a"], c["b"], tag="h1", id_="menu-title")}
      <div class="phead-row">
        <p class="float d2 lead">{c["lead"]}</p>
        <div class="float d3 side">
          <div class="seg" role="group" aria-label="{c["langL"]}">{seg}</div>
          <p class="pdfs"><span class="label" style="margin-right: 8px">{c["pdfL"]}</span>{pdfs}</p>
        </div>
      </div>
    </div>
  </section>

  <section data-rv="picks" class="{{{{c.picks}}}} picks" aria-labelledby="picks-title">
    <div class="wrap">
      <h2 id="picks-title" class="rise kicker">{c["picks"]}</h2>
      <div class="rise d1 car-wrap" style="margin-top: 0">
{carousel(lang, c["car"], 5)}      </div>
    </div>
  </section>

  <nav class="catbar" aria-label="{c["cats"]}">
    <div id="rx-chips" class="chips">
      <sc-for list="{{{{chips}}}}" as="ch" hint-placeholder-count="9"><a id="{{{{ch.id}}}}" class="{{{{ch.cls}}}}" href="{{{{ch.href}}}}" aria-current="{{{{ch.cur}}}}">{{{{ch.t}}}}</a></sc-for>
    </div>
  </nav>
  <div class="mbody" lang="{lang}">
    <div class="wrap"><div class="mlist"><dc-import name="MenuList" lang="{lang}" hint-size="100%,6000px"></dc-import></div></div>
  </div>

  <section data-rv="live" class="{{{{c.live}}}} sec on-ground ruled live" aria-label="{c["liveAria"]}">
    <div class="wrap">
      {stmt("stmt2")}
      <p class="rise note">{c["liveNote"]} <a class="u" href="{TEL}">{c["liveAsk"]}</a></p>
    </div>
  </section>

  <section data-rv="res" class="{{{{c.res}}}} sec ruled" aria-labelledby="res-title">
    <div class="wrap">
      {split(c["resA"], c["resB"], id_="res-title")}
      <div class="ask">
        <div class="rise l"><a class="tel" href="{TEL}" style="font-size: clamp(36px, 4.4vw, 64px); line-height: 1.1; font-weight: 700; white-space: nowrap">{PHONE}</a><p class="line">{c["resLine"]}</p></div>
        <div class="rise d1 r"><a class="btn btn-gold" href="{TEL}">{c["call"]}</a><a class="btn btn-line" href="{BOOK}">{c["online"]}</a></div>
      </div>
    </div>
  </section>
  </main>
'''

# ---------- przyjęcia ----------
PC = D['PARTY']
PARTYX = {
    'pl': dict(a='Twoje', b='przyjęcie.', askA='Zapytaj', askB='o termin.', excl='Chcesz, aby *cała *restauracja była *tylko *dla *Was? Zarezerwujemy ją *na *wyłączność na Twoje wydarzenie.', callout='Dla Ciebie i Twoich gości: termin, liczba gości, menu i oprawa — wszystko dopasujemy indywidualnie.', salaAlt='Sala Beef & Reef w słońcu: stoły nakryte do kolacji, zielone welurowe loże, przeszklona ściana', pionAlt='Sala Beef & Reef: stoły nakryte do kolacji, ściana z zielonych roślin i pergolowe lampy'),
    'en': dict(a='Your', b='party.', askA='Ask', askB='about a date.', excl='Want *the *entire *restaurant *just *for *your *group? We’ll reserve it *exclusively for your event.', callout='Just for you and your guests: date, number of guests, menu and setting — all tailored to you.', salaAlt='The sunlit Beef & Reef dining room: tables set for dinner, green velvet banquettes, glass wall', pionAlt='The Beef & Reef dining room: tables set for dinner, a living plant wall and pendant lights'),
}
S3 = {k: v['excl'] for k, v in PARTYX.items()}

def party_body(lang):
    c = PC[lang]; x = PARTYX[lang]
    mailto = f'mailto:{MAIL}?subject={c["subject"]}'
    occ = ''.join(f'<li class="rise d{i+1}"><h3>{h}</h3><p>{p}</p></li>' for i, (h, p) in enumerate(c['occasions']))
    rom = ['I', 'II', 'III']
    steps = ''.join(f'<li class="rise d{i+1}"><span class="num" aria-hidden="true">{rom[i]}</span><p class="li-h">{h}</p><p class="li-p" style="margin-top: 0">{p}</p></li>' for i, (h, p) in enumerate(c['steps']))
    return f'''  <main id="tresc" tabindex="-1">
  <section class="{{{{c.hero}}}} phead" aria-labelledby="party-h1">
    <div class="wrap">
      <p class="float kicker">{up(c["eyebrow"])}</p>
      {split(x["a"], x["b"], tag="h1", id_="party-h1")}
      <div class="phead-row">
        <p class="float d2 lead">{c["intro"]}</p>
        <div class="float d3 side">
          <a class="btn btn-gold" href="{TEL}">{c["callAsk"]}</a>
          <a class="u tlink" href="{mailto}">{c["write"]}</a>
        </div>
      </div>
    </div>
  </section>
  <div data-rv="photo" class="{{{{c.photo}}}} wrap">
    <figure class="rise pic wide-ph"><img src="{B["sala"]}" alt="{x["salaAlt"]}" loading="lazy"><span class="frame" aria-hidden="true"></span></figure>
  </div>

  <section data-rv="occ" class="{{{{c.occ}}}} sec" aria-labelledby="{c["occId"]}">
    <div class="wrap">
      <div class="center"><h2 id="{c["occId"]}" class="rise stitle">{c["occTitle"]}</h2></div>
      <ul class="occ">{occ}</ul>
      <p class="rise occ-more">{c["occMore"]}</p>
    </div>
  </section>

  <section data-rv="excl" class="{{{{c.excl}}}} sec on-ground ruled excl center" aria-labelledby="{c["exId"]}">
    <div class="wrap">
      <h2 id="{c["exId"]}" class="rise label" style="margin-bottom: 48px; color: var(--ink)">{up(c["exEyebrow"])}</h2>
      {stmt("stmt3")}
      <div class="excl-grid">
        <figure class="rise d1 pic"><img src="{B["salap"]}" alt="{x["pionAlt"]}" loading="lazy"><span class="frame" aria-hidden="true"></span></figure>
        <div class="rise d2 callout"><div class="callout-in"><p class="h">{html.unescape(c["exTitle"]).replace("<br>", " ")}</p><p class="v">{x["callout"]}</p></div></div>
      </div>
    </div>
  </section>

  <section data-rv="how" class="{{{{c.how}}}} sec ruled" aria-labelledby="{c["howId"]}">
    <div class="wrap">
      <div class="center"><h2 id="{c["howId"]}" class="rise stitle">{c["howTitle"]}</h2></div>
      <ol class="steps">{steps}</ol>
    </div>
  </section>

  <section id="zapytanie" data-rv="ask" class="{{{{c.ask}}}} sec on-ground ruled" aria-labelledby="ask-title">
    <div class="wrap">
      {split(x["askA"], x["askB"], id_="ask-title")}
      <div class="ask">
        <div class="rise l">
          <a href="{TEL}" style="font-size: clamp(36px, 4.4vw, 64px); line-height: 1.1; font-weight: 700; white-space: nowrap">{PHONE}</a>
          <a class="u mail" href="{mailto}">{MAIL}</a>
          <p class="line">{c["askLine"]}</p>
        </div>
        <div class="rise d1 r"><a class="btn btn-gold" href="{TEL}">{c["callAsk"]}</a><a class="btn btn-line" href="{mailto}">{c["mail"]}</a></div>
      </div>
    </div>
  </section>
  </main>
'''

# ---------- strony prawne ----------
LEGALX = {
    'privacy': {'pl': ('Polityka', 'prywatności.', 'SPIS TREŚCI'), 'en': ('Privacy', 'policy.', 'CONTENTS')},
    'cookies': {'pl': ('Pliki', 'cookies.', 'W SKRÓCIE'), 'en': ('Cookie', 'policy.', 'IN SHORT')},
}
COOKIE_SUM = {'pl': ['Bez śledzenia.', 'Bez reklam.', 'Bez banera zgody.'], 'en': ['No tracking.', 'No ads.', 'No consent banner.']}

def legal_body(lang, kind):
    L = D['legal'][kind + '_' + lang]
    a, b, asideT = LEGALX[kind][lang]
    body = L['body']
    # linki między stronami → plansze
    if lang == 'pl':
        body = body.replace('href="cookies.html"', f'href="{href("pl","cookies")}"').replace('href="polityka-prywatnosci.html"', f'href="{href("pl","privacy")}"')
    else:
        body = body.replace('href="cookies.html"', f'href="{href("en","cookies")}"').replace('href="privacy.html"', f'href="{href("en","privacy")}"')
    body = re.sub(r'\n\s+', '\n      ', body)
    if kind == 'privacy':
        heads = re.findall(r'<h2 id="(pp-\d+)-h">(\d+)\. ([^<]+)</h2>', body)
        toc = ''.join(f'<li><a href="#{i}"><span class="n">{n}.</span><span>{h}</span></a></li>' for i, n, h in heads)
        aside = f'<nav class="toc" aria-labelledby="toc-h"><h2 id="toc-h" class="label">{asideT}</h2><ol>{toc}</ol></nav>'
    else:
        lines = ''.join(f'<p class="v">{s}</p>' for s in COOKIE_SUM[lang])
        aside = f'<div class="callout"><div class="callout-in"><p class="h">{asideT}</p>{lines}</div></div>'
    return f'''  <main id="tresc" tabindex="-1">
  <section class="{{{{c.hero}}}} lhead" aria-labelledby="legal-h1">
    <div class="wrap">
      <p class="float kicker">{L["eyebrow"]}</p>
      {split(a, b, tag="h1", id_="legal-h1")}
      <p class="float d2 since">{L["since"]}</p>
    </div>
  </section>
  <div class="wrap">
    <div class="lgrid ruled" style="padding-top: 64px">
      <aside class="laside"><div class="laside-in">{aside}</div></aside>
      <div class="lmain">
      <p class="llead">{L["lead"]}</p>
{body}
      </div>
    </div>
  </div>
  </main>
'''

# ---------- pierwsza wizyta: wybór języka ----------
def lang_picker(href_pl, href_en, canvas=False):
    on_x = ' onClick="{{closePicker}}"' if canvas else ''
    on_a = ' onClick="{{closePicker}}"' if canvas else ''
    return f'''<div class="lp-scrim"></div>
  <div class="lp" role="dialog" aria-modal="true" aria-labelledby="lp-title" aria-describedby="lp-desc">
    <div class="lp-in">
      <button class="icon-btn lp-x" type="button" aria-label="Zamknij · Close"{on_x}>{I_X}</button>
      <img class="lp-logo" src="{B["logo"]}" alt="Beef &amp; Reef" width="64" height="64">
      <h2 id="lp-title" class="lp-h">Witamy <i class="amp">·</i> <span lang="en">Welcome</span></h2>
      <span class="lp-bar" aria-hidden="true"></span>
      <p id="lp-desc" class="label">Wybierz język · <span lang="en">Choose language</span></p>
      <div class="lp-btns">
        <a class="btn btn-gold" href="{href_pl}" hreflang="pl" data-lang="pl"{on_a}>Polski</a>
        <a class="btn btn-line" href="{href_en}" lang="en" hreflang="en" data-lang="en"{on_a}>English</a>
      </div>
      <p class="lp-note">Język zmienisz w każdej chwili w nagłówku strony.<br><span lang="en">You can switch the language any time in the header.</span></p>
    </div>
  </div>'''

def lang_board(w, h):
    props = {'przyciski': {'editor': 'enum', 'options': ['Złote', 'Zielone', 'Zielone bez ramki'], 'default': 'Zielone'},
             'theme': {'editor': 'enum', 'options': ['auto', 'light', 'dark'], 'default': 'auto'}, '$preview': {'width': w, 'height': h}}
    dp = json.dumps(props, ensure_ascii=False).replace('&', '&amp;').replace("'", '&#39;')
    return f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Beef &amp; Reef — wybór języka (pierwsza wizyta)</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
{CSS}
</style>
</helmet>
<div style="position: relative; width: 100%; height: 100vh; overflow: hidden">
  <dc-import name="Start" theme="{{{{theme}}}}" ruch="Wyłączony" przyciski="{{{{przyciski}}}}" hint-size="100%,{h}px"></dc-import>
  <sc-if value="{{{{open}}}}" hint-placeholder-val="{{{{ true }}}}">
  <div class="{{{{rootCls}}}}" data-theme="{{{{resolved}}}}">
  {lang_picker("Start.dc.html", "StartEN.dc.html", canvas=True)}
  </div>
  </sc-if>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{dp}'>
class Component extends DCLogic {{
  constructor(props) {{
    super(props);
    let auto = 'light';
    try {{ if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) auto = 'dark'; }} catch (e) {{}}
    this.state = {{ open: true, auto: auto }};
  }}
  renderVals() {{
    const p = this.props.theme ?? 'auto';
    const b = this.props.przyciski ?? 'Zielone';
    return {{
      theme: p, przyciski: b, open: this.state.open,
      resolved: p === 'light' || p === 'dark' ? p : this.state.auto,
      rootCls: 'rx lp-layer' + (b === 'Zielone' ? ' gbtn' : (b === 'Zielone bez ramki' ? ' gbtn gflat' : '')),
      closePicker: () => this.setState({{ open: false }})
    }};
  }}
}}
</script>
</body>
</html>
'''

# ---------- składanie strony ----------
TITLE = {
    ('pl', 'home'): 'Beef &amp; Reef — strona główna', ('en', 'home'): 'Beef &amp; Reef — home',
    ('pl', 'menu'): 'Beef &amp; Reef — menu', ('en', 'menu'): 'Beef &amp; Reef — menu (EN)',
    ('pl', 'party'): 'Beef &amp; Reef — przyjęcia i eventy', ('en', 'party'): 'Beef &amp; Reef — parties &amp; events',
    ('pl', 'privacy'): 'Beef &amp; Reef — polityka prywatności', ('en', 'privacy'): 'Beef &amp; Reef — privacy policy',
    ('pl', 'cookies'): 'Beef &amp; Reef — cookies', ('en', 'cookies'): 'Beef &amp; Reef — cookies (EN)',
}
DRUK = {
    ('pl', 'home'): ('Main', 'Home-Mobile'), ('en', 'home'): ('Main-EN', 'Home-Mobile-EN'),
    ('pl', 'menu'): ('Menu', 'Menu-Mobile'), ('pl', 'party'): ('Party', 'Party-Mobile'), ('en', 'party'): ('Party-EN', 'Party-Mobile-EN'),
    ('pl', 'privacy'): ('Privacy', 'Privacy'), ('pl', 'cookies'): ('Cookies', 'Cookies'),
}
H = {  # wysokości plansz wg szerokości (szacunek, z zapasem)
    'home': {1440: 7000, 1024: 7100, 768: 7300, 390: 8000},
    'menu': {1440: 8000, 1024: 8000, 768: 8000, 390: 8000},
    'party': {1440: 5600, 1024: 5700, 768: 6200, 390: 6800},
    'privacy': {1440: 4800, 1024: 5200, 768: 6000, 390: 7600},
    'cookies': {1440: 3600, 1024: 3800, 768: 4200, 390: 5000},
}
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&amp;display=swap" rel="stylesheet">'

def page(lang, kind):
    t = T[lang]
    cfg = dict(t={k: html.unescape(t[k]) for k in ('dark', 'light', 'play', 'pause')}, rv=[], words={}, plx=[], heroWatch=None,
               events=[], dishes=[], eventDefault='Św. Marcin', cats=None, druk=bool(DRUK.get((lang, kind))))
    if kind == 'home':
        body = home_body(lang); ev, di = slides(lang)
        cfg.update(rv=['about', 'chef', 'party', 'live', 'contact'], words={'stmt1': S1[lang], 'stmt2': S2[lang]},
                   plx=[['chef', 0.05], ['party', -0.06]], heroWatch='hero-cta', events=ev, dishes=di)
        bar = pbar(lang, BOOK, t['barOnline'])
    elif kind == 'menu':
        body = menu_body(lang); ev, di = slides(lang)
        idx = 1 if lang == 'pl' else 2
        cfg.update(rv=['picks', 'live', 'res'], words={'stmt2': S2[lang]}, dishes=di, cats=[[c[0], c[idx]] for c in D['CATS']])
        bar = pbar(lang, BOOK, t['barOnline'])
    elif kind == 'party':
        body = party_body(lang)
        cfg.update(rv=['photo', 'occ', 'excl', 'how', 'ask'], words={'stmt3': S3[lang]})
        bar = pbar(lang, f'mailto:{MAIL}?subject={PC[lang]["subject"]}', t['email'])
    else:
        body = legal_body(lang, kind)
        bar = pbar(lang, BOOK, t['barOnline'])
    props = {}
    if cfg['druk']:
        props['wariant'] = {'editor': 'enum', 'options': ['Ruch', 'Druk'], 'default': 'Ruch'}
    if kind == 'home':
        props['wydarzenie'] = {'editor': 'enum', 'options': ['Św. Marcin', 'Wyłączone'], 'default': 'Św. Marcin'}
    props['ruch'] = {'editor': 'enum', 'options': ['Włączony', 'Wyłączony'], 'default': 'Włączony'}
    props['przyciski'] = {'editor': 'enum', 'options': ['Złote', 'Zielone', 'Zielone bez ramki'], 'default': 'Zielone' if (lang, kind) == ('pl', 'home') else 'Złote'}
    props['theme'] = {'editor': 'enum', 'options': ['auto', 'light', 'dark'], 'default': 'auto'}
    props['$preview'] = {'width': 1440, 'height': H[kind][1440]}
    dp = json.dumps(props, ensure_ascii=False).replace('&', '&amp;').replace("'", '&#39;')
    druk = ''
    if cfg['druk']:
        dd, dm = DRUK[(lang, kind)]
        druk = (f'<sc-if value="{{{{drukDesk}}}}" hint-placeholder-val="{{{{ false }}}}"><dc-import name="{dd}" theme="{{{{drukTheme}}}}" hint-size="100%,6400px"></dc-import></sc-if>\n'
                f'<sc-if value="{{{{drukMob}}}}" hint-placeholder-val="{{{{ false }}}}"><dc-import name="{dm}" theme="{{{{drukTheme}}}}" hint-size="100%,7400px"></dc-import></sc-if>\n')
    js = 'const CFG = ' + json.dumps(cfg, ensure_ascii=False) + ';\n' + JS
    js = js.replace('</script', '<\\/script')
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{TITLE[(lang, kind)]}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
{CSS}
</style>
</helmet>
<div style="width: 100%">
<sc-if value="{{{{isRuch}}}}" hint-placeholder-val="{{{{ true }}}}">
<div class="{{{{rootCls}}}}" data-theme="{{{{theme}}}}" lang="{lang}">
{header(lang, kind)}{body}{footer(lang)}{bar}</div>
</sc-if>
{druk}</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{dp}'>
{js}</script>
</body>
</html>
'''

def wrapper(lang, kind, w, theme=None, title=''):
    name = F[lang][kind]
    h = H[kind][w]
    druk = bool(DRUK.get((lang, kind)))
    props = {}
    attrs = []
    if druk:
        props['wariant'] = {'editor': 'enum', 'options': ['Ruch', 'Druk'], 'default': 'Ruch'}; attrs.append('wariant="{{wariant}}"')
    if kind == 'home':
        props['wydarzenie'] = {'editor': 'enum', 'options': ['Św. Marcin', 'Wyłączone'], 'default': 'Św. Marcin'}; attrs.append('wydarzenie="{{wydarzenie}}"')
    props['ruch'] = {'editor': 'enum', 'options': ['Włączony', 'Wyłączony'], 'default': 'Włączony'}; attrs.append('ruch="{{ruch}}"')
    props['przyciski'] = {'editor': 'enum', 'options': ['Złote', 'Zielone', 'Zielone bez ramki'], 'default': 'Złote'}; attrs.append('przyciski="{{przyciski}}"')
    if theme:
        attrs.append(f'theme="{theme}"')
    else:
        props['theme'] = {'editor': 'enum', 'options': ['auto', 'light', 'dark'], 'default': 'auto'}; attrs.append('theme="{{theme}}"')
    props['$preview'] = {'width': w, 'height': h}
    dp = json.dumps(props, ensure_ascii=False).replace('&', '&amp;').replace("'", '&#39;')
    keys = [k for k in props if not k.startswith('$')]
    defaults = {k: props[k]['default'] for k in keys}
    rv = ', '.join(f"{k}: this.props.{k} ?? {json.dumps(defaults[k], ensure_ascii=False)}" for k in keys)
    bg = '#0a0a0a' if theme == 'dark' else 'transparent'
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0;background:{bg}}}
</style>
</helmet>
<div style="width: 100%">
  <dc-import name="{name}" {" ".join(attrs)} hint-size="100%,{h}px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{dp}'>
class Component extends DCLogic {{
  renderVals() {{ return {{ {rv} }}; }}
}}
</script>
</body>
</html>
'''

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    written = []
    for lang in ('pl', 'en'):
        for kind in ('home', 'menu', 'party', 'privacy', 'cookies'):
            fn = F[lang][kind] + '.dc.html'
            open(os.path.join(OUT, fn), 'w').write(page(lang, kind))
            written.append(fn)
    for fn, w, h in (('Jezyk.dc.html', 1440, 900), ('Jezyk-390.dc.html', 390, 844)):
        open(os.path.join(OUT, fn), 'w').write(lang_board(w, h))
        written.append(fn)
    json.dump(written, open(os.path.join(OUT, '..', 'pages.json'), 'w'))
    print('\n'.join(written))
