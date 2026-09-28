import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { ReviewMode } from './components/ReviewMode';
import { ProgressScreen } from './components/ProgressScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { ProfileModal } from './components/ProfileModal';
import { GrammarHandbookModal } from './components/GrammarHandbookModal';
import { QUESTIONS } from './data/questions';
import { Question, QuestionCategory, QuizAttempt, QuizResult, StudentProfile, LeaderboardEntry } from './types/quiz';
import { storage } from './services/storage';
import { soundManager } from './services/sound';
import { Play, Sparkles, BookOpen, Trophy, ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => storage.getProfile());
  const [history, setHistory] = useState<QuizResult[]>(() => storage.getHistory());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => storage.getLeaderboard());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'quiz' | 'review' | 'ranking' | 'progress'>('quiz');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);

  // Quiz Lifecycle
  const [quizState, setQuizState] = useState<'select_mode' | 'playing' | 'result'>('select_mode');
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | 'standard' | 'diff_1' | 'diff_2' | 'diff_3' | 'review_drill'>('standard');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>('all');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);

  const refreshProfileAndData = () => {
    const p = storage.getProfile();
    const h = storage.getHistory();
    const l = storage.getLeaderboard();
    setProfile(p);
    setHistory(h);
    setLeaderboard(l);
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  // Fisher-Yates shuffle helper
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start Quiz with specific mode and difficulty filter (always picking 10 random questions)
  const startQuiz = (
    mode: QuestionCategory | 'standard' | 'diff_1' | 'diff_2' | 'diff_3',
    diffFilter: number | 'all' = selectedDifficulty,
    customQuestions?: Question[]
  ) => {
    let selected: Question[] = [];

    if (customQuestions && customQuestions.length > 0) {
      selected = shuffleArray(customQuestions).slice(0, 10);
    } else if (mode === 'diff_1' || mode === 'diff_2' || mode === 'diff_3') {
      const targetDiff = mode === 'diff_1' ? 1 : mode === 'diff_2' ? 2 : 3;
      const pool = QUESTIONS.filter((q) => q.difficulty === targetDiff);
      selected = shuffleArray(pool).slice(0, 10);
    } else if (mode === 'standard') {
      // Pick 10 balanced questions across categories & difficulties
      let pool = QUESTIONS;
      if (diffFilter !== 'all') {
        pool = QUESTIONS.filter((q) => q.difficulty === diffFilter);
      }

      const comps = shuffleArray(pool.filter((q) => q.category === 'components'));
      const rens = shuffleArray(pool.filter((q) => q.category === 'renbunsetsu'));
      const rels = shuffleArray(pool.filter((q) => q.category === 'relations'));
      const advs = shuffleArray(pool.filter((q) => q.category === 'comprehensive'));

      // 3 components, 2 renbunsetsu, 3 relations, 2 comprehensive = 10 questions
      const combined = [
        ...comps.slice(0, 3),
        ...rens.slice(0, 2),
        ...rels.slice(0, 3),
        ...advs.slice(0, 2),
      ];

      // If any category had fewer questions under this difficulty filter, fill from remaining pool
      if (combined.length < 10) {
        const remaining = pool.filter((q) => !combined.some((c) => c.id === q.id));
        const extra = shuffleArray(remaining).slice(0, 10 - combined.length);
        selected = shuffleArray([...combined, ...extra]);
      } else {
        selected = shuffleArray(combined);
      }
    } else {
      // Category specific (e.g. components, renbunsetsu, relations, comprehensive)
      let pool = QUESTIONS.filter((q) => q.category === mode);
      if (diffFilter !== 'all') {
        const filtered = pool.filter((q) => q.difficulty === diffFilter);
        if (filtered.length >= 5) {
          pool = filtered;
        }
      }
      selected = shuffleArray(pool).slice(0, 10);
    }

    if (selected.length === 0) {
      selected = shuffleArray(QUESTIONS).slice(0, 10);
    }

    setActiveCategory(mode);
    setActiveQuestions(selected);
    setQuizState('playing');
    setCurrentTab('quiz');
  };

  // Start Review Quiz (dedicated drill for wrong questions)
  const startReviewQuiz = (questionsToReview: Question[]) => {
    setActiveCategory('review_drill');
    setActiveQuestions(shuffleArray(questionsToReview).slice(0, 10));
    setQuizState('playing');
    setCurrentTab('quiz');
  };

  // Quiz Finished
  const handleFinishQuiz = (attempts: QuizAttempt[]) => {
    const totalQuestions = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect);
    const correctCount = correctAttempts.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Calculate score components
    const baseScore = correctCount * 1000;
    const speedBonus = attempts.reduce((acc, a) => {
      if (!a.isCorrect) return acc;
      return acc + Math.round(((25 - a.timeSpentSec) / 25) * 500);
    }, 0);
    const totalScoreEarned = attempts.reduce((acc, a) => acc + a.scoreEarned, 0);
    const comboBonus = Math.max(0, totalScoreEarned - (baseScore + speedBonus));

    // Calculate max combo
    let currentStreak = 0;
    let maxStreak = 0;
    attempts.forEach((a) => {
      if (a.isCorrect) {
        currentStreak += 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    // Category breakdown
    const categoryBreakdown: Record<QuestionCategory, { correct: number; total: number }> = {
      components: { correct: 0, total: 0 },
      renbunsetsu: { correct: 0, total: 0 },
      relations: { correct: 0, total: 0 },
      comprehensive: { correct: 0, total: 0 },
    };

    attempts.forEach((att) => {
      const q = QUESTIONS.find((item) => item.id === att.questionId);
      if (q) {
        categoryBreakdown[q.category].total += 1;
        if (att.isCorrect) {
          categoryBreakdown[q.category].correct += 1;
        }
      }
    });

    const isStandardOrCustom =
      activeCategory === 'standard' ||
      activeCategory === 'diff_1' ||
      activeCategory === 'diff_2' ||
      activeCategory === 'diff_3' ||
      activeCategory === 'review_drill';

    const result: QuizResult = {
      id: 'res_' + Date.now(),
      date: new Date().toISOString(),
      category: isStandardOrCustom ? 'comprehensive' : activeCategory,
      totalQuestions,
      correctCount,
      score: totalScoreEarned,
      baseScore,
      speedBonus,
      comboBonus,
      maxCombo: maxStreak,
      accuracy,
      attempts,
      categoryBreakdown,
    };

    // Save
    storage.saveQuizResult(result);
    setLatestResult(result);
    refreshProfileAndData();
    setQuizState('result');
  };

  const handleExitQuiz = () => {
    if (window.confirm('クイズを中断してメニューに戻りますか？')) {
      setQuizState('select_mode');
    }
  };

  const getModeTitle = (cat: QuestionCategory | 'standard' | 'diff_1' | 'diff_2' | 'diff_3' | 'review_drill') => {
    switch (cat) {
      case 'standard':
        return selectedDifficulty === 'all'
          ? 'スタンダード全10問総合検定'
          : selectedDifficulty === 1
          ? '初級・全10問総合検定'
          : selectedDifficulty === 2
          ? '中級・全10問標準検定'
          : '上級・全10問難関検定';
      case 'diff_1':
        return '初級（基礎マスター）特訓・10問';
      case 'diff_2':
        return '中級（定期テスト頻出）特訓・10問';
      case 'diff_3':
        return '上級（難関・高校入試対策）特訓・10問';
      case 'components':
        return '主語・述語・修飾語 特訓・10問';
      case 'renbunsetsu':
        return '連文節（主部・述部）マスター・10問';
      case 'relations':
        return '文節相互の関係（並立・補助）・10問';
      case 'comprehensive':
        return '総合ハイレベル演習・10問';
      case 'review_drill':
        return '間違い克服ドリル・10問';
      default:
        return '国語文法クイズ・10問';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (quizState === 'playing') {
            if (!window.confirm('クイズを中断して画面を切り替えますか？')) return;
          }
          setQuizState('select_mode');
          setCurrentTab(tab);
        }}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHandbook={() => setIsHandbookOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isPlayingQuiz={quizState === 'playing'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* TAB: QUIZ */}
        {currentTab === 'quiz' && (
          <div>
            {quizState === 'select_mode' && (
              <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Hero Mascot Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                        <span className="text-xs font-bold text-amber-300 tracking-wider inline-flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
                          中1国語文法・全100問データベース搭載！
                        </span>
                        <span className="text-[11px] font-extrabold bg-amber-400 text-indigo-950 px-2.5 py-0.5 rounded-full shadow-xs">
                          ランダム10問出題
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                        文の成分マスター
                      </h1>
                      <p className="text-sm text-indigo-100 mt-2 max-w-lg leading-relaxed">
                        主語・述語・修飾語の見分け方から、連文節、並立・補助の関係まで全100問を収録！
                        初級・中級・上級の3段階の難易度から選んで挑戦できます。
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
                        <button
                          onClick={() => startQuiz('standard')}
                          className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black rounded-xl text-sm shadow-lg shadow-amber-400/30 transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-indigo-950" />
                          <span>100問からランダム10問テストスタート！</span>
                        </button>

                        <button
                          onClick={() => setIsHandbookOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
                        >
                          <BookOpen className="w-4 h-4 text-amber-300" />
                          <span>要点を予習する</span>
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center">
                      <img
                        src="/src/assets/images/grammar_tutor_mascot_1790306394626.jpg"
                        alt="ふくろう先生"
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white/20 shadow-2xl animate-float"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-bold text-indigo-200 mt-2 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        家庭教師のふくろう先生
                      </span>
                    </div>
                  </div>
                </div>

                {/* Difficulty Filter Selector Bar */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>出題の難易度を選択（全100問から抽出）</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        自分の学習段階に合わせて問題の難易度を絞り込めます。
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto text-xs font-bold">
                      <button
                        onClick={() => setSelectedDifficulty('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          selectedDifficulty === 'all'
                            ? 'bg-white text-indigo-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        全難易度ミックス (100問)
                      </button>
                      <button
                        onClick={() => setSelectedDifficulty(1)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          selectedDifficulty === 1
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        <span>初級 ★☆☆ (30問)</span>
                      </button>
                      <button
                        onClick={() => setSelectedDifficulty(2)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          selectedDifficulty === 2
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-indigo-700'
                        }`}
                      >
                        <span>中級 ★★☆ (30問)</span>
                      </button>
                      <button
                        onClick={() => setSelectedDifficulty(3)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          selectedDifficulty === 3
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-700'
                        }`}
                      >
                        <span>上級 ★★★ (40問)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Level Special Challenge Cards (Direct Difficulty Drill) */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>難易度別コース特訓（ランダム10問）</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Level 1 Card */}
                    <div
                      onClick={() => startQuiz('diff_1', 1)}
                      className="group bg-gradient-to-br from-emerald-50/80 to-white p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ★☆☆ 初級コース
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">基礎マスター</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        主述・修飾語の基本編
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        「何が・どうする」の骨組みや文節区切りの基礎を固める10問！
                      </p>
                      <div className="mt-3 flex items-center text-xs font-bold text-emerald-700">
                        <span>初級10問に挑戦</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Level 2 Card */}
                    <div
                      onClick={() => startQuiz('diff_2', 2)}
                      className="group bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          ★★☆ 中級コース
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">定期テスト頻出</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        連文節・文節関係標準編
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        連体・連用修飾語の見分け、補助の関係、主部・述部の判定10問！
                      </p>
                      <div className="mt-3 flex items-center text-xs font-bold text-indigo-700">
                        <span>中級10問に挑戦</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Level 3 Card */}
                    <div
                      onClick={() => startQuiz('diff_3', 3)}
                      className="group bg-gradient-to-br from-rose-50/80 to-white p-4 rounded-2xl border-2 border-rose-200 hover:border-rose-500 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          ★★★ 上級コース
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">難関・入試対策</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        省略主語・ひっかけ演習編
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        二重主語、省略された主語の復元、被修飾語の複雑な係り受け10問！
                      </p>
                      <div className="mt-3 flex items-center text-xs font-bold text-rose-700">
                        <span>上級10問に挑戦</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wrong Questions Alert Notice if any */}
                {profile.wrongQuestionIds.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0">
                        {profile.wrongQuestionIds.length}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900">
                          間違えた問題が {profile.wrongQuestionIds.length} 問たまっています！
                        </h4>
                        <p className="text-xs text-rose-700">
                          克服ドリルで復習すると、理解度がグンと深まります。
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const wrongQs = QUESTIONS.filter((q) => profile.wrongQuestionIds.includes(q.id));
                        startReviewQuiz(wrongQs);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      今すぐ克服テストを受ける
                    </button>
                  </div>
                )}

                {/* Mode Select Grid */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>テーマ別トレーニングを選ぶ</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mode 1: Standard */}
                    <div
                      onClick={() => startQuiz('standard')}
                      className="group bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                          🎯
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                          総合バランス・10問
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        スタンダード文法検定
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        主語・述語・修飾語・連文節・文節相互の関係を網羅したおすすめ総合テストです。
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
                        <span>挑戦する</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Mode 2: Components */}
                    <div
                      onClick={() => startQuiz('components')}
                      className="group bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                          🔍
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          基礎特訓
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        主語・述語・修飾語マスター編
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        「何が・だれが」「どうする・どんなだ」を見分け、連体修飾語と連用修飾語を判定します。
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-emerald-600">
                        <span>挑戦する</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Mode 3: Renbunsetsu */}
                    <div
                      onClick={() => startQuiz('renbunsetsu')}
                      className="group bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
                          🧩
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                          まとまり判定
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        連文節（主部・述部・修飾部）編
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        2つ以上の文節が合わさった「主部」「述部」「修飾部」を正しく見抜くトレーニング！
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-amber-600">
                        <span>挑戦する</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Mode 4: Relations */}
                    <div
                      onClick={() => startQuiz('relations')}
                      className="group bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-500 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
                          ⇄
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          テスト超頻出
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        文節相互の関係（並立・補助・修飾）
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        入れ替え可能な「並立の関係」や、「〜ている」「〜てみる」などの「補助の関係」を完璧に！
                      </p>
                      <div className="mt-4 flex items-center text-xs font-bold text-purple-600">
                        <span>挑戦する</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle school learning tips card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      中1国語・定期テスト高得点の秘訣！
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      「主語・述語」を見つけるときは、まず文の最後にある【述語】からチェック！
                      そのあと「何が？だれが？」と問いかけると、主語を間違えずに見つけられます。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {quizState === 'playing' && (
              <QuizScreen
                questions={activeQuestions}
                categoryTitle={getModeTitle(activeCategory)}
                onFinishQuiz={handleFinishQuiz}
                onExitQuiz={handleExitQuiz}
              />
            )}

            {quizState === 'result' && latestResult && (
              <ResultScreen
                result={latestResult}
                allQuestions={QUESTIONS}
                profile={profile}
                onRetry={() => {
                  if (activeCategory === 'review_drill') {
                    startQuiz('standard');
                  } else {
                    startQuiz(activeCategory);
                  }
                }}
                onStartReview={() => {
                  const wrongQs = QUESTIONS.filter((q) => profile.wrongQuestionIds.includes(q.id));
                  if (wrongQs.length > 0) {
                    startReviewQuiz(wrongQs);
                  } else {
                    alert('現在、復習が必要な問題はありません！全問マスター達成です！');
                  }
                }}
                onGoToRanking={() => {
                  setQuizState('select_mode');
                  setCurrentTab('ranking');
                }}
              />
            )}
          </div>
        )}

        {/* TAB: REVIEW NOTEBOOK & DRILL */}
        {currentTab === 'review' && (
          <ReviewMode
            allQuestions={QUESTIONS}
            wrongQuestionIds={profile.wrongQuestionIds}
            masteredQuestionIds={profile.masteredQuestionIds}
            onStartReviewQuiz={(questionsToReview) => startReviewQuiz(questionsToReview)}
            onRefreshProfile={refreshProfileAndData}
          />
        )}

        {/* TAB: RANKING LEADERBOARD */}
        {currentTab === 'ranking' && (
          <LeaderboardScreen
            profile={profile}
            leaderboard={leaderboard}
            onStartQuiz={() => {
              setCurrentTab('quiz');
              startQuiz('standard');
            }}
          />
        )}

        {/* TAB: PROGRESS & GROWTH GRAPH */}
        {currentTab === 'progress' && (
          <ProgressScreen
            profile={profile}
            history={history}
          />
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onProfileUpdated={(p) => {
          setProfile(p);
          refreshProfileAndData();
        }}
      />

      <GrammarHandbookModal
        isOpen={isHandbookOpen}
        onClose={() => setIsHandbookOpen(false)}
      />
    </div>
  );
}
