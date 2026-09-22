<script lang="ts">
  interface Props {
    showingTheory: boolean;
    onToggleTheory: () => void;
    onResetStats: () => void;
  }

  let { showingTheory, onToggleTheory, onResetStats }: Props = $props();
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
      <p class="subtitle">KCL &amp; KVL oefenen — stof uit hoofdstuk 1 &amp; 2</p>
    </div>
  </div>
  <div class="header-actions">
    <button class="ghost-btn" class:active={showingTheory} type="button" onclick={onToggleTheory}>
      Theorie
    </button>
    <button class="ghost-btn subtle" type="button" onclick={onResetStats}>
      Voortgang wissen
    </button>
  </div>
</header>
