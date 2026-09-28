import { StudentProfile, QuizResult, LeaderboardEntry } from '../types/quiz';

const STORAGE_KEYS = {
  CURRENT_PROFILE: 'bunno_seibun_current_student',
  RESULTS_HISTORY: 'bunno_seibun_history',
  LEADERBOARD: 'bunno_seibun_leaderboard',
  WRONG_QUESTIONS: 'bunno_seibun_wrong_questions',
};

export const AVATARS = [
  { id: 'cat', emoji: '🐱', name: 'しろねこ', color: 'bg-amber-100 border-amber-300' },
  { id: 'dog', emoji: '🐶', name: 'しばいぬ', color: 'bg-orange-100 border-orange-300' },
  { id: 'bear', emoji: '🐻', name: 'くまさん', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'fox', emoji: '🦊', name: 'きつね', color: 'bg-rose-100 border-rose-300' },
  { id: 'rabbit', emoji: '🐰', name: 'うさぎ', color: 'bg-pink-100 border-pink-300' },
  { id: 'owl', emoji: '🦉', name: 'ふくろう', color: 'bg-indigo-100 border-indigo-300' },
];

export const GRADE_CLASSES = [
  '1年1組',
  '1年2組',
  '1年3組',
  '1年4組',
  '1年5組',
  '1年6組',
  '2年1組',
  '2年2組',
  '2年3組',
  '2年4組',
  '2年5組',
  '2年6組',
  '3年1組',
  '3年2組',
  '3年3組',
  '3年4組',
  '3年5組',
  '3年6組',
];

// Initial mock classmates for ranking competition
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'bot-1', studentName: 'ハルト', gradeClass: '1年2組', attendanceNumber: 14, avatarId: 'owl', score: 9800, accuracy: 100, maxCombo: 10, date: '2026-09-24' },
  { id: 'bot-2', studentName: 'サクラ', gradeClass: '1年1組', attendanceNumber: 8, avatarId: 'rabbit', score: 9400, accuracy: 95, maxCombo: 9, date: '2026-09-23' },
  { id: 'bot-3', studentName: 'ソウタ', gradeClass: '1年3組', attendanceNumber: 21, avatarId: 'fox', score: 8900, accuracy: 90, maxCombo: 8, date: '2026-09-24' },
  { id: 'bot-4', studentName: 'ユウナ', gradeClass: '1年6組', attendanceNumber: 32, avatarId: 'cat', score: 8600, accuracy: 88, maxCombo: 8, date: '2026-09-25' },
  { id: 'bot-5', studentName: 'レン', gradeClass: '1年2組', attendanceNumber: 5, avatarId: 'dog', score: 8400, accuracy: 85, maxCombo: 7, date: '2026-09-22' },
  { id: 'bot-6', studentName: 'アオイ', gradeClass: '1年4組', attendanceNumber: 17, avatarId: 'bear', score: 7850, accuracy: 80, maxCombo: 6, date: '2026-09-24' },
  { id: 'bot-7', studentName: 'コウキ', gradeClass: '1年1組', attendanceNumber: 11, avatarId: 'dog', score: 7200, accuracy: 80, maxCombo: 5, date: '2026-09-21' },
  { id: 'bot-8', studentName: 'メイ', gradeClass: '1年5組', attendanceNumber: 27, avatarId: 'rabbit', score: 6700, accuracy: 75, maxCombo: 5, date: '2026-09-23' },
  { id: 'bot-9', studentName: 'ヒナタ', gradeClass: '1年6組', attendanceNumber: 9, avatarId: 'fox', score: 6200, accuracy: 70, maxCombo: 4, date: '2026-09-24' },
  { id: 'bot-10', studentName: 'ダイキ', gradeClass: '1年3組', attendanceNumber: 2, avatarId: 'owl', score: 5500, accuracy: 65, maxCombo: 4, date: '2026-09-24' },
];

export const storage = {
  // Student Profile
  getProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // Default initial profile
    const defaultProfile: StudentProfile = {
      id: 'student_' + Math.random().toString(36).substring(2, 9),
      name: '国語チャレンジャー',
      gradeClass: '1年1組',
      attendanceNumber: 1,
      avatarId: 'cat',
      createdAt: new Date().toISOString(),
      totalQuizzesPlayed: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestCombo: 0,
      wrongQuestionIds: [],
      masteredQuestionIds: [],
    };
    this.saveProfile(defaultProfile);
    return defaultProfile;
  },

  saveProfile(profile: StudentProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, JSON.stringify(profile));
  },

  updateProfileNameAndClass(
    name: string,
    gradeClass: string,
    avatarId: string,
    attendanceNumber?: number
  ): StudentProfile {
    const profile = this.getProfile();
    profile.name = name.trim() || '国語チャレンジャー';
    profile.gradeClass = gradeClass;
    profile.avatarId = avatarId;
    profile.attendanceNumber = attendanceNumber;
    this.saveProfile(profile);

    // Also update current student's entry in leaderboard if exists
    this.syncCurrentUserInLeaderboard(profile);
    return profile;
  },

  // Results History
  getHistory(): QuizResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESULTS_HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  },

  saveQuizResult(result: QuizResult): void {
    const history = this.getHistory();
    history.unshift(result); // new results first
    // keep last 50
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.RESULTS_HISTORY, JSON.stringify(history));

    // Update profile
    const profile = this.getProfile();
    profile.totalQuizzesPlayed += 1;
    profile.totalQuestions += result.totalQuestions;
    profile.totalCorrect += result.correctCount;
    if (result.score > profile.bestScore) {
      profile.bestScore = result.score;
    }
    if (result.maxCombo > profile.bestCombo) {
      profile.bestCombo = result.maxCombo;
    }

    // Update wrong questions & mastered questions
    result.attempts.forEach((att) => {
      if (!att.isCorrect) {
        if (!profile.wrongQuestionIds.includes(att.questionId)) {
          profile.wrongQuestionIds.push(att.questionId);
        }
        // Remove from mastered if answered incorrectly
        profile.masteredQuestionIds = profile.masteredQuestionIds.filter((id) => id !== att.questionId);
      } else {
        // If it was in wrong questions and now correct
        if (profile.wrongQuestionIds.includes(att.questionId)) {
          // Remove from wrong list
          profile.wrongQuestionIds = profile.wrongQuestionIds.filter((id) => id !== att.questionId);
          if (!profile.masteredQuestionIds.includes(att.questionId)) {
            profile.masteredQuestionIds.push(att.questionId);
          }
        }
      }
    });

    this.saveProfile(profile);
    this.syncCurrentUserInLeaderboard(profile, result);
  },

  // Leaderboard
  getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // Initialize default leaderboard
    const profile = this.getProfile();
    const initialList = [...DEFAULT_LEADERBOARD];
    if (profile.bestScore > 0) {
      initialList.push({
        id: profile.id,
        studentName: profile.name,
        gradeClass: profile.gradeClass,
        attendanceNumber: profile.attendanceNumber,
        avatarId: profile.avatarId,
        score: profile.bestScore,
        accuracy: profile.totalQuestions > 0 ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0,
        maxCombo: profile.bestCombo,
        date: new Date().toISOString().split('T')[0],
        isCurrentUser: true,
      });
    }
    initialList.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(initialList));
    return initialList;
  },

  syncCurrentUserInLeaderboard(profile: StudentProfile, latestResult?: QuizResult): void {
    const list = this.getLeaderboard();
    const existingIndex = list.findIndex((item) => item.id === profile.id || item.isCurrentUser);

    const scoreToSet = Math.max(profile.bestScore, latestResult ? latestResult.score : 0);
    if (scoreToSet <= 0) return;

    const entry: LeaderboardEntry = {
      id: profile.id,
      studentName: profile.name,
      gradeClass: profile.gradeClass,
      attendanceNumber: profile.attendanceNumber,
      avatarId: profile.avatarId,
      score: scoreToSet,
      accuracy: profile.totalQuestions > 0 ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 100,
      maxCombo: Math.max(profile.bestCombo, latestResult ? latestResult.maxCombo : 0),
      date: new Date().toISOString().split('T')[0],
      isCurrentUser: true,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = entry;
    } else {
      list.push(entry);
    }

    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(list));
  },

  // Reset or remove wrong question
  markQuestionMastered(questionId: string): void {
    const profile = this.getProfile();
    profile.wrongQuestionIds = profile.wrongQuestionIds.filter((id) => id !== questionId);
    if (!profile.masteredQuestionIds.includes(questionId)) {
      profile.masteredQuestionIds.push(questionId);
    }
    this.saveProfile(profile);
  },

  clearWrongQuestions(): void {
    const profile = this.getProfile();
    profile.wrongQuestionIds = [];
    this.saveProfile(profile);
  },
};
