<script lang="ts">
  import type { CircuitSpec, GridElement, GridSpec } from '../../types';
  import { layoutGrid } from '../../svg/grid';
  import { LAB_PRESETS } from '../../lab/presets';
  import { analyze, wireFlows, type LabElement, type LabPreset } from '../../lab/analyze';
  import { fmt } from '../../utils/format';
  import { m, d, num, tone, renderMath } from '../../utils/tex';
  import CircuitDiagram from '../circuits/CircuitDiagram.svelte';

  let presetId = $state(LAB_PRESETS[0].id);
  /** Edited element values for the current preset, by element id. */
  let values = $state<Record<string, number>>({});
  /** Sources switched off, by element id. */
  let off = $state<Record<string, boolean>>({});
  /** Moving dots along the wires; off by default for people who asked their system for less motion. */
  let animate = $state(!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  let base = $derived(LAB_PRESETS.find((p) => p.id === presetId)!);
  let preset = $derived<LabPreset>({
    ...base,
    elements: base.elements.map((e) => ({ ...e, value: values[e.id] ?? e.value })),
  });
  let result = $derived.by(() => {
    try {
      return analyze(preset, new Set(Object.keys(off).filter((id) => off[id])));
    } catch {
      return null;
    }
  });

  function choose(id: string) {
    presetId = id;
    values = {};
    off = {};
  }

  const UNIT = { R: 'Ω', V: 'V', I: 'A' } as const;
  const RANGE = { R: [1, 100, 1], V: [-100, 100, 1], I: [-20, 20, 0.5] } as const;

  function setValue(e: LabElement, raw: string) {
    const v = Number(raw.replace(',', '.'));
    if (!Number.isFinite(v)) return;
    // A zero or negative resistance has no meaning here and would make the system unsolvable.
    values[e.id] = e.kind === 'R' ? Math.max(0.1, v) : v;
  }

  /**
   * The schematic annotated with values, currents and node voltages. `text`
   * formats every changing number, so the same structure can be laid out with
   * worst-case placeholders to get a frame that never moves.
   */
  function annotate(text: (kind: 'value' | 'current' | 'node', id: string) => string): GridSpec {
    const elements = preset.elements.map((e): GridElement => {
      const label = `${e.name} = ${text('value', e.id)} ${UNIT[e.kind]}${off[e.id] ? ' (uit)' : ''}`;
      const current =
        e.kind === 'I'
          ? undefined
          : { label: `${text('current', e.id)} A`, toward: 'to' as const, side: e.currentSide, toned: true };
      const common = { id: e.id, from: e.from, to: e.to, label, side: e.side, value: e.value, current };
      return e.kind === 'R'
        ? { ...common, kind: 'R' }
        : e.kind === 'V'
          ? { ...common, kind: 'V', plus: e.plus ?? 'from' }
          : { ...common, kind: 'I', toward: e.toward ?? 'to' };
    });
    return {
      wires: preset.wires,
      elements,
      dots: preset.dots,
      ground: preset.ground,
      texts: preset.nodes.map((n) => ({
        at: n.labelAt,
        anchor: n.anchor ?? 'middle',
        text: n.name === '0' ? '0 V' : `v_${n.name} = ${text('node', n.name)} V`,
        style: 'voltage' as const,
      })),
    };
  }

  /** Sized once per preset for the widest numbers a slider can produce, so dragging never rescales the figure. */
  let frame = $derived.by(() => {
    void presetId;
    return layoutGrid(annotate(() => '-888,88')).viewBox;
  });

  let circuit = $derived.by<CircuitSpec>(() => {
    const currents = new Map(result?.elements.map((r) => [r.el.id, r.i]));
    const values = new Map(preset.elements.map((e) => [e.id, e.value]));
    const spec = annotate((kind, id) =>
      fmt(kind === 'value' ? values.get(id)! : kind === 'current' ? (currents.get(id) ?? 0) : (result?.nodeV[id] ?? 0)),
    );
    if (!animate || !result) return { kind: 'grid', ...spec, frame };
    return {
      kind: 'grid',
      ...spec,
      frame,
      elements: spec.elements.map((el) => ({ ...el, flow: currents.get(el.id!) })),
      flows: wireFlows(preset, result),
    };
  });

  /** Symbol of an element's current and voltage in the equations. */
  const iSym = (e: LabElement) => tone('current', e.kind === 'I' ? e.name : `i_{${e.name}}`);
  const vSym = (e: LabElement) => tone('voltage', `v_{${e.name}}`);

  /** "a − b + c" from signed terms, with a leading minus but no leading plus. */
  function signed(parts: [sign: number, body: string][]): string {
    return parts.map(([s, body], k) => `${s < 0 ? '-' : k > 0 ? '+' : ''} ${body}`).join(' ');
  }
  const numbers = (vals: number[], kind: 'current' | 'voltage') =>
    signed(vals.map((x) => [x < 0 ? -1 : 1, tone(kind, num(Math.abs(x)))]));
  const check = (sum: number) => (Math.abs(sum) < 1e-6 ? String.raw`= 0 \;\checkmark` : `= ${num(sum)}`);

  let kclLines = $derived(
    (result?.kcl ?? []).map(({ node, terms }) => {
      const vals = terms.map((t) => t.sign * t.r.i);
      const sum = vals.reduce((a, b) => a + b, 0);
      return d`\begin{aligned} \text{knooppunt ${node.name}:}\quad & ${signed(terms.map((t) => [t.sign, iSym(t.r.el)]))} \\ & = ${numbers(vals, 'current')} ${check(sum)} \end{aligned}`;
    }),
  );
  let kvlLines = $derived(
    (result?.kvl ?? []).map(({ loop, terms }) => {
      const vals = terms.map((t) => t.dir * t.r.v);
      const sum = vals.reduce((a, b) => a + b, 0);
      return d`\begin{aligned} \text{lus ${loop.name}:}\quad & ${signed(terms.map((t) => [t.dir, vSym(t.r.el)]))} \\ & = ${numbers(vals, 'voltage')} ${check(sum)} \end{aligned}`;
    }),
  );
  let powerSum = $derived(result ? result.elements.reduce((s, r) => s + r.p, 0) : 0);
</script>

<section class="lab">
  <div class="card lab-intro">
    <h2>Kirchhoff-speeltuin</h2>
    <p>
      Verander de waarden van de weerstanden en bronnen, of zet een bron uit, en zie meteen alle knooppuntspanningen en
      stromen. Daaronder staan KCL per knooppunt en KVL per lus met de getallen ingevuld — ze tellen altijd op tot nul.
    </p>
    <div class="lab-presets">
      {#each LAB_PRESETS as p (p.id)}
        <button class="tab-btn" class:active={p.id === presetId} type="button" onclick={() => choose(p.id)}>{p.title}</button>
      {/each}
    </div>
  </div>

  <div class="layout">
    <div class="card circuit-card lab-figure">
      <div class="circuit-caption">{base.title}</div>
      <CircuitDiagram {circuit} />
      <label class="lab-toggle lab-animate">
        <input type="checkbox" bind:checked={animate} />
        Stroom laten bewegen — hoe sneller de bolletjes, hoe meer ampère
      </label>
      <p class="lab-legend">
        <span class="tone-current"><svg width="22" height="10" aria-hidden="true"><path d="M1 5 H15 M13 1 L20 5 L13 9 Z" /></svg> stroom (A) — de pijl is de referentierichting</span>
        <span class="tone-voltage"><b>v</b> knooppuntspanning (V)</span>
      </p>
      <p class="lab-note">Een negatieve stroom loopt in werkelijkheid tegen de pijl in.</p>
    </div>

    <div class="card lab-controls">
      <p class="lab-desc">{base.description}</p>
      {#each preset.elements as e (e.id)}
        {@const [min, max, step] = RANGE[e.kind]}
        <div class="lab-control lab-{e.kind}" class:is-off={off[e.id]}>
          <span class="lab-name">{@html renderMath(m`${e.name}`)}</span>
          <input
            type="range"
            {min}
            {max}
            {step}
            value={e.value}
            disabled={off[e.id]}
            oninput={(ev) => setValue(e, ev.currentTarget.value)}
          />
          <input
            class="lab-number"
            type="text"
            inputmode="decimal"
            value={fmt(e.value)}
            disabled={off[e.id]}
            onchange={(ev) => setValue(e, ev.currentTarget.value)}
          />
          <span class="lab-unit">{UNIT[e.kind]}</span>
          {#if e.kind !== 'R'}
            <label class="lab-toggle">
              <input type="checkbox" checked={!off[e.id]} onchange={(ev) => (off[e.id] = !ev.currentTarget.checked)} />
              aan
            </label>
          {/if}
        </div>
      {/each}
      <button class="ghost-btn subtle" type="button" onclick={() => choose(presetId)}>Beginwaarden terugzetten</button>
    </div>
  </div>

  {#if result}
    <div class="lab-results">
      <div class="card">
        <h3>KCL per knooppunt <span class="tone-current">· stromen</span></h3>
        <p class="lab-sub">Stromen die het knooppunt verlaten tellen positief, stromen die erin gaan negatief.</p>
        {#each kclLines as line, k (k)}
          <div class="lab-eq">{@html renderMath(line)}</div>
        {/each}
      </div>
      <div class="card">
        <h3>KVL per lus <span class="tone-voltage">· spanningen</span></h3>
        <p class="lab-sub">Met de klok mee; elke term is de spanning van + naar − in de looprichting van het element.</p>
        {#each kvlLines as line, k (k)}
          <div class="lab-eq">{@html renderMath(line)}</div>
        {/each}
      </div>
    </div>

    <div class="card">
      <h3>Alle elementen</h3>
      <div class="lab-table-wrap">
        <table class="lab-table">
          <thead>
            <tr><th>Element</th><th class="tone-voltage">Spanning v</th><th class="tone-current">Stroom i</th><th>Vermogen P</th><th></th></tr>
          </thead>
          <tbody>
            {#each result.elements as r (r.el.id)}
              <tr>
                <td>{@html renderMath(m`${r.el.name}`)}</td>
                <td class="tone-voltage">{fmt(r.v)} V</td>
                <td class="tone-current">{fmt(r.i)} A</td>
                <td>{fmt(r.p)} W</td>
                <td class={r.p >= 0 ? 'lab-in' : 'lab-out'}>{Math.abs(r.p) < 0.005 ? '—' : r.p > 0 ? 'opgenomen' : 'geleverd'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="lab-sub">
        Vermogensbalans: alle vermogens samen {Math.abs(powerSum) < 1e-6 ? 'zijn 0 W ✓' : `zijn ${fmt(powerSum)} W`} — wat de
        bronnen leveren, nemen de andere elementen op.
      </p>
    </div>
  {:else}
    <div class="card"><p>Deze combinatie is niet op te lossen (bijvoorbeeld twee spanningsbronnen die elkaar tegenspreken).</p></div>
  {/if}
</section>
