<script lang="ts">
  import type { View } from '../../types';

  interface Props {
    view: View;
    onNavigate: (view: View) => void;
    onResetStats: () => void;
  }

  let { view, onNavigate, onResetStats }: Props = $props();

  const NAV: { id: View; label: string }[] = [
    { id: 'practice', label: 'Oefenen' },
    { id: 'theory', label: 'Theorie' },
    { id: 'exam', label: 'Tentamenhoek' },
  ];
</script>

<header class="app-header">
  <div class="brand">
    <svg class="brand-mark" viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
      <circle cx="9" cy="24" r="4" fill="var(--brand)" />
      <path
        d="M13 24 H18 L21 15 L27 33 L30 24 H39"
        fill="none"
        stroke="var(--brand)"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="39" cy="24" r="4" fill="var(--brand)" />
    </svg>
    <div>
      <h1>Kirchhoff Trainer</h1>
      <p class="subtitle">Elektrische Netwerken 1 — van KCL tot Thévenin en superpositie</p>
    </div>
  </div>
  <div class="header-actions">
    <nav class="view-switch" aria-label="Onderdeel">
      {#each NAV as item (item.id)}
        <button class="view-btn" class:active={view === item.id} type="button" onclick={() => onNavigate(item.id)}>
          {item.label}
        </button>
      {/each}
    </nav>
    <button class="ghost-btn subtle" type="button" onclick={onResetStats}>Voortgang wissen</button>
  </div>
</header>
