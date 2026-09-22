<script lang="ts">
  interface Props {
    cx: number;
    cy: number;
    r: number;
    arrowUp?: boolean;
    accent?: boolean;
  }

  let { cx, cy, r, arrowUp = true, accent = false }: Props = $props();

  let y1 = $derived(arrowUp ? cy + r * 0.58 : cy - r * 0.58);
  let y2 = $derived(arrowUp ? cy - r * 0.58 : cy + r * 0.58);
  let lineClass = $derived(accent ? 'arrow-accent' : 'arrow-neutral');
  let markerId = $derived(accent ? 'arrowhead-accent' : 'arrowhead-neutral');
</script>

<circle class="comp" {cx} {cy} {r} />
<g class={lineClass}>
  <line x1={cx} {y1} x2={cx} {y2} marker-end="url(#{markerId})" />
</g>
