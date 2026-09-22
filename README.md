# Kirchhoff Trainer

Interactieve oefenapp voor KCL (stroomwet) en KVL (spanningswet) van Kirchhoff, gebaseerd op de basisstof uit hoofdstuk 1 en 2 van Electric Circuits (Dorf & Svoboda) — grootheden, de wetten van Kirchhoff, de wet van Ohm, serie-/parallelschakelingen en de knooppuntspanningsmethode.

## Gebruiken

Open `index.html` direct in een browser (geen server of build-stap nodig). Alles draait client-side in puur HTML/CSS/JS.

## Wat erin zit

Zes oefencategorieën met willekeurig gegenereerde schema's en cijfers, elk met directe feedback en een stapsgewijze uitwerking:

- KCL bij een knooppunt
- KVL in een lus
- Serieschakeling
- Parallelschakeling
- Gemengde schakeling
- Knooppuntspanning (knooppuntspanningsmethode)

Plus een beknopt theorie-overzicht (tab "Theorie") en voortgang per categorie (bijgehouden in de browser, via localStorage).

## Svelte-versie

[`svelte/`](svelte/) bevat een functioneel identieke Svelte 5 + TypeScript + Vite-versie van deze app, opgesplitst in losse modules (generators, circuit-componenten, stores) in plaats van één bestand. Zie [svelte/README.md](svelte/README.md) voor de architectuur en het opstarten.
