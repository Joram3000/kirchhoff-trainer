<script lang="ts">
  import type { CategoryId } from '../../types';
  import { statsStore } from '../../stores/stats.svelte';
  import { difficultyLevel, SCALING_CATEGORIES } from '../../utils/difficulty';

  interface Props {
    categoryId: CategoryId;
  }

  let { categoryId }: Props = $props();
  let stats = $derived(statsStore.for(categoryId));
  let level = $derived(difficultyLevel(stats.streak));
  let scales = $derived(SCALING_CATEGORIES.includes(categoryId));
</script>

<div class="progress-line">
  <div>
    {#if stats.attempts === 0}
      Nog geen pogingen in deze categorie.
    {:else}
      {stats.correct} goed van de {stats.attempts} pogingen in deze categorie · beste reeks: {stats.best}
    {/if}
  </div>
  {#if scales && level > 0}
    <span class="level-badge">Niveau {level + 1} · grotere schakeling</span>
  {/if}
</div>
