<script lang="ts">
  import type { Problem } from '../../types';
  import CircuitDiagram from '../circuits/CircuitDiagram.svelte';

  interface Props {
    problem: Problem;
  }

  let { problem }: Props = $props();
</script>

<div class="circuit-card card accent-{problem.accent}">
  <div class="circuit-caption">{problem.title}</div>
  <CircuitDiagram circuit={problem.circuit} />
</div>
