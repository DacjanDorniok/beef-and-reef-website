# Beef & Reef — strona internetowa (wersja testowa)

Nowa strona restauracji Beef & Reef (Kazachska 1, Warszawa). Zbudowana na podstawie projektu z Claude Design (canvas) i systemu Beef & Reef Design System.

**Strony (PL):** `index.html` (strona główna), `menu.html`, `przyjecia.html`, `polityka-prywatnosci.html`, `cookies.html`, `404.html`.
**Strony (EN):** `en/index.html`, `en/menu.html`, `en/parties.html`, `en/privacy.html`, `en/cookies.html`.

## Co jest w środku
- Kierunek „Ruch” (08.11.2026, wg samara.com/homes): spokojny ruch, który pracuje z tekstem — wejścia sekcji, nagłówki „słowo ——— słowo” z zieloną linią, zdania zapalające się przy przewijaniu, delikatna paralaksa. Wyłącza się przy `prefers-reduced-motion`.
- Responsywność: desktop (≥1200), laptop (1100–1199), tablet poziomo (<1100: menu w szufladzie, kompaktowy przycisk „Zadzwoń”), tablet pionowo (600–899), telefon (<600: pasek „Zadzwoń / Online” na dole). Sprawdzone przy 1440, 1024, 768, 390 i 360 px.
- Karuzela na stronie głównej (wydarzenia + dania) i w menu („Poleca szef kuchni”): przeciąganie palcem/myszą, strzałki, pauza, autoodtwarzanie co 5,2 s. Wydarzenie (Św. Marcin) jest pierwszym slajdem i znika samo po dacie `until`.
- Zdjęcia restauracji: ogródek (kontakt, obok mapy), bar i sala (strona główna, przyjęcia).
- Przyciski główne w kolorze zieleni ze złotą ramką; złote: stała `BUTTONS` w `src/ruch/site.py`.
- Mapa Google ładowana dopiero po kliknięciu „Pokaż mapę”.
- Okno wyboru języka przy pierwszej wizycie (tylko strona główna, wejście bezpośrednie): desktop — okno na środku, telefon — panel od dołu; złoty przycisk = język przeglądarki; wybór w `localStorage` (`br-lang`).
- Tryb jasny / ciemny — domyślnie według ustawień urządzenia, wybór zapamiętywany (`br-theme`).
- Dostępność (WCAG 2.1 AA): axe-core — 0 błędów (jasny i ciemny, desktop i telefon).
- Czcionka Cormorant Garamond hostowana lokalnie (także kursywa 300/400) — bez Google Fonts.
- Dane strukturalne schema.org `Restaurant`, `hreflang` PL/EN, `og:image`.

## Struktura
- `docs/` — gotowa strona (GitHub Pages serwuje ten folder). Nie edytuj ręcznie.
- `src/ruch/` — generator kierunku „Ruch”, wspólny z płótnem Claude Design:
  - `gen.py` szablony stron (te same co na płótnie), `style.css` style, `logic.js` logika płótna, `site.py` wersja statyczna strony, `site.js` → `docs/assets/js/main.js`, `fonts.css`, `menu.css`.
  - `extract.js` czyta teksty z `src/build.js` i menu z `src/menu-source.dc.html` do `content.json`.
- `src/build.js` — teksty PL i EN (źródło treści); poprzednią wersję „druk” zbudujesz przez `node src/build.js --legacy`.

Przebudowa po zmianach: `node src/ruch/extract.js && python3 src/ruch/site.py`

## Do uzupełnienia przed startem
- Zdjęcie szefa kuchni. Zdjęcie steków z Adobe Stock (na płótnie) — po zakupie licencji podmienić; na stronie do tego czasu jest wycięte zdjęcie steków.
- Opis sernika w menu a zdjęcie (migdały, lody, winogrona) — ujednolicić.
- Linki do PDF menu (teraz `#`).
- Polityka prywatności i cookies: dane firmy ([NAZWA FIRMY], [NIP], [KRS/CEIDG], [DOSTAWCA SYSTEMU REZERWACJI], [OKRES], [DATA]) i przegląd prawny. Mapa jest ładowana po kliknięciu — opisać to w polityce cookies.
