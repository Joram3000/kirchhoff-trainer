<script lang="ts">
  import { CATEGORIES } from './lib/categories';
  import { generators } from './lib/generators';
  import { statsStore } from './lib/stores/stats.svelte';
  import { examStore } from './lib/stores/exams.svelte';
  import { parseAnswer, isWithinTolerance } from './lib/utils/answer';
  import { fmt } from './lib/utils/format';
  import type { CategoryId, Problem, View } from './lib/types';

  import AppHeader from './lib/components/ui/AppHeader.svelte';
  import CategoryTabs from './lib/components/ui/CategoryTabs.svelte';
  import LawLegend from './lib/components/ui/LawLegend.svelte';
  import CircuitCard from './lib/components/ui/CircuitCard.svelte';
  import QuestionCard from './lib/components/ui/QuestionCard.svelte';
  import TheoryView from './lib/components/ui/TheoryView.svelte';
  import ExamView from './lib/components/exam/ExamView.svelte';
  import Scratchpad from './lib/components/ui/Scratchpad.svelte';
  import AppFooter from './lib/components/ui/AppFooter.svelte';

  interface Feedback {
    status: 'good' | 'bad';
    message: string;
  }

  const initialCategoryId: CategoryId = 'kcl-node';
  let currentCategoryId = $state<CategoryId>(initialCategoryId);
  let currentProblem = $state<Problem>(generators[initialCategoryId](statsStore.for(initialCategoryId).streak));
  let solved = $state(false);
  let feedback = $state<Feedback | null>(null);
  let view = $state<View>('practice');

  function newProblem() {
    currentProblem = generators[currentCategoryId](statsStore.for(currentCategoryId).streak);
    solved = false;
    feedback = null;
  }

  function selectCategory(id: CategoryId) {
    currentCategoryId = id;
    view = 'practice';
    newProblem();
  }

  function checkAnswer(raw: string) {
    if (solved) return;

    const value = parseAnswer(raw);
    if (Number.isNaN(value)) {
      feedback = { status: 'bad', message: 'Vul eerst een getal in.' };
      return;
    }

    const correct = isWithinTolerance(value, currentProblem.answer, currentProblem.tolerance);
    statsStore.recordAttempt(currentCategoryId, correct);

    if (correct) {
      solved = true;
      feedback = { status: 'good', message: `Goed! ${fmt(currentProblem.answer)} ${currentProblem.unit} is correct.` };
    } else {
      feedback = { status: 'bad', message: 'Nog niet juist. Probeer opnieuw, of bekijk de uitwerking.' };
    }
  }

  function resetProgress() {
    statsStore.resetAll();
    examStore.resetAll();
  }
</script>

<div class="app">
  <AppHeader {view} onNavigate={(v) => (view = v)} onResetStats={resetProgress} />

  {#if view !== 'exam'}
    <CategoryTabs categories={CATEGORIES} activeId={currentCategoryId} onSelect={selectCategory} />
    <LawLegend />
  {/if}

  {#if view === 'practice'}
    <main class="layout">
      <CircuitCard problem={currentProblem} />
      <QuestionCard problem={currentProblem} {solved} {feedback} onCheck={checkAnswer} onNext={newProblem} />
    </main>
  {:else if view === 'theory'}
    <TheoryView />
  {/if}

  <!-- Kept mounted so filled-in answers survive a quick look at the theory. -->
  <div hidden={view !== 'exam'}>
    <ExamView />
  </div>

  <Scratchpad />

  {#if view === 'practice'}
    <AppFooter />
  {/if}
</div>
