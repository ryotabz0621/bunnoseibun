import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Award, ChevronDown, ChevronUp, BookOpen, Trophy } from 'lucide-react';
import { QuizResult, Question, StudentProfile } from '../types/quiz';
import { soundManager } from '../services/sound';

interface ResultScreenProps {
  result: QuizResult;
  allQuestions: Question[];
  profile?: StudentProfile;
  onRetry: () => void;
  onStartReview: () => void;
  onGoToRanking: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  allQuestions,
  profile,
  onRetry,
  onStartReview,
  onGoToRanking,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    soundManager.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry]);

  const getRank = (accuracy: number) => {
    if (accuracy >= 90) {
      return {
        grade: 'S',
        title: '国語文法の達人（マスター）',
        color: 'text-amber-500',
        bg: 'bg-amber-50 border-amber-200',
        message: '素晴らしい！文の成分と文節相互の関係を完全に理解できています。定期テストでも満点を狙える実力です！',
      };
    }
    if (accuracy >= 80) {
      return {
        grade: 'A',
        title: 'ハイレベル国語ファイター',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50 border-indigo-200',
        message: 'とても優秀な成績です！文の骨組みがしっかり捉えられています。細かい修飾関係もマスターして満点を目指そう！',
      };
    }
    if (accuracy >= 65) {
      return {
        grade: 'B',
        title: '文法チャレンジャー',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 border-emerald-200',
        message: '基礎力はバッチリついています！連文節や補助の関係など、間違えやすいパターンを復習ドリルで克服しよう！',
      };
    }
    return {
      grade: 'C',
      title: '文法ルーキー',
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200',
      message: 'まだまだこれから伸びるチャンス！まずは「述語（文末）」から「主語（何が）」を探すコツを意識して練習しよう！',
    };
  };

  const rank = getRank(result.accuracy);
  const wrongAttempts = result.attempts.filter((a) => !a.isCorrect);

  const toggleAccordion = (id: string) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Result Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        {/* Mascot + Badge row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <img
            src="/src/assets/images/grammar_tutor_mascot_1790306394626.jpg"
            alt="ふくろう先生"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="text-left">
            <span className="text-xs font-bold text-indigo-600">テスト結果発表</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              挑戦おつかれさまでした！
            </h2>
            {profile && (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
                  {profile.gradeClass} {profile.attendanceNumber ? `${profile.attendanceNumber}番` : ''}
                </span>
                <span className="text-xs font-bold text-slate-900">{profile.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">さんの解答記録</span>
              </div>
            )}
          </div>
          <img
            src="/src/assets/images/grammar_master_badge_1790306406156.jpg"
            alt="合格バッジ"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-100 shadow-sm hidden sm:block"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Rank & Score Badge */}
        <div className={`inline-flex flex-col items-center justify-center p-5 rounded-2xl border-2 ${rank.bg} my-2 max-w-md mx-auto`}>
          <div className="flex items-center gap-2">
            <Award className={`w-6 h-6 ${rank.color}`} />
            <span className={`text-4xl font-black ${rank.color} tracking-tight`}>
              RANK {rank.grade}
            </span>
          </div>
          <span className="text-sm font-bold text-slate-800 mt-1">{rank.title}</span>
          <p className="text-xs text-slate-600 mt-2 px-2 leading-relaxed">{rank.message}</p>
        </div>

        {/* Detailed Score Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">総合スコア</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-900 tabular-nums">
              {result.score.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">pt</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">正答率</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums">
              {result.accuracy}%
            </span>
            <span className="text-[10px] text-slate-500 block">
              {result.correctCount} / {result.totalQuestions} 問正解
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">最高連続正解</span>
            <span className="text-xl sm:text-2xl font-black text-amber-500 tabular-nums">
              {result.maxCombo}
            </span>
            <span className="text-[10px] text-slate-500 block">連続コンボ</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">ボーナス内訳</span>
            <span className="text-xs font-bold text-slate-700 block mt-1">
              速さ +{result.speedBonus}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold block">
              コンボ +{result.comboBonus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {wrongAttempts.length > 0 && (
            <button
              onClick={onStartReview}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>間違えた問題を今すぐ復習する ({wrongAttempts.length}問)</span>
            </button>
          )}

          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>もう一度挑戦する</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white border border-white/30">
              Enter ↵
            </kbd>
          </button>

          <button
            onClick={onGoToRanking}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>ランキングを見る</span>
          </button>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>分野別の正解状況</span>
          <span className="text-xs font-normal text-slate-400">（得意・苦手をチェック）</span>
        </h3>

        <div className="space-y-3">
          {Object.entries(result.categoryBreakdown).map(([catKey, data]) => {
            const catNameMap: Record<string, string> = {
              components: '主語・述語・修飾語',
              renbunsetsu: '連文節（主部・述部・修飾部）',
              relations: '文節相互の関係（並立・補助・修飾など）',
              comprehensive: '総合応用問題',
            };
            const name = catNameMap[catKey] || catKey;
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

            return (
              <div key={catKey}>
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-slate-700">{name}</span>
                  <span className="text-slate-500 tabular-nums">
                    {data.correct} / {data.total} 問 ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review All Questions from this Quiz */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          今回の全問題と解説まとめ
        </h3>

        <div className="space-y-3">
          {result.attempts.map((attempt, idx) => {
            const question = allQuestions.find((q) => q.id === attempt.questionId);
            if (!question) return null;

            const isExpanded = expandedQuestionId === question.id;

            return (
              <div
                key={question.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(question.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        attempt.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {attempt.isCorrect ? '正解' : '不正解'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        question.difficulty === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : question.difficulty === 2
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {question.difficulty === 1 ? '初級' : question.difficulty === 2 ? '中級' : '上級'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                      {question.questionText}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs leading-relaxed">
                    <div className="font-bold text-slate-800 text-sm">{question.sentence}</div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                      <span className="font-bold text-indigo-700 block mb-1">【要点】</span>
                      {question.explanation.summary}
                    </div>
                    <p className="text-slate-600">{question.explanation.whyCorrect}</p>
                    <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                      <span className="font-bold">テストの急所: </span>
                      {question.explanation.testAdvice}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
