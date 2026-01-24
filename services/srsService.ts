import { Question, QuestionState } from '../types';

// Intervals in minutes for each box level
// Box 0: Immediate (0 min)
// Box 1: 1 min
// Box 2: 10 min
// Box 3: 1 hour
// Box 4: 5 hours
// Box 5: 1 day
const INTERVALS = [0, 1, 10, 60, 300, 1440];

export const getInitialState = (id: number): QuestionState => ({
  id,
  box: 0,
  nextReview: 0, // 0 means available immediately
  lastAnswered: null
});

export const updateQuestionState = (current: QuestionState, isCorrect: boolean): QuestionState => {
  const now = Date.now();
  let newBox = current.box;

  if (isCorrect) {
    // Move up a box, max 5
    newBox = Math.min(newBox + 1, INTERVALS.length - 1);
  } else {
    // Reset to box 0 on error
    newBox = 0;
  }

  const delayMinutes = INTERVALS[newBox];
  const nextReview = now + (delayMinutes * 60 * 1000);

  return {
    ...current,
    box: newBox,
    nextReview: nextReview,
    lastAnswered: now
  };
};

export const getNextQuestion = (
  questions: Question[],
  progress: Record<number, QuestionState>
): Question | null => {
  const now = Date.now();

  // 1. Identify candidates that are due for review (nextReview <= now)
  const dueCandidates = questions.filter(q => {
    const state = progress[q.id] || getInitialState(q.id);
    return state.nextReview <= now;
  });

  if (dueCandidates.length > 0) {
    // Sort by priority: Lower box (prioritize difficult items) first, then by earliest review time
    dueCandidates.sort((a, b) => {
      const stateA = progress[a.id] || getInitialState(a.id);
      const stateB = progress[b.id] || getInitialState(b.id);
      
      if (stateA.box !== stateB.box) {
        return stateA.box - stateB.box; // Lower box first
      }
      return stateA.nextReview - stateB.nextReview;
    });
    return dueCandidates[0];
  }

  // 2. If nothing is "due", pick the one with the earliest nextReview time to allow "studying ahead"
  // or simply tell user they are done. For this app, let's allow studying ahead but warn or prioritize lowest nextReview.
  
  // Actually, for a simple quiz app, let's just cycle the ones with the lowest review time even if in future
  const allCandidates = [...questions].sort((a, b) => {
      const stateA = progress[a.id] || getInitialState(a.id);
      const stateB = progress[b.id] || getInitialState(b.id);
      return stateA.nextReview - stateB.nextReview;
  });

  return allCandidates[0] || null;
};

export const getStats = (questions: Question[], progress: Record<number, QuestionState>) => {
  let mastered = 0; // Box >= 4
  let learning = 0; // Box 1-3
  let newOrStruggling = 0; // Box 0
  
  questions.forEach(q => {
    const state = progress[q.id];
    if (!state || state.box === 0) newOrStruggling++;
    else if (state.box >= 4) mastered++;
    else learning++;
  });

  return { mastered, learning, newOrStruggling, total: questions.length };
};