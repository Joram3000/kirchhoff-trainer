# Kirchhoff Trainer — Svelte

Svelte 5 + TypeScript + Vite port of the [static Kirchhoff Trainer](../index.html), rebuilt with separation of concerns: pure exercise logic, presentational SVG circuit components, and a thin UI layer, instead of one file mixing string-built SVG with DOM manipulation.

## Gebruiken

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # production build to dist/
npm run check    # svelte-check + tsc
```

## Architecture

```
src/
  lib/
    types.ts                 Shared domain types (Problem, CircuitSpec, …)
    categories.ts             Static category metadata (id, label, accent)
    utils/                    Pure helpers: random numbers, number formatting, answer parsing
    svg/paths.ts               Geometry helper for the resistor zigzag path
    generators/                One pure function per exercise type; no DOM, fully unit-testable.
                                Each returns a Problem: question text, answer, tolerance, worked
                                steps, and a CircuitSpec describing what to draw.
    stores/stats.svelte.ts     Svelte 5 runes store: per-category attempt/streak stats,
                                persisted to localStorage.
    components/
      circuits/                 One Svelte component per circuit topology, driven entirely by
                                 props (no string-built SVG). CircuitDiagram.svelte dispatches
                                 on CircuitSpec.kind to the right one.
        primitives/              Small reusable SVG building blocks (resistor, battery, current
                                 source, ground symbol, node dot, direction arrow).
      ui/                        Presentational app chrome: tabs, question card, answer form,
                                 feedback banner, steps panel, theory view.
  App.svelte                    Composition root: owns current problem/category/answer state,
                                 wires generators + stats store to the UI components.
```

The generator/circuit split means the physics (what the answer is, what the steps say) never
touches rendering code, and each circuit's geometry lives in one place instead of being
reconstructed from an HTML string.
