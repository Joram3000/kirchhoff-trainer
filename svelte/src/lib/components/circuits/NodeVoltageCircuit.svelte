<script lang="ts">
  import type { NodeVoltageSpec, NvLink } from '../../types';
  import { layoutLadder, elementLabel, labelOffset, TOP, BOTTOM, MID, BRIDGE_Y } from '../../svg/ladder';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import DependentSourceSymbol from './primitives/DependentSourceSymbol.svelte';
  import VoltageSourceSymbol from './primitives/VoltageSourceSymbol.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    spec: NodeVoltageSpec;
  }

  let { spec }: Props = $props();

  const rw = 70;
  const rh = 18;
  const bg = 11;
  const srcR = 20;
  const linkSrcR = 16;

  let layout = $derived(layoutLadder(spec));
  let cols = $derived(spec.shunts.map((s, i) => ({ ...s, ...layout.shunts[i] })));
  let lastNode = $derived(spec.nodes.length - 1);
  let railLeft = $derived(layout.shunts[0].x);
  let railRight = $derived(layout.shunts[layout.shunts.length - 1].x);

  /** A link element placed on a horizontal wire from x1 to x2 at height y. */
  interface PlacedLink {
    link: NvLink;
    x1: number;
    x2: number;
    y: number;
    cx: number;
    /** Half the element's extent along the wire. */
    half: number;
    accent: boolean;
  }

  function place(link: NvLink, x1: number, x2: number, y: number, accent: boolean, maxLen = 56): PlacedLink {
    const cx = (x1 + x2) / 2;
    const half = link.el.type === 'R' ? Math.min(maxLen, x2 - x1 - 44) / 2 : linkSrcR;
    return { link, x1, x2, y, cx, half, accent };
  }

  let links = $derived(
    spec.links.map((link, i) =>
      place(
        link,
        layout.spans[i].last,
        layout.spans[i + 1].first,
        TOP,
        spec.target !== null && 'link' in spec.target && spec.target.link === i,
      ),
    ),
  );
  let bridge = $derived(
    spec.bridge ? place(spec.bridge, railLeft, railRight, BRIDGE_Y, false, 60) : null,
  );

  let nodeLabels = $derived(
    spec.nodes.map((node, n) => {
      const x = n === 0 ? layout.spans[0].last : layout.spans[n].first;
      const riser =
        !!spec.bridge && ((n === 0 && x === railLeft) || (n === lastNode && x === railRight));
      const target = spec.target !== null && 'node' in spec.target && spec.target.node === n;
      return { node, n, x, riser, target };
    }),
  );
</script>

{#snippet linkElement(p: PlacedLink)}
  <line class="wire" x1={p.x1} y1={p.y} x2={p.cx - p.half} y2={p.y} />
  <line class="wire" x1={p.cx + p.half} y1={p.y} x2={p.x2} y2={p.y} />
  {#if p.link.el.type === 'R'}
    <ResistorSymbol cx={p.cx} cy={p.y} length={p.half * 2} thickness={rh} orientation="horizontal" accent={p.accent} />
  {:else if p.link.el.type === 'V'}
    <VoltageSourceSymbol cx={p.cx} cy={p.y} r={linkSrcR} plus={p.link.el.plus === 'right' ? 'right' : 'left'} />
  {:else if p.link.el.type === 'I'}
    <CurrentSourceSymbol cx={p.cx} cy={p.y} r={linkSrcR} dir={p.link.el.dir} />
  {/if}
  <text class="lbl" x={p.cx} y={p.y - (p.link.el.type === 'R' ? 16 : 24)} text-anchor="middle">{elementLabel(p.link.el)}</text>
  {#if p.link.current}
    {@const ay = p.y + (p.link.el.type === 'R' ? 18 : 30)}
    <DirectionArrow x={p.cx} y={ay} angle={p.link.current.dir === 'right' ? 0 : 180} accent={p.accent} />
    <text class={p.accent ? 'lbl-target' : 'lbl'} x={p.cx} y={ay + 18} text-anchor="middle"
      >i<tspan baseline-shift="sub" font-size="9">{p.link.current.name}</tspan></text
    >
  {/if}
{/snippet}

<!-- Top rail within each node, and the ground rail. -->
{#each layout.spans as s, n (n)}
  <line class="wire" x1={s.first} y1={TOP} x2={s.last} y2={TOP} />
{/each}
<line class="wire" x1={railLeft} y1={BOTTOM} x2={railRight} y2={BOTTOM} />
<GroundSymbol cx={(railLeft + railRight) / 2} railY={BOTTOM} />

{#each links as p, i (i)}
  {@render linkElement(p)}
{/each}

{#if bridge}
  <line class="wire" x1={railLeft} y1={TOP} x2={railLeft} y2={BRIDGE_Y} />
  <line class="wire" x1={railRight} y1={TOP} x2={railRight} y2={BRIDGE_Y} />
  {@render linkElement(bridge)}
{/if}

{#each cols as c, i (i)}
  {@const el = c.el}
  {@const half = el.type === 'R' ? rw / 2 : el.type === 'V' ? bg : srcR}
  {@const off = labelOffset(el, c.side)}
  <line class="wire" x1={c.x} y1={TOP} x2={c.x} y2={MID - half} />
  <line class="wire" x1={c.x} y1={MID + half} x2={c.x} y2={BOTTOM} />
  {#if el.type === 'R'}
    <ResistorSymbol cx={c.x} cy={MID} length={rw} thickness={rh} orientation="vertical" />
  {:else if el.type === 'I'}
    <CurrentSourceSymbol cx={c.x} cy={MID} r={srcR} dir={el.dir} />
  {:else if el.type === 'V'}
    <BatterySymbol cx={c.x} cy={MID} plusAt={el.plus === 'bottom' ? 'bottom' : 'top'} />
  {:else}
    <DependentSourceSymbol cx={c.x} cy={MID} r={srcR} arrowUp={el.dir === 'up'} />
  {/if}
  <text
    class="lbl"
    x={c.side === 'left' ? c.x - off : c.x + off}
    y={MID}
    text-anchor={c.side === 'left' ? 'end' : 'start'}
    dy=".35em"
  >
    {#if el.type === 'CCCS'}
      {elementLabel({ ...el, ctrl: '' })}<tspan baseline-shift="sub" font-size="9">{el.ctrl}</tspan>
    {:else}
      {elementLabel(el)}
    {/if}
  </text>
  <NodeDot x={c.x} y={TOP} accent={nodeLabels[c.node].target} />
  <NodeDot x={c.x} y={BOTTOM} />
{/each}

{#each nodeLabels as l (l.n)}
  <text
    class={l.target ? 'lbl-unknown' : 'lbl'}
    x={l.riser ? l.x + 8 : l.x}
    y={l.riser ? TOP - 8 : TOP - 12}
    text-anchor={l.riser ? 'start' : 'middle'}
    >v<tspan baseline-shift="sub" font-size="9">{l.node.name}</tspan>{l.target ? ' = ?' : ''}</text
  >
{/each}
