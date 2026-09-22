<script lang="ts">
  import { fmt } from '../../utils/format';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Is: number;
    R1: number;
    R2: number;
  }

  let { Is, R1, R2 }: Props = $props();

  const top = 60;
  const bottom = 220;
  const xIs = 90;
  const xR1 = 195;
  const xR2 = 300;
  const rw = 80;
  const rh = 18;
  const midY = 140;
</script>

<line class="wire" x1={xIs} y1={top} x2={xR2} y2={top} />
<line class="wire" x1={xIs} y1={bottom} x2={xR2} y2={bottom} />
{#each [xIs, xR1, xR2] as x (x)}
  <NodeDot {x} y={top} />
  <NodeDot {x} y={bottom} />
{/each}

<line class="wire" x1={xIs} y1={top} x2={xIs} y2={midY - 24} />
<line class="wire" x1={xIs} y1={midY + 24} x2={xIs} y2={bottom} />
<CurrentSourceSymbol cx={xIs} cy={midY} r={20} arrowUp={true} />
<text class="lbl" x={xIs - 20} y={midY} text-anchor="end" dy=".35em">I<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Is)} A</text>

<line class="wire" x1={xR1} y1={top} x2={xR1} y2={midY - rw / 2} />
<line class="wire" x1={xR1} y1={midY + rw / 2} x2={xR1} y2={bottom} />
<ResistorSymbol cx={xR1} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xR1 + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">1</tspan> = {fmt(R1)} Ω</text>

<line class="wire" x1={xR2} y1={top} x2={xR2} y2={midY - rw / 2} />
<line class="wire" x1={xR2} y1={midY + rw / 2} x2={xR2} y2={bottom} />
<ResistorSymbol cx={xR2} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xR2 + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">2</tspan> = {fmt(R2)} Ω</text>

<GroundSymbol cx={195} railY={bottom} />
<text class="hint" x={(xIs + xR2) / 2} y={top - 14} text-anchor="middle">knooppunt v</text>
