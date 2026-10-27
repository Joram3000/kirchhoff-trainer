# Kirchhoff Trainer — Svelte

Svelte 5 + TypeScript + Vite version of the [static Kirchhoff Trainer](../index.html), rebuilt with separation of concerns: pure exercise logic, presentational SVG circuit components, and a thin UI layer, instead of one file mixing string-built SVG with DOM manipulation. It has since grown past the static version: it covers all of NET1 (weeks A–G) and has an exam corner.

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
    types.ts                 Shared domain types (Problem, CircuitSpec, GridSpec, Exam, …)
    categories.ts             Static category metadata (id, label, accent, week group)
    utils/                    Pure helpers: random numbers, number formatting, answer parsing, linear solver
    svg/paths.ts               Geometry helper for the resistor zigzag path
    svg/ladder.ts              Layout for the node-voltage ladder circuits
    svg/grid.ts                Layout for free-form "grid" circuits: places elements, labels and
                                arrows, and fits the viewBox around everything
    generators/                One pure function per exercise type; no DOM, fully unit-testable.
                                Each returns a Problem: question text, answer, tolerance, worked
                                steps, and a CircuitSpec describing what to draw.
      built.ts                  For the newer generators: one circuit with all its questions
                                (`Built`), turned into a practice Problem or a multi-part exam question.
    exams/                     The exam corner: the course's oefentoets, the week G exam questions,
                                Hambley problems from weeks E/F (fixed), and a generated proeftoets.
    stores/stats.svelte.ts     Svelte 5 runes store: per-category attempt/streak stats,
                                persisted to localStorage.
    stores/exams.svelte.ts     Best/last score per exam, persisted to localStorage.
    components/
      circuits/                 One Svelte component per circuit topology, driven entirely by
                                 props (no string-built SVG). CircuitDiagram.svelte dispatches
                                 on CircuitSpec.kind to the right one; GridCircuit.svelte draws
                                 any `grid` spec (exam figures, Thévenin terminals, switches).
        primitives/              Small reusable SVG building blocks (resistor, sources, ground,
                                 node dot, direction arrow).
      ui/                        Presentational app chrome: tabs, question card, answer form,
                                 feedback banner, steps panel, theory view.
      exam/                      Exam overview, and one card per exam question with its parts.
  App.svelte                    Composition root: owns view, current problem/category/answer state,
                                 wires generators + stats store to the UI components.
```

The generator/circuit split means the physics (what the answer is, what the steps say) never
touches rendering code, and each circuit's geometry lives in one place instead of being
reconstructed from an HTML string.

Grid elements carry their numeric `value`, so a figure can be solved independently of the
generator's formulas — handy for checking that what is drawn matches the answer.
