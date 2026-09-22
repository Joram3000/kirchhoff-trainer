<script lang="ts">
  import { fmt } from '../../utils/format';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Vs: number;
    R1: number;
    R2: number;
    R3: number;
  }

  let { Vs, R1, R2, R3 }: Props = $props();

  const top = 60;
  const bottom = 240;
  const xVs = 90;
  const xB = 205;
  const xC = 300;
  const rw = 70;
  const rh = 18;
  const bg = 11;
  const midY = 150;
</script>

<line class="wire" x1={xVs} y1={top} x2={150 - rw / 2} y2={top} />
<line class="wire" x1={150 + rw / 2} y1={top} x2={xC} y2={top} />
<ResistorSymbol cx={150} cy={top} length={rw} thickness={rh} orientation="horizontal" />
<text class="lbl" x="150" y={top - 18} text-anchor="middle">R<tspan baseline-shift="sub" font-size="9">1</tspan> = {fmt(R1)} Ω</text>

<line class="wire" x1={xB} y1={top} x2={xB} y2={midY - rw / 2} />
<line class="wire" x1={xB} y1={midY + rw / 2} x2={xB} y2={bottom} />
<ResistorSymbol cx={xB} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xB + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">2</tspan> = {fmt(R2)} Ω</text>

<line class="wire" x1={xC} y1={top} x2={xC} y2={midY - rw / 2} />
<line class="wire" x1={xC} y1={midY + rw / 2} x2={xC} y2={bottom} />
<ResistorSymbol cx={xC} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xC + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">3</tspan> = {fmt(R3)} Ω</text>

<line class="wire" x1={xC} y1={bottom} x2={xVs} y2={bottom} />
<line class="wire" x1={xVs} y1={bottom} x2={xVs} y2={midY + bg} />
<line class="wire" x1={xVs} y1={midY - bg} x2={xVs} y2={top} />
<BatterySymbol cx={xVs} cy={midY} plusAt="top" />
<text class="lbl" x={xVs - 18} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

{#each [[xVs, top], [xB, top], [xC, top], [xVs, bottom], [xB, bottom], [xC, bottom]] as [x, y] (`${x},${y}`)}
  <NodeDot {x} {y} />
{/each}
