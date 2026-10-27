<script lang="ts">
  import type { ExamQuestion } from '../../types';
  import { fmt } from '../../utils/format';
  import CircuitDiagram from '../circuits/CircuitDiagram.svelte';
  import StepsPanel from '../ui/StepsPanel.svelte';

  interface Props {
    question: ExamQuestion;
    /** Prefix for answer keys, so parts of different questions never collide. */
    keyPrefix: string;
    answers: Record<string, string>;
    /** Per answer key: whether it was right. Null until the exam is graded. */
    results: Record<string, boolean> | null;
    onAnswer: (key: string, value: string) => void;
  }

  let { question, keyPrefix, answers, results, onAnswer }: Props = $props();

  let points = $derived(question.parts.reduce((sum, p) => sum + p.points, 0));
</script>

<article class="card exam-q">
  <header class="exam-q-head">
    <h3>{question.title}</h3>
    <span class="law-chip law-{question.accent}">{question.topic}</span>
    <span class="exam-q-points">{points} pnt</span>
  </header>

  <div class="exam-q-body">
    {#if question.circuit}
      <div class="exam-figure circuit-card accent-{question.accent}">
        <CircuitDiagram circuit={question.circuit} />
      </div>
    {/if}

    <div class="exam-q-text">
      <!-- Intro, questions, choices and steps are trusted HTML fragments authored in src/lib/exams. -->
      <p class="exam-intro">{@html question.intro}</p>

      {#each question.parts as part, pi (pi)}
        {@const key = `${keyPrefix}.${pi}`}
        {@const ok = results?.[key]}
        <div class="exam-part" class:good={ok === true} class:bad={ok === false}>
          <div class="exam-part-head">
            <span class="part-label">{part.label}</span>
            <p class="question-text">{@html part.question}</p>
            <span class="part-points">{part.points} pnt</span>
          </div>

          {#if part.choices}
            <div class="choice-list">
              {#each part.choices as c, ci (ci)}
                <label class="choice" class:picked={answers[key] === String(ci)}>
                  <input
                    type="radio"
                    name={key}
                    checked={answers[key] === String(ci)}
                    disabled={results !== null}
                    onchange={() => onAnswer(key, String(ci))}
                  />
                  <span>{@html c}</span>
                </label>
              {/each}
            </div>
          {:else}
            <div class="answer-row">
              <input
                class="answer-input"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                placeholder="antwoord"
                value={answers[key] ?? ''}
                disabled={results !== null}
                oninput={(e) => onAnswer(key, e.currentTarget.value)}
              />
              <span class="unit">{part.unit}</span>
            </div>
          {/if}

          {#if results !== null}
            <div class="part-verdict">
              {#if ok}
                ✓ Goed — {part.points} pnt
              {:else if part.choices}
                ✗ Juist antwoord: {@html part.choices[part.answer]}
              {:else}
                ✗ Juist antwoord: {fmt(part.answer)} {part.unit}
              {/if}
            </div>
            <StepsPanel resetKey={question} steps={part.steps} forceOpen={false} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</article>
