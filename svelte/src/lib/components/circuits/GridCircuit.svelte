<script lang="ts">
  import type { GridSpec } from '../../types';
  import { layoutGrid, richParts, R_THICK, SRC_R, BOX_LEN, BOX_THICK, type PlacedElement, type PlacedText } from '../../svg/grid';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import VoltageSourceSymbol from './primitives/VoltageSourceSymbol.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    layout: ReturnType<typeof layoutGrid>;
  }

  let { layout }: Props = $props();

  /** Pixel position of an element's `from` or `to` terminal. */
  function terminal(p: PlacedElement, which: 'from' | 'to'): [number, number] {
    return which === 'from' ? [p.leads[0][0], p.leads[0][1]] : [p.leads[1][2], p.leads[1][3]];
  }

  function plusSide(p: PlacedElement, which: 'from' | 'to') {
    const [x, y] = terminal(p, which);
    return p.horizontal ? (x < p.cx ? 'left' : 'right') : y < p.cy ? 'top' : 'bottom';
  }

  function arrowDir(p: PlacedElement, which: 'from' | 'to') {
    const [x, y] = terminal(p, which);
    return p.horizontal ? (x > p.cx ? 'right' : 'left') : y < p.cy ? 'up' : 'down';
  }

  /** Endpoint of an open switch's lever: tilted 30° off the wire, away from the drawing's inside. */
  function lever(p: PlacedElement): [number, number] {
    const [x1, y1] = p.leads[0].slice(2) as [number, number];
    const [x2, y2] = p.leads[1].slice(0, 2) as [number, number];
    if (p.el.kind === 'switch' && p.el.closed) return [x2, y2];
    const len = Math.hypot(x2 - x1, y2 - y1) * 0.95;
    const a = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 6;
    return [x1 + Math.cos(a) * len, y1 + Math.sin(a) * len];
  }
</script>

{#snippet rich(t: PlacedText)}
  <text class={t.cls} x={t.x} y={t.y} dy="{t.dy}em" text-anchor={t.anchor}
    >{#each richParts(t.text) as part, i (i)}{#if part.sub}<tspan baseline-shift="sub" font-size="9">{part.text}</tspan
        >{:else}{part.text}{/if}{/each}</text
  >
{/snippet}

{#each layout.wires as d, i (i)}
  <path class="wire" {d} />
{/each}

{#each layout.elements as p, i (i)}
  {#each p.leads as [ax, ay, bx, by], j (j)}
    <line class="wire" x1={ax} y1={ay} x2={bx} y2={by} />
  {/each}
  {#if p.el.kind === 'R'}
    <ResistorSymbol
      cx={p.cx}
      cy={p.cy}
      length={p.half * 2}
      thickness={R_THICK}
      orientation={p.horizontal ? 'horizontal' : 'vertical'}
      accent={p.accent}
    />
  {:else if p.el.kind === 'V'}
    <VoltageSourceSymbol cx={p.cx} cy={p.cy} r={SRC_R} plus={plusSide(p, p.el.plus)} />
  {:else if p.el.kind === 'I'}
    <CurrentSourceSymbol cx={p.cx} cy={p.cy} r={SRC_R} dir={arrowDir(p, p.el.toward)} accent={p.accent} />
  {:else if p.el.kind === 'box'}
    {@const w = p.horizontal ? BOX_LEN : BOX_THICK}
    {@const h = p.horizontal ? BOX_THICK : BOX_LEN}
    <rect class="comp box" class:comp-accent={p.accent} x={p.cx - w / 2} y={p.cy - h / 2} width={w} height={h} rx="3" />
    <text class="lbl box-name" x={p.cx} y={p.cy} dy=".35em" text-anchor="middle">{p.el.name}</text>
  {:else if p.el.kind === 'switch'}
    {@const [px, py] = p.leads[0].slice(2)}
    {@const [qx, qy] = p.leads[1].slice(0, 2)}
    {@const [lx, ly] = lever(p)}
    <line class="comp" x1={px} y1={py} x2={lx} y2={ly} />
    <circle class="node-dot" cx={px} cy={py} r="3.5" />
    <circle class="switch-contact" cx={qx} cy={qy} r="3.5" />
  {/if}
  {#if p.arrow}
    <DirectionArrow x={p.arrow.x} y={p.arrow.y} angle={p.arrow.angle} accent={p.arrow.accent} length={9} />
  {/if}
  {#each p.texts as t, j (j)}
    {@render rich(t)}
  {/each}
{/each}

{#if layout.ground}
  <GroundSymbol cx={layout.ground[0]} railY={layout.ground[1]} />
{/if}

{#each layout.dots as [x, y], i (i)}
  <NodeDot {x} {y} />
{/each}

{#each layout.terminals as [x, y], i (i)}
  <circle class="terminal" cx={x} cy={y} r="4.5" />
{/each}

{#each layout.arrows as a, i (i)}
  <DirectionArrow x={a.x} y={a.y} angle={a.angle} accent={a.accent} length={9} />
{/each}

{#each layout.texts as t, i (i)}
  {@render rich(t)}
{/each}
