<script lang="ts">
  type Mode = 'text' | 'draw';

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
        <textarea class="scratchpad-textarea" placeholder="Reken hier je antwoord uit…" bind:value={text}
        ></textarea>
      {:else}
        <canvas
          bind:this={canvasEl}
          class="scratchpad-canvas"
          onpointerdown={handlePointerDown}
          onpointermove={handlePointerMove}
          onpointerup={stopDrawing}
          onpointerleave={stopDrawing}
          onpointercancel={stopDrawing}
        ></canvas>
      {/if}
    </div>
  {/if}
</section>
