<script lang="ts">
  import { fly } from 'svelte/transition';
  import TheoryView from './TheoryView.svelte';

  interface Props {
    open: boolean;
    /** Week key like "C" or "E–F": the panel opens at that week's section. */
    week?: string;
    onClose: () => void;
  }

  let { open, week, onClose }: Props = $props();

  let body: HTMLElement | undefined = $state();

  $effect(() => {
    if (!open || !body || !week) return;
    body.querySelector(`[data-week="${week}"]`)?.scrollIntoView({ block: 'start' });
  });

  $effect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

{#if open}
  <!-- Slides over the page without covering it entirely, so the exercise stays usable next to it. -->
  <aside class="theory-drawer" aria-label="Theorie" transition:fly={{ x: 480, duration: 220 }}>
    <header class="theory-drawer-head">
      <h2>Theorie</h2>
      <button class="ghost-btn" type="button" onclick={onClose}>Sluiten ✕</button>
    </header>
    <div class="theory-drawer-body" bind:this={body}>
      <TheoryView />
    </div>
  </aside>
{/if}
