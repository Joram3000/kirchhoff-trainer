<script lang="ts">
  import { renderMath } from '../../utils/tex';

  interface Props {
    /** Any value that changes identity when a new problem starts, to collapse the panel. */
    resetKey: unknown;
    steps: string[];
    forceOpen: boolean;
  }

  let { resetKey, steps, forceOpen }: Props = $props();

  let open = $state(false);

  $effect(() => {
    void resetKey;
    open = false;
  });

  $effect(() => {
    if (forceOpen) open = true;
  });
</script>

<div class="steps-wrap">
  <button class="ghost-btn" type="button" onclick={() => (open = !open)}>
    {open ? 'Verberg uitwerking' : 'Toon uitwerking'}
  </button>
  {#if open}
    <ol class="steps-list">
      {#each steps as step, i (i)}
        <!-- Steps are trusted HTML fragments generated internally (<sub>/<b> and \( TeX \)), never user input. -->
        <li>{@html renderMath(step)}</li>
      {/each}
    </ol>
  {/if}
</div>
