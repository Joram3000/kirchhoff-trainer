<script lang="ts">
  interface Props {
    x: number;
    y: number;
    accent?: boolean;
  }

  let { x, y, accent = false }: Props = $props();
</script>

<circle class="node-dot" class:node-dot-accent={accent} cx={x} cy={y} r="4" />
