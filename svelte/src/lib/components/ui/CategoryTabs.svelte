<script lang="ts">
  import type { CategoryId, CategoryMeta } from '../../types';
  import { statsStore } from '../../stores/stats.svelte';

  interface Props {
    categories: CategoryMeta[];
    activeId: CategoryId;
    onSelect: (id: CategoryId) => void;
  }

  let { categories, activeId, onSelect }: Props = $props();

  /** A best streak this long marks a category as mastered. */
  const MASTERY_STREAK = 5;

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
          {@const byStreak = stats.best >= MASTERY_STREAK}
          {@const mastered = byStreak || !!stats.markedMastered}
          <button
            class="tab-btn"
            class:active={cat.id === activeId}
            class:mastered
            type="button"
            title={byStreak ? `Beheerst: ${stats.best} keer achter elkaar goed` : mastered ? 'Beheerst (zelf aangevinkt)' : undefined}
            onclick={() => onSelect(cat.id)}
          >
            {#if mastered}<span class="tab-check" aria-label="beheerst">✓</span>{:else}<span class="tab-dot {cat.accent}"></span>{/if}{cat.label}{#if stats.attempts > 0}<span class="tab-badge"
                >{stats.correct}/{stats.attempts}</span
              >{/if}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</nav>
