export type QuestionCategory = 'components' | 'renbunsetsu' | 'relations' | 'comprehensive';

export type QuestionType = 'multiple_choice' | 'bunsetsu_select' | 'relation_choice';

export interface BunsetsuItem {
  id: number;
  text: string;
  isTarget?: boolean;
  roleLabel?: string;
  annotation?: string;
}

export interface QuestionExplanation {
  summary: string;
  whyCorrect: string;
  breakdown: Array<{
    bunsetsu: string;
    role: string;
    hint?: string;
  }>;
  diagram?: {
    from: string;
    to: string;
    relationLabel: string;
    description: string;
  };
  testAdvice: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryName: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  sentence: string;
  bunsetsuList: BunsetsuItem[];
  questionType: QuestionType;
  options?: string[];
  correctOptionIndex?: number;
  targetBunsetsuIndices?: number[]; // For bunsetsu_select questions
  relationPair?: {
    fromIndex: number;
    toIndex: number;
    fromLabel: string;
    toLabel: string;
  };
  explanation: QuestionExplanation;
}

export interface QuizAttempt {
  questionId: string;
  selectedOptionIndex?: number;
  selectedBunsetsuIndices?: number[];
  isCorrect: boolean;
  timeSpentSec: number;
  scoreEarned: number;
  comboAtAnswer: number;
}

export interface QuizResult {
  id: string;
  date: string;
  category: QuestionCategory;
  totalQuestions: number;
  correctCount: number;
  score: number;
  baseScore: number;
  speedBonus: number;
  comboBonus: number;
  maxCombo: number;
  accuracy: number;
  attempts: QuizAttempt[];
  categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }>;
}

export interface StudentProfile {
  id: string;
  name: string;
  gradeClass: string; // e.g. "1年2組"
  attendanceNumber?: number; // e.g. 15 (1〜60番)
  avatarId: string;
  createdAt: string;
  totalQuizzesPlayed: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  bestCombo: number;
  wrongQuestionIds: string[];
  masteredQuestionIds: string[];
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  gradeClass: string;
  attendanceNumber?: number;
  avatarId: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  date: string;
  isCurrentUser?: boolean;
}
