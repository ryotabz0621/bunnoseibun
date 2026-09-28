import React, { useState } from 'react';
import { BookOpen, CheckCircle, Play, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../types/quiz';
import { storage } from '../services/storage';

interface ReviewModeProps {
  allQuestions: Question[];
  wrongQuestionIds: string[];
  masteredQuestionIds: string[];
  onStartReviewQuiz: (questionsToReview: Question[]) => void;
  onRefreshProfile: () => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  allQuestions,
  wrongQuestionIds,
  masteredQuestionIds,
  onStartReviewQuiz,
  onRefreshProfile,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const wrongQuestions = allQuestions.filter((q) => wrongQuestionIds.includes(q.id));
  const masteredQuestions = allQuestions.filter((q) => masteredQuestionIds.includes(q.id));

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleMarkMastered = (id: string) => {
    storage.markQuestionMastered(id);
    onRefreshProfile();
  };

  const handleClearAll = () => {
    if (window.confirm('間違えた問題の履歴をリセットしますか？')) {
      storage.clearWrongQuestions();
      onRefreshProfile();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-bold text-slate-900">
                間違い復習ノート＆特訓ドリル
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              過去のクイズで間違えた問題が集まります。再テストで全問正解を目指そう！
            </p>
          </div>

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => onStartReviewQuiz(wrongQuestions)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>復習テストを開始する ({wrongQuestions.length}問)</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-center">
            <span className="text-[11px] font-bold text-rose-500 block">要復習の問題</span>
            <span className="text-2xl font-black text-rose-700 tabular-nums">
              {wrongQuestions.length}
            </span>
            <span className="text-[10px] text-rose-400 block">問</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
            <span className="text-[11px] font-bold text-emerald-600 block">克服完了</span>
            <span className="text-2xl font-black text-emerald-700 tabular-nums">
              {masteredQuestions.length}
            </span>
            <span className="text-[10px] text-emerald-500 block">問クリア！</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 block">全収録問題数</span>
            <span className="text-2xl font-black text-slate-700 tabular-nums">
              {allQuestions.length}
            </span>
            <span className="text-[10px] text-slate-400 block">問中</span>
          </div>
        </div>
      </div>

      {/* Wrong Questions List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>現在要復習の問題リスト ({wrongQuestions.length}問)</span>
          </h3>

          {wrongQuestions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              復習リストを空にする
            </button>
          )}
        </div>

        {wrongQuestions.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-base font-bold text-slate-700">
              現在、復習が必要な問題はありません！
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              クイズで間違えた問題がここに自動で保存されます。新しいクイズに挑戦してみよう！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {wrongQuestions.map((q) => {
              const isExpanded = expandedId === q.id;

              return (
                <div
                  key={q.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors"
                >
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          q.difficulty === 1
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : q.difficulty === 2
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {q.difficulty === 1 ? '初級 ★☆☆' : q.difficulty === 2 ? '中級 ★★☆' : '上級 ★★★'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {q.categoryName}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {q.questionText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkMastered(q.id);
                        }}
                        className="text-xs text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded transition-colors cursor-pointer"
                        title="理解できたので克服済みに移動"
                      >
                        克服済みにする
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-white space-y-3 text-xs leading-relaxed">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-900 font-bold text-sm">
                        {q.sentence}
                      </div>

                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-slate-800">
                        <span className="font-bold text-indigo-700 block mb-1">【正解の解説】</span>
                        {q.explanation.summary}
                        <p className="mt-1 text-slate-600">{q.explanation.whyCorrect}</p>
                      </div>

                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                        <span className="font-bold">テストの着眼点: </span>
                        {q.explanation.testAdvice}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mastered Section */}
      {masteredQuestions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>克服完了した問題 ({masteredQuestions.length}問)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            復習テストで正解してマスターした問題です！素晴らしい成長です。
          </p>

          <div className="flex flex-wrap gap-2">
            {masteredQuestions.map((q) => (
              <span
                key={q.id}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                ✓ {q.categoryName} ({q.sentence.substring(0, 10)}...)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
