<script lang="ts">
  import type { Problem } from '../../types';
  import LawChip from './LawChip.svelte';
  import AnswerForm from './AnswerForm.svelte';
  import FeedbackBanner from './FeedbackBanner.svelte';
  import StepsPanel from './StepsPanel.svelte';
  import ProgressLine from './ProgressLine.svelte';

  interface Feedback {
    status: 'good' | 'bad';
    message: string;
  }

  interface Props {
    problem: Problem;
    solved: boolean;
    feedback: Feedback | null;
    onCheck: (raw: string) => void;
    onNext: () => void;
  }

  let { problem, solved, feedback, onCheck, onNext }: Props = $props();
</script>

<div class="question-card card">
  <LawChip accent={problem.accent} />
  <!-- The question is a trusted HTML fragment generated internally (only <sub>), never user input. -->
  <p class="question-text">{@html problem.question}</p>
  <AnswerForm resetKey={problem} unit={problem.unit} disabled={solved} onSubmit={onCheck} />
  <FeedbackBanner {feedback} />
  <StepsPanel resetKey={problem} steps={problem.steps} forceOpen={solved} />
  <button class="secondary-btn" type="button" onclick={onNext}>Volgende opgave →</button>
  <ProgressLine categoryId={problem.categoryId} />
</div>
