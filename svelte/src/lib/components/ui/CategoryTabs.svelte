<script lang="ts">
  import type { CategoryId, CategoryMeta } from '../../types';
  import { statsStore } from '../../stores/stats.svelte';

  interface Props {
    categories: CategoryMeta[];
    activeId: CategoryId;
    onSelect: (id: CategoryId) => void;
  }

  let { categories, activeId, onSelect }: Props = $props();

  let groups = $derived(
    categories.reduce<[string, CategoryMeta[]][]>((acc, cat) => {
      const last = acc[acc.length - 1];
      if (last && last[0] === cat.group) last[1].push(cat);
      else acc.push([cat.group, [cat]]);
      return acc;
    }, []),
  );
</script>

<nav class="tabs" aria-label="Oefencategorieën">
  {#each groups as [group, cats] (group)}
    <div class="tab-group">
      <span class="tab-group-label">{group}</span>
      <div class="tab-group-items">
        {#each cats as cat (cat.id)}
          {@const stats = statsStore.for(cat.id)}
          <button class="tab-btn" class:active={cat.id === activeId} type="button" onclick={() => onSelect(cat.id)}>
            <span class="tab-dot {cat.accent}"></span>{cat.label}{#if stats.attempts > 0}<span class="tab-badge"
                >{stats.correct}/{stats.attempts}</span
              >{/if}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</nav>
