<script lang="ts">
  interface Props {
    cx: number;
    cy: number;
    plusAt?: 'top' | 'bottom';
  }

  let { cx, cy, plusAt = 'top' }: Props = $props();

  const gap = 6;
  const longW = 22;
  const shortW = 13;

  let topIsPlus = $derived(plusAt === 'top');
  let yTop = $derived(cy - gap);
  let yBot = $derived(cy + gap);
</script>

{#if topIsPlus}
  <line class="plate-long" x1={cx - longW / 2} y1={yTop} x2={cx + longW / 2} y2={yTop} />
  <line class="plate-short" x1={cx - shortW / 2} y1={yBot} x2={cx + shortW / 2} y2={yBot} />
{:else}
  <line class="plate-short" x1={cx - shortW / 2} y1={yTop} x2={cx + shortW / 2} y2={yTop} />
  <line class="plate-long" x1={cx - longW / 2} y1={yBot} x2={cx + longW / 2} y2={yBot} />
{/if}
<text class="sign" x={cx + 16} y={yTop - 3} text-anchor="start">{topIsPlus ? '+' : '−'}</text>
<text class="sign" x={cx + 16} y={yBot + 13} text-anchor="start">{topIsPlus ? '−' : '+'}</text>
