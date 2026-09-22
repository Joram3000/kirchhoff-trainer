<script lang="ts">
  import { fmt } from '../../utils/format';
  import { isTarget, type ResistorTarget } from '../../utils/target';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';

  interface Props {
    Vs: number;
    R: number;
    Is: number;
    target: ResistorTarget;
  }

  let { Vs, R, Is, target }: Props = $props();
  let rOn = $derived(isTarget('R', target));

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
<ResistorSymbol cx={190} cy={top} length={rw} thickness={rh} orientation="horizontal" accent={rOn} />
<text class="lbl" class:lbl-target={rOn} x="190" y={top - 18} text-anchor="middle">R = {fmt(R)} Ω</text>

<line class="wire" x1={right} y1={top} x2={right} y2={midY - 24} />
<line class="wire" x1={right} y1={midY + 24} x2={right} y2={bottom} />
<CurrentSourceSymbol cx={right} cy={midY} r={20} arrowUp={false} />
<text class="lbl" x={right + 28} y={midY} text-anchor="start" dy=".35em">I<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Is)} A</text>

<line class="wire" x1={right} y1={bottom} x2={left} y2={bottom} />
<DirectionArrow x={190} y={bottom} angle={180} accent />
<text class="lbl-unknown" x="190" y={bottom - 16} text-anchor="middle">I = I<tspan baseline-shift="sub" font-size="9">s</tspan></text>

<line class="wire" x1={left} y1={bottom} x2={left} y2={midY + bg} />
<line class="wire" x1={left} y1={midY - bg} x2={left} y2={top} />
<BatterySymbol cx={left} cy={midY} plusAt="top" />
<text class="lbl" x={left - 18} y={midY} text-anchor="end" dy=".35em">V<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Vs)} V</text>

{#each [[left, top], [right, top], [right, bottom], [left, bottom]] as [x, y] (`${x},${y}`)}
  <NodeDot {x} {y} />
{/each}
