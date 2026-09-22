<script lang="ts">
  import type { CategoryId, CategoryMeta } from '../../types';
  import { statsStore } from '../../stores/stats.svelte';

  interface Props {
    categories: CategoryMeta[];
    activeId: CategoryId;
    onSelect: (id: CategoryId) => void;
  }

  let { categories, activeId, onSelect }: Props = $props();
</script>

<nav class="tabs" aria-label="Oefencategorieën">
  {#each categories as cat (cat.id)}
    {@const stats = statsStore.for(cat.id)}
    <button class="tab-btn" class:active={cat.id === activeId} type="button" onclick={() => onSelect(cat.id)}>
      <span class="tab-dot {cat.accent}"></span>{cat.label}{#if stats.attempts > 0}<span class="tab-badge">{stats.correct}/{stats.attempts}</span>{/if}
    </button>
  {/each}
</nav>
