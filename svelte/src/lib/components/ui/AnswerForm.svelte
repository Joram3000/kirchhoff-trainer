<script lang="ts">
  interface Props {
    /** Any value that changes identity when a new problem starts, to reset the field. */
    resetKey: unknown;
    unit: string;
    disabled: boolean;
    onSubmit: (raw: string) => void;
  }

  let { resetKey, unit, disabled, onSubmit }: Props = $props();

  let value = $state('');
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    void resetKey;
    value = '';
    inputEl?.focus();
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
    }
  }
</script>

<div class="answer-row">
  <input
    bind:this={inputEl}
    bind:value
    class="answer-input"
    type="text"
    inputmode="decimal"
    autocomplete="off"
    placeholder="antwoord"
    {disabled}
    onkeydown={handleKeydown}
  />
  <span class="unit">{unit}</span>
  <button class="primary-btn" type="button" {disabled} onclick={() => onSubmit(value)}>Controleer</button>
</div>
