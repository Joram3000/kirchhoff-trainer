<script lang="ts">
  import { tick } from 'svelte';
  import type { Accent, CircuitSpec } from '../../types';
  import { evaluate, formatResult } from '../../utils/calc';
  import CircuitDiagram from '../circuits/CircuitDiagram.svelte';

  type Mode = 'text' | 'draw';

  interface Props {
    /** The current exercise's figure, shown faintly under the drawing canvas to sketch on. */
    circuit?: CircuitSpec | null;
    accent?: Accent;
  }

  let { circuit = null, accent = 'kcl' }: Props = $props();

  let expanded = $state(false);
  let mode = $state<Mode>('text');
  let text = $state('');
  let canvasEl: HTMLCanvasElement | undefined = $state();

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function strokeColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#141a2e';
  }

  // Resizing a canvas clears it, so every time it becomes visible it starts
  // blank — acceptable for a rudimentary scratchpad that isn't meant to persist.
  function resizeCanvas() {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = Math.max(1, Math.round(rect.width * dpr));
    canvasEl.height = Math.max(1, Math.round(rect.height * dpr));
    canvasEl.getContext('2d')?.scale(dpr, dpr);
  }

  $effect(() => {
    if (expanded && mode === 'draw' && canvasEl) resizeCanvas();
  });

  $effect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (expanded && mode === 'draw') resizeCanvas();
      }, 150);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  });

  function pos(e: PointerEvent) {
    const rect = canvasEl!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: PointerEvent) {
    if (!canvasEl) return;
    drawing = true;
    canvasEl.setPointerCapture(e.pointerId);
    const p = pos(e);
    lastX = p.x;
    lastY = p.y;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!drawing || !canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }

  function stopDrawing() {
    drawing = false;
  }

  /**
   * Typing "=" after a calculation fills in the result: "5 * 30 =" becomes
   * "5 * 30 = 150". Only the part after any earlier "=" on the line counts,
   * so "R = 10 // 5 =" works too.
   */
  async function handleInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const el = e.currentTarget;
    text = el.value;
    if (!(e instanceof InputEvent) || e.data !== '=') return;
    const caret = el.selectionStart;
    const line = text.slice(text.lastIndexOf('\n', caret - 2) + 1, caret - 1);
    const value = evaluate(line.slice(line.lastIndexOf('=') + 1));
    if (!Number.isFinite(value)) return;
    const insert = ` ${formatResult(value)}`;
    text = text.slice(0, caret) + insert + text.slice(caret);
    await tick();
    el.setSelectionRange(caret + insert.length, caret + insert.length);
  }

  function clear() {
    if (mode === 'text') {
      text = '';
    } else if (canvasEl) {
      canvasEl.getContext('2d')?.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  }
</script>

<section class="card scratchpad-card">
  <div class="scratchpad-header">
    <button
      class="scratchpad-toggle"
      type="button"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M5 3 L11 8 L5 13"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Kladblok
    </button>
    {#if expanded}
      <div class="scratchpad-tools">
        <button class="sp-tool" class:active={mode === 'text'} type="button" onclick={() => (mode = 'text')}>
          Tekst
        </button>
        <button class="sp-tool" class:active={mode === 'draw'} type="button" onclick={() => (mode = 'draw')}>
          Tekenen
        </button>
        <button class="ghost-btn subtle" type="button" onclick={clear}>Wissen</button>
      </div>
    {/if}
  </div>
  {#if expanded}
    <div class="scratchpad-body">
      {#if mode === 'text'}
        <textarea
          class="scratchpad-textarea"
          placeholder={'Reken hier je antwoord uit. Typ "=" achter een som en de uitkomst verschijnt:\n5 * 30 = 150\n(12 + 6) / 3 = 6\n10 // 5 = 3,33   (// is parallel)'}
          value={text}
          oninput={handleInput}
        ></textarea>
        <p class="scratchpad-hint">Rekenen: + − * / ^ en haakjes, komma of punt als decimaalteken, <b>//</b> voor weerstanden parallel.</p>
      {:else}
        <div class="scratchpad-draw" class:with-figure={circuit}>
          {#if circuit}
            <div class="scratchpad-figure circuit-card accent-{accent}" aria-hidden="true">
              <CircuitDiagram {circuit} />
            </div>
          {/if}
          <canvas
            bind:this={canvasEl}
            class="scratchpad-canvas"
            onpointerdown={handlePointerDown}
            onpointermove={handlePointerMove}
            onpointerup={stopDrawing}
            onpointerleave={stopDrawing}
            onpointercancel={stopDrawing}
          ></canvas>
        </div>
      {/if}
    </div>
  {/if}
</section>
