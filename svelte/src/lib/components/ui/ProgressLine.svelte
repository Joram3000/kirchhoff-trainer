<script lang="ts">
  import type { CategoryId } from '../../types';
  import { statsStore } from '../../stores/stats.svelte';

  interface Props {
    categoryId: CategoryId;
  }

  let { categoryId }: Props = $props();
  let stats = $derived(statsStore.for(categoryId));
</script>

<div class="progress-line">
  {#if stats.attempts === 0}
    Nog geen pogingen in deze categorie.
  {:else}
    {stats.correct} goed van de {stats.attempts} pogingen in deze categorie · beste reeks: {stats.best}
  {/if}
</div>
