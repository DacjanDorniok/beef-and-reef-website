# Beef & Reef — strona internetowa (wersja testowa)

Nowa strona restauracji Beef & Reef (Kazachska 1, Warszawa). Zbudowana na podstawie projektu z Claude Design (canvas) i systemu Beef & Reef Design System.

**Strony (PL):** `index.html` (strona główna), `menu.html`, `przyjecia.html`, `polityka-prywatnosci.html`, `cookies.html`, `404.html`.
**Strony (EN):** `en/index.html`, `en/menu.html`, `en/parties.html`, `en/privacy.html`, `en/cookies.html`.

## Co jest w środku
- Responsywny układ (telefon, tablet, desktop), menu „burger” poniżej 1200 px, przyklejony pasek „Zadzwoń” na telefonach.
- Kierunek „druk” (07.11.2026, wg karty menu i ulotki Św. Marcin): biel → chłodna szarość, złote linie, zielona odznaka z ramką, pogrubione tytuły, białe ramki-callouty, jasna stopka. Tryb ciemny w tym samym stylu.
- Strona główna: masthead z podwójną złotą linią, telefon w nagłówku pojawia się dopiero po przewinięciu hero (desktop).
- Blok wydarzenia (teraz: Św. Marcin 7–15.11) — stała `EVENT` w `src/build.js` (`on: false` wyłącza, po dacie `until` chowa się sam).
- Mapa Google ładowana dopiero po kliknięciu „Pokaż mapę”; „Wyznacz trasę” otwiera nawigację w Mapach Google.
- Nagłówek: Start, Menu, Przyjęcia, O nas, Kontakt; cichy przełącznik języka (globus) i trybu jasny/ciemny.
- Pasek kategorii w menu przyklejony bezpośrednio pod nagłówkiem; kliknięcie kategorii przewija tak, że jej tytuł jest widoczny.
- Okno wyboru języka przy pierwszej wizycie (tylko strona główna, wejście bezpośrednie): na desktopie okno modalne, na telefonie panel od dołu. Wybór zapisywany w `localStorage` (`br-lang`).
- Tryb jasny / ciemny — domyślnie według ustawień urządzenia, wybór zapamiętywany (`br-theme`).
- Dostępność (WCAG 2.1/2.2 AA): kontrast, „Przejdź do treści”, widoczny fokus, przyciski min. 44 px, `prefers-reduced-motion`. Sprawdzone narzędziem axe-core — 0 błędów.
- Czcionka Cormorant Garamond hostowana lokalnie (licencja SIL OFL 1.1) — bez Google Fonts (RODO).
- Dane strukturalne schema.org `Restaurant`, `hreflang` PL/EN, obraz do udostępniania `assets/img/og-image.jpg`.

## Struktura
- `docs/` — gotowa strona (GitHub Pages serwuje ten folder).
- `src/build.js` — generator stron (teksty PL i EN są w tym pliku); `src/menu-source.dc.html` — dane menu (komponent MenuList z projektu).
- Adres strony do `og:image`, `canonical` i `hreflang` ustawia stała `SITE` w `src/build.js` — zmień ją przy przenosinach na własną domenę.

Przebudowa po zmianach: `node src/build.js`

## Do uzupełnienia przed startem
- Zdjęcia: szef kuchni, sala; licencja na zdjęcie steków w pełnej rozdzielczości.
- Linki do PDF menu (teraz `#`).
- Polityka prywatności i cookies: dane firmy ([NAZWA FIRMY], [NIP], [KRS/CEIDG], [DOSTAWCA SYSTEMU REZERWACJI], [OKRES], [DATA]) i przegląd prawny. Mapa jest ładowana po kliknięciu — opisać to w polityce cookies.
