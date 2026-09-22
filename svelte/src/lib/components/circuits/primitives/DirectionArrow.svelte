<script lang="ts">
  interface Props {
    x: number;
    y: number;
    /** Rotation in degrees applied around (x, y); 0 points along +x. */
    angle: number;
    accent?: boolean;
    length?: number;
  }

  let { x, y, angle, accent = false, length = 11 }: Props = $props();

  let lineClass = $derived(accent ? 'arrow-accent' : 'arrow-neutral');
  let markerId = $derived(accent ? 'arrowhead-accent' : 'arrowhead-neutral');
</script>

<g class={lineClass} transform="translate({x},{y}) rotate({angle})">
  <line x1={-length} y1="0" x2={length} y2="0" marker-end="url(#{markerId})" />
</g>
