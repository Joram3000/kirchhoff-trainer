# Kirchhoff Trainer

Interactieve oefenapp voor Elektrische Netwerken 1: van de wetten van Kirchhoff tot Thévenin, superpositie en maximale vermogensoverdracht. Gebaseerd op de lesstof van NET1 (week A t/m G) en hoofdstuk 2 van *Electrical Engineering: Principles & Applications* (Hambley).

## Twee versies

- **[`svelte/`](svelte/)** — de hoofdversie (Svelte 5 + TypeScript + Vite). Hierin zit alle stof en de tentamenhoek. Zie [svelte/README.md](svelte/README.md) voor opstarten en architectuur.
- **`index.html`** — de oorspronkelijke statische versie (puur HTML/CSS/JS, direct te openen in een browser). Die bevat alleen de eerste zes categorieën (week A–D).

## Wat erin zit (Svelte-versie)

**Oefenen** — willekeurig gegenereerde schema's en waarden, met directe feedback en een stapsgewijze uitwerking. De categorieën zijn per week gegroepeerd:

- Week A–B · Kirchhoff: KCL bij een knooppunt, KVL in een lus, bronnen in serie/parallel (V + I), vermogen & tekenconventie
- Week C · Weerstandsnetwerken: serie, parallel, gemengd, vervangingsweerstand (ook terugrekenen naar een onbekende R)
- Week D · Knooppuntspanningsmethode
- Week E–F · Netwerktheorema's: Thévenin & Norton, maximaal vermogen, superpositie

Bij een reeks goede antwoorden worden de schakelingen groter en lastiger.

**Theorie** — beknopt overzicht per week, in lijn met het formuleblad.

**Speeltuin** — schakelingen uit de lesstof waarin je weerstanden en bronnen aanpast (of een bron uitzet) en live alle knooppuntspanningen, stromen, vermogens en de KCL- en KVL-vergelijkingen ziet.

**Kladblok** — tekst met ingebouwde rekenmachine (typ `=` achter een som; `//` is parallel), of tekenen over het schema van de opgave heen.

**Tentamenhoek** — oefenen zoals op het tentamen: alles invullen en pas aan het eind nakijken, met score, cijferindicatie en uitwerkingen per deelvraag:

- Proeftoets (willekeurig): elke keer een nieuwe toets van 100 punten met alle tentamenonderwerpen
- Oefentoets DC: de zes opgaven uit de oefentoets van het vak
- Tentamenvragen week G: de voorbeeldvragen uit les 7
- Boekopgaven week E en F: P2.80–P2.101 met uitwerkingen

Voortgang en beste scores worden in de browser bewaard (localStorage).
