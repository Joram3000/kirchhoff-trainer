<script lang="ts">
  import { resistorPath, type Orientation } from '../../../svg/paths';

  interface Props {
    cx: number;
    cy: number;
    /** Extent along the resistor's own axis. */
    length: number;
    /** Zigzag amplitude perpendicular to that axis. */
    thickness: number;
    orientation?: Orientation;
    /** Highlights this resistor as the subject of the current question. */
    accent?: boolean;
  }

  let { cx, cy, length, thickness, orientation = 'horizontal', accent = false }: Props = $props();
  let d = $derived(resistorPath(cx, cy, length, thickness, orientation));
</script>

<path class="comp" class:comp-accent={accent} {d} />
