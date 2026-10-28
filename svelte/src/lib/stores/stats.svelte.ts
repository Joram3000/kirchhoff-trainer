import { CATEGORIES } from '../categories';
import type { CategoryId, CategoryStats } from '../types';

const STORAGE_KEY = 'kirchhoff-trainer-stats-v1';

function emptyStats(): CategoryStats {
  return { attempts: 0, correct: 0, streak: 0, best: 0 };
}

function loadFromStorage(): Partial<Record<CategoryId, CategoryStats>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // Storage unavailable (private browsing, disabled cookies, …) — start fresh.
    return {};
  }
}

function createStatsStore() {
  const stored = loadFromStorage();
  const byCategory = $state<Record<CategoryId, CategoryStats>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, stored[c.id] ?? emptyStats()])) as Record<
      CategoryId,
      CategoryStats
    >,
  );

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(byCategory));
    } catch {
      // Progress just won't survive a reload — non-fatal.
    }
  }

  return {
    for(id: CategoryId): CategoryStats {
      return byCategory[id];
    },
    recordAttempt(id: CategoryId, correct: boolean) {
      const s = byCategory[id];
      s.attempts++;
      if (correct) {
        s.correct++;
        s.streak++;
        s.best = Math.max(s.best, s.streak);
      } else {
        s.streak = 0;
      }
      persist();
    },
    setMarkedMastered(id: CategoryId, marked: boolean) {
      byCategory[id].markedMastered = marked;
      persist();
    },
    resetAll() {
      for (const c of CATEGORIES) byCategory[c.id] = emptyStats();
      persist();
    },
  };
}

export const statsStore = createStatsStore();
