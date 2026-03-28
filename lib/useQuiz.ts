'use client';

import { useState, useCallback } from 'react';
import type { QuizAnswers, ObjectiveKey } from '@/types';
import { saveQuizPartial } from './session';

export type QuizScreen =
  | 0 | 1 | 2 | 3 | '3b' | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  | 'result' | 'pricing';

const SEQUENCE: QuizScreen[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 'result', 'pricing'];

// Mapa de cada tela para % de progresso
const PROGRESS: Record<string, number> = {
  '0': 0, '1': 9, '2': 18, '3': 27, '3b': 32,
  '4': 36, '5': 45, '6': 54, '7': 63, '8': 72,
  '9': 81, '10': 90, '11': 100, 'result': 100, 'pricing': 100,
};

export function useQuiz(initialAnswers: QuizAnswers = {}) {
  const [cur, setCur] = useState<QuizScreen>(0);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);

  const setAnswer = useCallback((partial: Partial<QuizAnswers>) => {
    setAnswers((prev: QuizAnswers) => {
      const next = { ...prev, ...partial };
      saveQuizPartial(next);
      return next;
    });
  }, []);

  const goTo = useCallback((screen: QuizScreen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCur(screen);
  }, []);

  const next = useCallback(() => {
    if (cur === 0) { goTo(1); return; }
    if (cur === 3) {
      answers.q3?.includes('pele' as ObjectiveKey) ? goTo('3b') : goTo(4);
      return;
    }
    if (cur === '3b') { goTo(4); return; }
    const idx = SEQUENCE.indexOf(cur as QuizScreen);
    if (idx !== -1 && idx < SEQUENCE.length - 1) goTo(SEQUENCE[idx + 1]);
  }, [cur, answers.q3, goTo]);

  const prev = useCallback(() => {
    if (cur === 0 || cur === 1) { goTo(0); return; }
    if (cur === '3b') { goTo(3); return; }
    if (cur === 4 && answers.q3?.includes('pele' as ObjectiveKey)) { goTo('3b'); return; }
    const idx = SEQUENCE.indexOf(cur as QuizScreen);
    if (idx > 0) goTo(SEQUENCE[idx - 1]);
  }, [cur, answers.q3, goTo]);

  const reset = useCallback(() => {
    setAnswers({});
    setCur(0);
  }, []);

  const progress = PROGRESS[String(cur)] ?? 0;

  return { cur, answers, setAnswer, goTo, next, prev, reset, progress };
}
