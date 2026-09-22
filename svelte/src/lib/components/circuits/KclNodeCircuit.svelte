<script lang="ts">
  import type { KclBranchSpec, Position } from '../../types';
  import { fmt } from '../../utils/format';
  import NodeDot from './primitives/NodeDot.svelte';
  import DirectionArrow from './primitives/DirectionArrow.svelte';

  interface Props {
    branches: KclBranchSpec[];
  }

  let { branches }: Props = $props();

  const cx = 190;
  const cy = 150;
  const L = 95;

  interface BranchGeom {
    end: readonly [number, number];
    arrow: readonly [number, number];
    labelPos: readonly [number, number];
    anchor: 'start' | 'middle' | 'end';
  }

  const GEOM: Record<Position, BranchGeom> = {
    boven: { end: [cx, cy - L], arrow: [cx, cy - 55], labelPos: [cx, cy - L - 14], anchor: 'middle' },
    rechts: { end: [cx + L, cy], arrow: [cx + 55, cy], labelPos: [cx + L + 14, cy], anchor: 'start' },
    onder: { end: [cx, cy + L], arrow: [cx, cy + 55], labelPos: [cx, cy + L + 18], anchor: 'middle' },
    links: { end: [cx - L, cy], arrow: [cx - 55, cy], labelPos: [cx - L - 14, cy], anchor: 'end' },
  };

  const OUT_ANGLE: Record<Position, number> = { boven: 270, rechts: 0, onder: 90, links: 180 };

  function branchAngle(pos: Position, dir: 'in' | 'out'): number {
    return dir === 'out' ? OUT_ANGLE[pos] : (OUT_ANGLE[pos] + 180) % 360;
  }
</script>

{#each branches as b (b.pos)}
  <line class="wire" x1={cx} y1={cy} x2={GEOM[b.pos].end[0]} y2={GEOM[b.pos].end[1]} />
{/each}

<NodeDot x={cx} y={cy} />

{#each branches as b (b.pos)}
  <DirectionArrow x={GEOM[b.pos].arrow[0]} y={GEOM[b.pos].arrow[1]} angle={branchAngle(b.pos, b.dir)} accent={b.isUnknown} />
{/each}

{#each branches as b (b.pos)}
  {@const g = GEOM[b.pos]}
  <text
    class={b.isUnknown ? 'lbl-unknown' : 'lbl'}
    x={g.labelPos[0]}
    y={g.labelPos[1]}
    text-anchor={g.anchor}
    dy={g.anchor === 'middle' ? undefined : '.35em'}
  >i<tspan baseline-shift="sub" font-size="9">{b.letter}</tspan>{b.isUnknown ? ' = ?' : ` = ${fmt(b.value)} A`}</text>
{/each}
