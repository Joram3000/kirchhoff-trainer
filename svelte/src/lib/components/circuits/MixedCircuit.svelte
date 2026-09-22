<script lang="ts">
  import { fmt } from '../../utils/format';
  import { isTarget, type ResistorTarget } from '../../utils/target';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Vs: number;
    R1: number;
    Rs: number[];
    target: ResistorTarget;
  }

  let { Vs, R1, Rs, target }: Props = $props();

  const top = 60;
  const bottom = 240;
  const xVs = 90;
  const r1cx = 150;
  const rw1 = 70;
  const branchStart = 200;
  const branchEnd = 335;
  const rh = 18;
  const bg = 11;
  const midY = 150;
  const RW_BY_COUNT: Record<number, number> = { 2: 70, 3: 56, 4: 44 };

  let r1On = $derived(isTarget('R1', target));
  let rw = $derived(RW_BY_COUNT[Rs.length] ?? 40);
  let branches = $derived(
    Rs.map((R, i) => ({
      R,
      label: i + 2,
      name: `R${i + 2}`,
      x: Rs.length === 1 ? branchStart : branchStart + ((branchEnd - branchStart) * i) / (Rs.length - 1),
      on: isTarget(`R${i + 2}`, target),
      labelY: i % 2 === 0 ? midY - rw / 2 - 12 : midY + rw / 2 + 20,
    })),
  );
</script>

<line class="wire" x1={xVs} y1={top} x2={r1cx - rw1 / 2} y2={top} />
<ResistorSymbol cx={r1cx} cy={top} length={rw1} thickness={rh} orientation="horizontal" accent={r1On} />
<text class="lbl" class:lbl-target={r1On} x={r1cx} y={top - 18} text-anchor="middle">R<tspan baseline-shift="sub" font-size="9">1</tspan> = {fmt(R1)} Ω</text>
<line class="wire" x1={r1cx + rw1 / 2} y1={top} x2={branchEnd} y2={top} />

{#each branches as b (b.name)}
  <line class="wire" x1={b.x} y1={top} x2={b.x} y2={midY - rw / 2} />
  <line class="wire" x1={b.x} y1={midY + rw / 2} x2={b.x} y2={bottom} />
  <ResistorSymbol cx={b.x} cy={midY} length={rw} thickness={rh} orientation="vertical" accent={b.on} />
  <text class="lbl" class:lbl-target={b.on} x={b.x} y={b.labelY} text-anchor="middle"
    >R<tspan baseline-shift="sub" font-size="9">{b.label}</tspan> = {fmt(b.R)} Ω</text
  >
{/each}

<line class="wire" x1={branchEnd} y1={bottom} x2={xVs} y2={bottom} />
<line class="wire" x1={xVs} y1={bottom} x2={xVs} y2={midY + bg} />
<line class="wire" x1={xVs} y1={midY - bg} x2={xVs} y2={top} />
<BatterySymbol cx={xVs} cy={midY} plusAt="top" />
<text class="lbl" x={xVs - 18} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

{#each [[xVs, top], [xVs, bottom]] as [x, y] (`${x},${y}`)}
  <NodeDot {x} {y} />
{/each}
{#each branches as b (b.name)}
  <NodeDot x={b.x} y={top} />
  <NodeDot x={b.x} y={bottom} />
{/each}
