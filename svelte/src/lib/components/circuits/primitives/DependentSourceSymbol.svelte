<script lang="ts">
  interface Props {
    cx: number;
    cy: number;
    /** Half the diamond's diagonal. */
    r: number;
    arrowUp?: boolean;
  }

  let { cx, cy, r, arrowUp = true }: Props = $props();

  let a = $derived(r * 0.5);
</script>

<!-- Diamond = controlled (dependent) current source, as in Hambley. -->
<path class="comp" d="M {cx} {cy - r} L {cx + r} {cy} L {cx} {cy + r} L {cx - r} {cy} Z" />
<g class="arrow-neutral">
  <line x1={cx} y1={arrowUp ? cy + a : cy - a} x2={cx} y2={arrowUp ? cy - a : cy + a} marker-end="url(#arrowhead-neutral)" />
</g>
