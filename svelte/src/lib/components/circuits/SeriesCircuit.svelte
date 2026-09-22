<script lang="ts">
  import { fmt } from '../../utils/format';
  import { isTarget, type ResistorTarget } from '../../utils/target';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';

  interface Props {
    Vs: number;
    Rs: number[];
    target: ResistorTarget;
  }

  let { Vs, Rs, target }: Props = $props();

  const top = 60;
  const bottom = 230;
  const left = 90;
  const right = 310;
  const rh = 18;
  const bg = 11;
  const midY = 145;
  const RW_BY_COUNT: Record<number, number> = { 2: 70, 3: 52, 4: 38 };

  let rw = $derived(RW_BY_COUNT[Rs.length] ?? 40);
  let resistors = $derived(
    Rs.map((R, i) => ({
      R,
      label: i + 1,
      name: `R${i + 1}`,
      cx: left + ((right - left) * (i + 1)) / (Rs.length + 1),
      on: isTarget(`R${i + 1}`, target),
      labelY: i % 2 === 0 ? top - 18 : top - 34,
    })),
  );
</script>

{#each resistors as r, i (r.name)}
  <line class="wire" x1={i === 0 ? left : resistors[i - 1].cx + rw / 2} y1={top} x2={r.cx - rw / 2} y2={top} />
  <ResistorSymbol cx={r.cx} cy={top} length={rw} thickness={rh} orientation="horizontal" accent={r.on} />
  <text class="lbl" class:lbl-target={r.on} x={r.cx} y={r.labelY} text-anchor="middle"
    >R<tspan baseline-shift="sub" font-size="9">{r.label}</tspan> = {fmt(r.R)} Ω</text
  >
{/each}
<line class="wire" x1={resistors[resistors.length - 1].cx + rw / 2} y1={top} x2={right} y2={top} />

<line class="wire" x1={right} y1={top} x2={right} y2={bottom} />

<line class="wire" x1={right} y1={bottom} x2={left} y2={bottom} />
<DirectionArrow x={(left + right) / 2} y={bottom} angle={180} />
<text class="lbl" x={(left + right) / 2} y={bottom - 14} text-anchor="middle">I</text>

<line class="wire" x1={left} y1={bottom} x2={left} y2={midY + bg} />
<line class="wire" x1={left} y1={midY - bg} x2={left} y2={top} />
<BatterySymbol cx={left} cy={midY} plusAt="top" />
<text class="lbl" x={left - 18} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

{#each [[left, top], [right, top], [right, bottom], [left, bottom]] as [x, y] (`${x},${y}`)}
  <NodeDot {x} {y} />
{/each}
