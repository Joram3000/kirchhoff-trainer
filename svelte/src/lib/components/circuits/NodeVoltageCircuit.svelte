<script lang="ts">
  import { fmt } from '../../utils/format';
  import ResistorSymbol from './primitives/ResistorSymbol.svelte';
  import BatterySymbol from './primitives/BatterySymbol.svelte';
  import CurrentSourceSymbol from './primitives/CurrentSourceSymbol.svelte';
  import GroundSymbol from './primitives/GroundSymbol.svelte';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    Is: number;
    R1: number;
    R2: number;
    V2: number;
  }

  let { Is, R1, R2, V2 }: Props = $props();

  const top = 70;
  const bottom = 230;
  const xIs = 110;
  const xR1 = 210;
  const xN2 = 290;
  const rw = 70;
  const rh = 18;
  const bg = 11;
  const midY = 150;
  const xR2 = 250;
</script>

<line class="wire" x1={xIs} y1={top} x2={xR1} y2={top} />
<line class="wire" x1={xR1} y1={top} x2={xR2 - rw / 2} y2={top} />
<ResistorSymbol cx={xR2} cy={top} length={rw} thickness={rh} orientation="horizontal" />
<line class="wire" x1={xR2 + rw / 2} y1={top} x2={xN2} y2={top} />
<text class="lbl" x={xR2} y={top - 18} text-anchor="middle">R<tspan baseline-shift="sub" font-size="9">2</tspan> = {fmt(R2)} Ω</text>
<text class="lbl-unknown" x="150" y={top - 18} text-anchor="middle">v<tspan baseline-shift="sub" font-size="9">1</tspan> = ?</text>

<line class="wire" x1={xIs} y1={top} x2={xIs} y2={midY - 24} />
<line class="wire" x1={xIs} y1={midY + 24} x2={xIs} y2={bottom} />
<CurrentSourceSymbol cx={xIs} cy={midY} r={20} arrowUp={true} />
<text class="lbl" x={xIs - 20} y={midY} text-anchor="end" dy=".35em">I<tspan baseline-shift="sub" font-size="9">s</tspan> = {fmt(Is)} A</text>

<line class="wire" x1={xR1} y1={top} x2={xR1} y2={midY - rw / 2} />
<line class="wire" x1={xR1} y1={midY + rw / 2} x2={xR1} y2={bottom} />
<ResistorSymbol cx={xR1} cy={midY} length={rw} thickness={rh} orientation="vertical" />
<text class="lbl" x={xR1 + 16} y={midY} text-anchor="start" dy=".35em">R<tspan baseline-shift="sub" font-size="9">1</tspan> = {fmt(R1)} Ω</text>

<line class="wire" x1={xN2} y1={top} x2={xN2} y2={midY - bg} />
<line class="wire" x1={xN2} y1={midY + bg} x2={xN2} y2={bottom} />
<BatterySymbol cx={xN2} cy={midY} plusAt="top" />
<text class="lbl" x={xN2 + 16} y={midY} text-anchor="start" dy=".35em">V<tspan baseline-shift="sub" font-size="9">2</tspan> = {fmt(V2)} V</text>

<line class="wire" x1={xIs} y1={bottom} x2={xN2} y2={bottom} />
<GroundSymbol cx={200} railY={bottom} />

<NodeDot x={xIs} y={top} accent />
<NodeDot x={xR1} y={top} accent />
<NodeDot x={xN2} y={top} />
<NodeDot x={xIs} y={bottom} />
<NodeDot x={xR1} y={bottom} />
<NodeDot x={xN2} y={bottom} />
