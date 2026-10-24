# Beef & Reef — strona internetowa (wersja testowa)

Nowa strona restauracji Beef & Reef (Kazachska 1, Warszawa). Zbudowana na podstawie projektu z Claude Design i systemu Beef & Reef Design System.

**Strony:** `index.html` (strona główna), `menu.html` (menu PL/EN), `przyjecia.html` (przyjęcia i eventy), `404.html`.

## Co jest w środku
- Responsywny układ (telefon, tablet, desktop), menu „burger” poniżej 1200 px, przyklejony pasek „Zadzwoń” na telefonach.
- Tryb jasny / ciemny — domyślnie według ustawień urządzenia, przełącznik w nagłówku, wybór zapamiętywany.
- Dostępność (WCAG 2.1/2.2 AA): kontrast, „Przejdź do treści”, widoczny fokus, przyciski min. 44 px, pauza wideo, `prefers-reduced-motion`. Sprawdzone automatycznie narzędziem axe-core — 0 błędów.
- Czcionka Cormorant Garamond hostowana lokalnie (licencja SIL OFL 1.1) — bez Google Fonts (RODO).
- Dane strukturalne schema.org `Restaurant` dla Google.

## Struktura
- `docs/` — gotowa strona (GitHub Pages serwuje ten folder).
- `src/build.js` — generator stron; `src/menu-source.dc.html` — dane menu (z komponentu MenuList).

Przebudowa po zmianie menu: `node src/build.js`

## Do uzupełnienia przed startem
Zdjęcia (stek z polędwicy, szef kuchni, sala), linki do PDF menu, mapa Google, polityka prywatności i cookies, angielska wersja strony głównej i przyjęć.
