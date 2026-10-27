import type { ExamResult } from '../types';

const STORAGE_KEY = 'kirchhoff-trainer-exams-v1';

function loadFromStorage(): Record<string, ExamResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // Storage unavailable (private browsing, disabled cookies, …) — start fresh.
    return {};
  }
}

function createExamStore() {
  const byExam = $state<Record<string, ExamResult>>(loadFromStorage());

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(byExam));
    } catch {
      // Results just won't survive a reload — non-fatal.
    }
  }

  return {
    for(id: string): ExamResult | null {
      return byExam[id] ?? null;
    },
    record(id: string, score: number, max: number) {
      const prev = byExam[id];
      byExam[id] = {
        best: Math.max(prev?.best ?? 0, score),
        last: score,
        max,
        attempts: (prev?.attempts ?? 0) + 1,
      };
      persist();
    },
    resetAll() {
      for (const id of Object.keys(byExam)) delete byExam[id];
      persist();
    },
  };
}

export const examStore = createExamStore();
