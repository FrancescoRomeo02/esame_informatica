export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuestionState {
  id: number;
  box: number; // Leitner box (0-5)
  nextReview: number; // Timestamp
  lastAnswered: number | null;
}

export interface AppState {
  progress: Record<number, QuestionState>;
}