import { QuestionState } from '../types';

const STORAGE_KEY = 'quiz_srs_progress';

export const saveProgress = (progress: Record<number, QuestionState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const loadProgress = (): Record<number, QuestionState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
};

export const clearProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};