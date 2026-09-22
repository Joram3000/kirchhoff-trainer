<script lang="ts">
  import type { KvlSideSpec, Position } from '../../types';
  import { fmt } from '../../utils/format';
  import NodeDot from './primitives/NodeDot.svelte';

  interface Props {
    sides: KvlSideSpec[];
  }

  let { sides }: Props = $props();

  const TL: readonly [number, number] = [110, 60];
  const TR: readonly [number, number] = [280, 60];
  const BR: readonly [number, number] = [280, 220];
  const BL: readonly [number, number] = [110, 220];
  const corners = [TL, TR, BR, BL];

  interface SideGeom {
    p20: readonly [number, number];
    p80: readonly [number, number];
    mid: readonly [number, number];
    anchor: 'start' | 'middle' | 'end';
  }

  const GEOM: Record<Position, SideGeom> = {
    boven: { p20: [144, 46], p80: [246, 46], mid: [195, 38], anchor: 'middle' },
    rechts: { p20: [294, 92], p80: [294, 188], mid: [310, 140], anchor: 'start' },
    onder: { p20: [246, 234], p80: [144, 234], mid: [195, 250], anchor: 'middle' },
    links: { p20: [96, 188], p80: [96, 92], mid: [80, 140], anchor: 'end' },
  };

  function startSign(orient: 'stijging' | 'daling'): string {
    return orient === 'stijging' ? '−' : '+';
  }
  function endSign(orient: 'stijging' | 'daling'): string {
    return orient === 'stijging' ? '+' : '−';
  }
</script>

<polygon class="wire" points={corners.map((p) => p.join(',')).join(' ')} fill="none" />
{#each corners as p, i (i)}
  <NodeDot x={p[0]} y={p[1]} />
{/each}

{#each sides as s (s.pos)}
  {@const g = GEOM[s.pos]}
  <text class={s.isUnknown ? 'sign-accent' : 'sign'} x={g.p20[0]} y={g.p20[1]} text-anchor="middle" dy=".35em">{startSign(s.orient)}</text>
  <text class={s.isUnknown ? 'sign-accent' : 'sign'} x={g.p80[0]} y={g.p80[1]} text-anchor="middle" dy=".35em">{endSign(s.orient)}</text>
{/each}

{#each sides as s (s.pos)}
  {@const g = GEOM[s.pos]}
  <text class={s.isUnknown ? 'lbl-unknown' : 'lbl'} x={g.mid[0]} y={g.mid[1]} text-anchor={g.anchor}
    >V<tspan baseline-shift="sub" font-size="9">{s.letter}</tspan>{s.isUnknown ? ' = ?' : ` = ${fmt(s.value)} V`}</text
  >
{/each}

<path class="wire" d="M 201.76 112.5 A 16 16 0 1 1 181.14 119" fill="none" />
<path class="arrow-fill-neutral" d="M 186.14 110.34 L 183.96 120.62 L 178.33 117.38 Z" />
<text class="hint" x="195" y="112" text-anchor="middle">met de klok mee</text>
