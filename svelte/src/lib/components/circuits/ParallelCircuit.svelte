<script lang="ts">
  import { fmt } from '../../utils/format';
  import { isTarget, type ResistorTarget } from '../../utils/target';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Is: number;
    Rs: number[];
    target: ResistorTarget;
  }

  let { Is, Rs, target }: Props = $props();

  const top = 60;
  const bottom = 220;
  const left = 80;
  const right = 320;
  const rh = 18;
  const midY = 140;
  const RW_BY_COUNT: Record<number, number> = { 2: 78, 3: 58, 4: 44 };

  let rw = $derived(RW_BY_COUNT[Rs.length] ?? 40);
  let xs = $derived.by(() => {
    const n = Rs.length + 1; // current source + resistor branches
    return Array.from({ length: n }, (_, i) => left + ((right - left) * i) / (n - 1));
  });
  let xIs = $derived(xs[0]);
  let branches = $derived(
    Rs.map((R, i) => ({
      R,
      label: i + 1,
      name: `R${i + 1}`,
      x: xs[i + 1],
      on: isTarget(`R${i + 1}`, target),
      labelY: i % 2 === 0 ? midY - rw / 2 - 12 : midY + rw / 2 + 20,
    })),
  );
  let groundX = $derived((left + right) / 2);
</script>

<line class="wire" x1={left} y1={top} x2={right} y2={top} />
<line class="wire" x1={left} y1={bottom} x2={right} y2={bottom} />
{#each xs as x (x)}
  <NodeDot {x} y={top} />
  <NodeDot {x} y={bottom} />
{/each}

<line class="wire" x1={xIs} y1={top} x2={xIs} y2={midY - 24} />
<line class="wire" x1={xIs} y1={midY + 24} x2={xIs} y2={bottom} />
<CurrentSourceSymbol cx={xIs} cy={midY} r={20} arrowUp={true} />
<text class="lbl" x={xIs - 20} y={midY} text-anchor="end" dy=".35em">I<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Is)} A</text>

{#each branches as b (b.name)}
  <line class="wire" x1={b.x} y1={top} x2={b.x} y2={midY - rw / 2} />
  <line class="wire" x1={b.x} y1={midY + rw / 2} x2={b.x} y2={bottom} />
  <ResistorSymbol cx={b.x} cy={midY} length={rw} thickness={rh} orientation="vertical" accent={b.on} />
  <text class="lbl" class:lbl-target={b.on} x={b.x} y={b.labelY} text-anchor="middle"
    >R<tspan baseline-shift="sub" font-size="9">{b.label}</tspan> = {fmt(b.R)} Ω</text
  >
{/each}

<GroundSymbol cx={groundX} railY={bottom} />
<text class="hint" x={(xIs + right) / 2} y={top - 14} text-anchor="middle">knooppunt v</text>
