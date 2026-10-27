<script lang="ts">
  interface Props {
    cx: number;
    cy: number;
    r: number;
    arrowUp?: boolean;
    /** Overrides `arrowUp`; allows horizontal arrows for sources between two nodes. */
    dir?: 'up' | 'down' | 'left' | 'right';
    accent?: boolean;
  }

  let { cx, cy, r, arrowUp = true, dir, accent = false }: Props = $props();

  let d = $derived(dir ?? (arrowUp ? 'up' : 'down'));
  let a = $derived(r * 0.58);
  let [x1, y1, x2, y2] = $derived(
    d === 'up'
      ? [cx, cy + a, cx, cy - a]
      : d === 'down'
        ? [cx, cy - a, cx, cy + a]
        : d === 'right'
          ? [cx - a, cy, cx + a, cy]
          : [cx + a, cy, cx - a, cy],
  );
  let lineClass = $derived(accent ? 'arrow-accent' : 'arrow-neutral');
  let markerId = $derived(accent ? 'arrowhead-accent' : 'arrowhead-neutral');
</script>

<circle class="comp" {cx} {cy} {r} />
<g class={lineClass}>
  <line {x1} {y1} {x2} {y2} marker-end="url(#{markerId})" />
</g>
