<script lang="ts">
  import { fmt } from '../../utils/format';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';

  interface Props {
    Vs: number;
    R1: number;
    R2: number;
  }

  let { Vs, R1, R2 }: Props = $props();

  const top = 60;
  const bottom = 230;
  const left = 90;
  const right = 290;
  const rw = 80;
  const rh = 18;
  const bg = 11;
  const midY = 145;
</script>

<line class="wire" x1={left} y1={top} x2={190 - rw / 2} y2={top} />
<line class="wire" x1={190 + rw / 2} y1={top} x2={right} y2={top} />
<ResistorSymbol cx={190} cy={top} length={rw} thickness={rh} orientation="horizontal" />
<text class="lbl" x="190" y={top - 18} text-anchor="middle">R<tspan baseline-shift="sub" font-size="9">1</tspan> = {fmt(R1)} Ω</text>

<line class="wire" x1={right} y1={top} x2={right} y2={midY - rw / 2} />
<line class="wire" x1={right} y1={midY + rw / 2} x2={right} y2={bottom} />
<ResistorSymbol cx={right} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={right + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">2</tspan> = {fmt(R2)} Ω</text>

<line class="wire" x1={right} y1={bottom} x2={left} y2={bottom} />
<DirectionArrow x={190} y={bottom} angle={180} />
<text class="lbl" x="190" y={bottom - 14} text-anchor="middle">I</text>

<line class="wire" x1={left} y1={bottom} x2={left} y2={midY + bg} />
<line class="wire" x1={left} y1={midY - bg} x2={left} y2={top} />
<BatterySymbol cx={left} cy={midY} plusAt="top" />
<text class="lbl" x={left - 18} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

{#each [[left, top], [right, top], [right, bottom], [left, bottom]] as [x, y] (`${x},${y}`)}
  <NodeDot {x} {y} />
{/each}
