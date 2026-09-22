<script lang="ts">
  interface Props {
    cx: number;
    railY: number;
  }

  let { cx, railY }: Props = $props();
  let s = $derived(railY + 12);
</script>

<line class="wire" x1={cx} y1={railY} x2={cx} y2={s} />
<line class="comp" x1={cx - 13} y1={s} x2={cx + 13} y2={s} />
<line class="comp" x1={cx - 8} y1={s + 5} x2={cx + 8} y2={s + 5} />
<line class="comp" x1={cx - 3} y1={s + 10} x2={cx + 3} y2={s + 10} />
