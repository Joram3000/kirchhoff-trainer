<script lang="ts">
  import { fmt } from '../../utils/format';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Vs: number;
    R: number;
    Is: number;
  }

  let { Vs, R, Is }: Props = $props();

  const top = 60;
  const bottom = 220;
  const xVs = 90;
  const xR = 195;
  const xIs = 290;
  const rw = 80;
  const rh = 18;
  const bg = 11;
  const midY = 140;
</script>

<line class="wire" x1={xVs} y1={top} x2={xIs} y2={top} />
<line class="wire" x1={xVs} y1={bottom} x2={xIs} y2={bottom} />
{#each [xVs, xR, xIs] as x (x)}
  <NodeDot {x} y={top} />
  <NodeDot {x} y={bottom} />
{/each}

<line class="wire" x1={xVs} y1={top} x2={xVs} y2={midY - bg} />
<line class="wire" x1={xVs} y1={midY + bg} x2={xVs} y2={bottom} />
<BatterySymbol cx={xVs} cy={midY} plusAt="top" />
<text class="lbl" x={xVs - 20} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

<line class="wire" x1={xR} y1={top} x2={xR} y2={midY - rw / 2} />
<line class="wire" x1={xR} y1={midY + rw / 2} x2={xR} y2={bottom} />
<ResistorSymbol cx={xR} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xR + 16} y={midY} text-anchor="start" dy=".35em">R = {fmt(R)} Ω</text>

<line class="wire" x1={xIs} y1={top} x2={xIs} y2={midY - 24} />
<line class="wire" x1={xIs} y1={midY + 24} x2={xIs} y2={bottom} />
<CurrentSourceSymbol cx={xIs} cy={midY} r={20} arrowUp={true} />
<text class="lbl" x={xIs + 28} y={midY} text-anchor="start" dy=".35em">I<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Is)} A</text>

<text class="lbl-unknown" x={(xVs + xIs) / 2} y={top - 14} text-anchor="middle">v = V<tspan baseline-shift="sub" font-size="9">s</tspan></text>

<GroundSymbol cx={195} railY={bottom} />
