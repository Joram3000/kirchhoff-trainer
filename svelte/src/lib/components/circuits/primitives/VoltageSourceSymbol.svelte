<script lang="ts">
  interface Props {
    cx: number;
    cy: number;
    r: number;
    /** Terminal marked +, along whichever axis the source lies on. */
    plus: 'left' | 'right' | 'top' | 'bottom';
  }

  let { cx, cy, r, plus }: Props = $props();

  let off = $derived(r * 0.5);
  let vertical = $derived(plus === 'top' || plus === 'bottom');
  let plusFirst = $derived(plus === 'left' || plus === 'top');
</script>

<circle class="comp" {cx} {cy} {r} />
{#if vertical}
  <text class="sign" x={cx} y={cy - off} text-anchor="middle" dy=".35em">{plusFirst ? '+' : '−'}</text>
  <text class="sign" x={cx} y={cy + off} text-anchor="middle" dy=".35em">{plusFirst ? '−' : '+'}</text>
{:else}
  <text class="sign" x={cx - off} y={cy} text-anchor="middle" dy=".35em">{plusFirst ? '+' : '−'}</text>
  <text class="sign" x={cx + off} y={cy} text-anchor="middle" dy=".35em">{plusFirst ? '−' : '+'}</text>
{/if}
