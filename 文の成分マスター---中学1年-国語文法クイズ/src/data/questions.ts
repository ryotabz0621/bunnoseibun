import { Question } from '../types/quiz';
import { QUESTIONS_PART1 } from './questions_part1';
import { QUESTIONS_PART2 } from './questions_part2';
import { QUESTIONS_PART3 } from './questions_part3';
import { QUESTIONS_PART4 } from './questions_part4';

// 100問の文法問題コレクション（各単元25問ずつ、難易度1・2・3を完全網羅）
export const QUESTIONS: Question[] = [
  ...QUESTIONS_PART1, // components (主語・述語・修飾語・接続語・独立語) 25問
  ...QUESTIONS_PART2, // renbunsetsu (連文節: 主部・述部・修飾部など) 25問
  ...QUESTIONS_PART3, // relations (文節相互の関係: 主述・修飾・並立・補助・接続) 25問
  ...QUESTIONS_PART4, // comprehensive (総合演習: 省略主語・被修飾語・複合判定) 25問
];

export const getQuestionsByDifficulty = (difficulty: 1 | 2 | 3): Question[] => {
  return QUESTIONS.filter((q) => q.difficulty === difficulty);
};

export const getQuestionsByCategory = (category: string): Question[] => {
  return QUESTIONS.filter((q) => q.category === category);
};
