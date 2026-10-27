<script lang="ts">
  import type { Exam, ExamQuestion } from '../../types';
  import { EXAMS } from '../../exams';
  import { examStore } from '../../stores/exams.svelte';
  import { parseAnswer, isWithinTolerance } from '../../utils/answer';
  import ExamQuestionCard from './ExamQuestionCard.svelte';

  /** Question and point counts per exam, for the overview tiles. */
  const SUMMARY = new Map(
    EXAMS.map((exam) => {
      const qs = exam.build();
      const points = qs.flatMap((q) => q.parts).reduce((s, p) => s + p.points, 0);
      return [exam.id, { questions: qs.length, points }];
    }),
  );

  let active = $state<Exam | null>(null);
  let questions = $state.raw<ExamQuestion[]>([]);
  let answers = $state<Record<string, string>>({});
  let results = $state<Record<string, boolean> | null>(null);

  let parts = $derived(questions.flatMap((q, qi) => q.parts.map((p, pi) => ({ key: `${qi}.${pi}`, part: p }))));
  let maxPoints = $derived(parts.reduce((s, { part }) => s + part.points, 0));
  let filled = $derived(parts.filter(({ key }) => (answers[key] ?? '').trim() !== '').length);
  let score = $derived(results ? parts.reduce((s, { key, part }) => s + (results![key] ? part.points : 0), 0) : 0);
  /** The common Dutch linear norm: 1 + 9 × fraction of points. */
  let grade = $derived(maxPoints > 0 ? 1 + (9 * score) / maxPoints : 1);

  function start(exam: Exam) {
    active = exam;
    questions = exam.build();
    answers = {};
    results = null;
    window.scrollTo({ top: 0 });
  }

  function check() {
    const out: Record<string, boolean> = {};
    for (const { key, part } of parts) {
      const raw = (answers[key] ?? '').trim();
      if (part.choices) {
        out[key] = raw === String(part.answer);
      } else {
        const value = parseAnswer(raw);
        out[key] = !Number.isNaN(value) && isWithinTolerance(value, part.answer, part.tolerance);
      }
    }
    results = out;
    examStore.record(active!.id, score, maxPoints);
  }

  function retry() {
    answers = {};
    results = null;
    window.scrollTo({ top: 0 });
  }

  const fmtGrade = (g: number) => g.toFixed(1).replace('.', ',');
</script>

{#if !active}
  <section class="exam-home">
    <div class="card exam-hero">
      <h2>Tentamenhoek</h2>
      <p>
        Oefen zoals op het tentamen: werk alle opgaven uit (op papier of in het kladblok), vul je antwoorden in en laat de
        toets pas aan het eind nakijken. Daarna zie je per deelvraag het juiste antwoord en de uitwerking.
      </p>
      <p class="exam-topics">
        Tentamenstof (les 7): knooppuntspanning · stroomwet van Kirchhoff · superpositie · Thévenin &amp; Norton · maximum
        power transfer · vervangingsweerstand — plus vermogen en spanningsdeling uit de oefentoets.
      </p>
    </div>

    <div class="exam-list">
      {#each EXAMS as exam (exam.id)}
        {@const summary = SUMMARY.get(exam.id)!}
        {@const result = examStore.for(exam.id)}
        <button class="card exam-tile" class:featured={exam.generated} type="button" onclick={() => start(exam)}>
          <span class="exam-tile-title">{exam.title}</span>
          <span class="exam-tile-desc">{exam.description}</span>
          <span class="exam-tile-meta">
            {summary.questions} opgaven · {summary.points} punten
            {#if result}
              <span class="exam-best">beste: {result.best}/{result.max}</span>
            {/if}
          </span>
        </button>
      {/each}
    </div>
  </section>
{:else}
  <section class="exam">
    <div class="exam-bar">
      <button class="ghost-btn" type="button" onclick={() => (active = null)}>← Alle toetsen</button>
      <div class="exam-bar-title">
        <h2>{active.title}</h2>
        <p class="subtitle">{questions.length} opgaven · {maxPoints} punten</p>
      </div>
      {#if results}
        <div class="exam-score">{score}/{maxPoints} pnt · cijfer {fmtGrade(grade)}</div>
      {/if}
    </div>

    {#each questions as question, qi (qi)}
      <ExamQuestionCard
        {question}
        keyPrefix={String(qi)}
        {answers}
        {results}
        onAnswer={(key, value) => (answers[key] = value)}
      />
    {/each}

    <div class="card exam-actions">
      {#if !results}
        <span class="exam-progress">{filled} van {parts.length} deelvragen ingevuld</span>
        <button class="primary-btn" type="button" onclick={check}>Nakijken</button>
      {:else}
        <span class="exam-final">
          <b>{score} van {maxPoints} punten</b> — cijferindicatie {fmtGrade(grade)}
          {#if examStore.for(active.id)}<span class="exam-best">beste: {examStore.for(active.id)!.best}/{maxPoints}</span>{/if}
        </span>
        <div class="exam-actions-buttons">
          <button class="ghost-btn" type="button" onclick={retry}>Opnieuw maken</button>
          {#if active.generated}
            <button class="primary-btn" type="button" onclick={() => start(active!)}>Nieuwe proeftoets</button>
          {/if}
        </div>
      {/if}
    </div>
  </section>
{/if}
