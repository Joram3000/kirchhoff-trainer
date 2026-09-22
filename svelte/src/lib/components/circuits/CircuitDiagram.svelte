<script lang="ts">
  import type { CircuitSpec } from '../../types';
  import ArrowMarkerDefs from './primitives/ArrowMarkerDefs.svelte';
  import KclNodeCircuit from './KclNodeCircuit.svelte';
  import KvlLoopCircuit from './KvlLoopCircuit.svelte';
  import SeriesCircuit from './SeriesCircuit.svelte';
  import ParallelCircuit from './ParallelCircuit.svelte';
  import MixedCircuit from './MixedCircuit.svelte';
  import NodeVoltageCircuit from './NodeVoltageCircuit.svelte';
  import SeriesViCircuit from './SeriesViCircuit.svelte';
  import ParallelViCircuit from './ParallelViCircuit.svelte';

  interface Props {
    circuit: CircuitSpec;
  }

  let { circuit }: Props = $props();
</script>

<svg viewBox="0 0 380 300" role="img" aria-label="Schakelschema">
  <ArrowMarkerDefs />
  <g>
    {#if circuit.kind === 'kcl-node'}
      <KclNodeCircuit branches={circuit.branches} />
    {:else if circuit.kind === 'kvl-loop'}
      <KvlLoopCircuit sides={circuit.sides} />
    {:else if circuit.kind === 'series'}
      <SeriesCircuit Vs={circuit.Vs} Rs={circuit.Rs} target={circuit.target} />
    {:else if circuit.kind === 'parallel'}
      <ParallelCircuit Is={circuit.Is} Rs={circuit.Rs} target={circuit.target} />
    {:else if circuit.kind === 'mixed'}
      <MixedCircuit Vs={circuit.Vs} R1={circuit.R1} Rs={circuit.Rs} target={circuit.target} />
    {:else if circuit.kind === 'node-voltage'}
      <NodeVoltageCircuit Is={circuit.Is} R1={circuit.R1} R2={circuit.R2} V2={circuit.V2} />
    {:else if circuit.kind === 'series-vi'}
      <SeriesViCircuit Vs={circuit.Vs} R={circuit.R} Is={circuit.Is} target={circuit.target} />
    {:else if circuit.kind === 'parallel-vi'}
      <ParallelViCircuit Vs={circuit.Vs} R={circuit.R} Is={circuit.Is} target={circuit.target} />
    {/if}
  </g>
</svg>
