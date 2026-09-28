import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, ArrowRight, CheckCircle2, XCircle, Info, Lightbulb } from 'lucide-react';
import { Question, QuizAttempt } from '../types/quiz';
import { soundManager } from '../services/sound';

interface QuizScreenProps {
  questions: Question[];
  categoryTitle: string;
  onFinishQuiz: (attempts: QuizAttempt[]) => void;
  onExitQuiz: () => void;
}

const QUESTION_TIME_LIMIT = 25; // seconds per question

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  categoryTitle,
  onFinishQuiz,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // User input states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedBunsetsuIndices, setSelectedBunsetsuIndices] = useState<number[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Combo & Score stats in current session
  const [combo, setCombo] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const currentQ = questions[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);
  const attemptsRef = useRef<QuizAttempt[]>([]);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  // Keep attempts ref in sync with state
  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);

  // Setup timer per question
  useEffect(() => {
    isTransitioningRef.current = false;
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsTimerRunning(true);
    setSelectedOption(null);
    setSelectedBunsetsuIndices([]);
    setHasAnswered(false);
    setIsCorrect(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time out - handle as incorrect
          handleTimeOut();
          return 0;
        }
        if (prev <= 5 && prev > 1) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  // Auto-focus next button and ensure explanation is in view when answered
  useEffect(() => {
    if (hasAnswered) {
      const timer = setTimeout(() => {
        nextButtonRef.current?.focus({ preventScroll: true });
        nextButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [hasAnswered]);

  // Keyboard shortcut listener (Enter for next question / submit, 1-4 for multiple choice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const isEnter = e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === 'NumpadEnter';

      if (hasAnswered) {
        if (isEnter) {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
        }
        return;
      }

      // If in bunsetsu_select mode and user has chosen at least one bunsetsu
      if (currentQ.questionType === 'bunsetsu_select') {
        if (isEnter && selectedBunsetsuIndices.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          handleSubmitBunsetsuSelection();
        }
        return;
      }

      // If multiple choice
      if (currentQ.questionType === 'multiple_choice' || currentQ.questionType === 'relation_choice') {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= (currentQ.options?.length || 4)) {
          e.preventDefault();
          handleSelectOption(keyNum - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, currentQ, currentIndex, selectedBunsetsuIndices]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setIsTimerRunning(false);
    setHasAnswered(true);
    setIsCorrect(false);
    setCombo(0);
    soundManager.playWrong();

    const attempt: QuizAttempt = {
      questionId: currentQ.id,
      selectedOptionIndex: -1,
      isCorrect: false,
      timeSpentSec: QUESTION_TIME_LIMIT,
      scoreEarned: 0,
      comboAtAnswer: 0,
    };
    setAttempts((prev) => [...prev, attempt]);
  };

  const calculateScore = (timeRemaining: number, currentCombo: number) => {
    const basePoints = 1000;
    // Speed bonus: up to 500 extra points for fast answers
    const speedBonus = Math.round((timeRemaining / QUESTION_TIME_LIMIT) * 500);
    // Combo multiplier
    let multiplier = 1.0;
    if (currentCombo === 1) multiplier = 1.2;
    else if (currentCombo === 2) multiplier = 1.4;
    else if (currentCombo === 3) multiplier = 1.6;
    else if (currentCombo >= 4) multiplier = 2.0;

    return Math.round((basePoints + speedBonus) * multiplier);
  };

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setSelectedOption(index);
    setHasAnswered(true);

    const correct = index === currentQ.correctOptionIndex;
    setIsCorrect(correct);

    const timeSpent = QUESTION_TIME_LIMIT - timeLeft;
    let earned = 0;
    let nextCombo = 0;

    if (correct) {
      nextCombo = combo + 1;
      setCombo(nextCombo);
      earned = calculateScore(timeLeft, combo);
      setTotalScore((prev) => prev + earned);

      // Sound & visuals
      if (nextCombo >= 3) {
        soundManager.playCombo(nextCombo);
      } else {
        soundManager.playCorrect();
      }

      confetti({
        particleCount: nextCombo >= 3 ? 50 : 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      });
    } else {
      setCombo(0);
      soundManager.playWrong();
    }

    const attempt: QuizAttempt = {
      questionId: currentQ.id,
      selectedOptionIndex: index,
      isCorrect: correct,
      timeSpentSec: timeSpent,
      scoreEarned: earned,
      comboAtAnswer: nextCombo,
    };
    setAttempts((prev) => [...prev, attempt]);
  };

  const handleToggleBunsetsu = (index: number) => {
    if (hasAnswered) return;
    setSelectedBunsetsuIndices((prev) => {
      const exists = prev.includes(index);
      if (exists) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  const handleSubmitBunsetsuSelection = () => {
    if (hasAnswered || selectedBunsetsuIndices.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setHasAnswered(true);

    const target = currentQ.targetBunsetsuIndices || [];
    const correct =
      selectedBunsetsuIndices.length === target.length &&
      selectedBunsetsuIndices.every((idx) => target.includes(idx));

    setIsCorrect(correct);

    const timeSpent = QUESTION_TIME_LIMIT - timeLeft;
    let earned = 0;
    let nextCombo = 0;

    if (correct) {
      nextCombo = combo + 1;
      setCombo(nextCombo);
      earned = calculateScore(timeLeft, combo);
      setTotalScore((prev) => prev + earned);

      if (nextCombo >= 3) {
        soundManager.playCombo(nextCombo);
      } else {
        soundManager.playCorrect();
      }

      confetti({
        particleCount: nextCombo >= 3 ? 50 : 25,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      setCombo(0);
      soundManager.playWrong();
    }

    const attempt: QuizAttempt = {
      questionId: currentQ.id,
      selectedBunsetsuIndices: [...selectedBunsetsuIndices],
      isCorrect: correct,
      timeSpentSec: timeSpent,
      scoreEarned: earned,
      comboAtAnswer: nextCombo,
    };
    setAttempts((prev) => [...prev, attempt]);
  };

  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    if (currentIndex + 1 < questions.length) {
      // Cleanly clear state before mounting next question
      setSelectedOption(null);
      setSelectedBunsetsuIndices([]);
      setHasAnswered(false);
      setIsCorrect(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      setIsTimerRunning(true);
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onFinishQuiz(attemptsRef.current);
    }
  };

  // Combo multiplier label
  const getMultiplierLabel = (c: number) => {
    if (c >= 4) return '2.0倍 FEVER!!';
    if (c === 3) return '1.6倍 大ボーナス!';
    if (c === 2) return '1.4倍 ボーナス!';
    if (c === 1) return '1.2倍!';
    return '1.0倍';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Status Bar: Progress, Combo, Score, Exit */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
              {categoryTitle}
            </span>
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              第 {currentIndex + 1} 問 / 全 {questions.length} 問
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Combo indicator with animation */}
            {combo > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-fever">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{combo} 連続正解!</span>
                <span className="text-amber-700 font-extrabold">({getMultiplierLabel(combo)})</span>
              </div>
            )}

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium mr-1.5">スコア</span>
              <span className="text-sm font-extrabold text-slate-800 tabular-nums">
                {totalScore.toLocaleString()} pt
              </span>
            </div>

            <button
              onClick={onExitQuiz}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              中断
            </button>
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft <= 5
                ? 'bg-rose-500 animate-pulse'
                : timeLeft <= 10
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock className={`w-3 h-3 ${timeLeft <= 5 ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
            残り時間
          </span>
          <span className={`tabular-nums font-bold ${timeLeft <= 5 ? 'text-rose-600' : 'text-slate-600'}`}>
            {timeLeft} 秒
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
        {/* Answer Stamp Overlay */}
        {hasAnswered && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none z-20">
            {isCorrect ? (
              <div className="animate-stamp flex flex-col items-center justify-center p-3 rounded-2xl border-4 border-rose-500 bg-rose-50/90 text-rose-600 shadow-xl rotate-[-8deg]">
                <span className="text-xl sm:text-2xl font-black tracking-wider">
                  たいへんよくできました！
                </span>
                <span className="text-xs font-bold text-rose-500 mt-0.5">💮 満点回答！</span>
              </div>
            ) : (
              <div className="animate-stamp flex flex-col items-center justify-center p-3 rounded-2xl border-4 border-amber-500 bg-amber-50/90 text-amber-700 shadow-xl rotate-[4deg]">
                <span className="text-lg sm:text-xl font-black">
                  {timeLeft === 0 ? '時間切れ！' : 'おしい！'}
                </span>
                <span className="text-xs font-bold text-amber-600 mt-0.5">解説で確認しよう！</span>
              </div>
            )}
          </div>
        )}

        {/* Question Header & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-indigo-600 tracking-wider">
              QUESTION {currentIndex + 1}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                currentQ.difficulty === 1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentQ.difficulty === 2
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {currentQ.difficulty === 1 ? '初級 ★☆☆' : currentQ.difficulty === 2 ? '中級 ★★☆' : '上級 ★★★'}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {currentQ.categoryName}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* Japanese Sentence Container */}
        {currentQ.sentence && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-6 mb-6">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <span>対象の文</span>
              {currentQ.questionType === 'bunsetsu_select' && (
                <span className="text-indigo-600">（当てはまる文節をタップして選んでね）</span>
              )}
            </div>

            {/* If Bunsetsu Select Type: Interactive clickable clauses */}
            {currentQ.questionType === 'bunsetsu_select' ? (
              <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                {currentQ.bunsetsuList.map((bun, idx) => {
                  const isSelected = selectedBunsetsuIndices.includes(idx);
                  const isTarget = currentQ.targetBunsetsuIndices?.includes(idx);

                  let borderClass = 'border-slate-300 bg-white hover:border-indigo-400 text-slate-800';
                  if (hasAnswered) {
                    if (isTarget) {
                      borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected && !isTarget) {
                      borderClass = 'border-rose-400 bg-rose-50 text-rose-800 line-through';
                    } else {
                      borderClass = 'border-slate-200 bg-slate-100 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-md';
                  }

                  return (
                    <button
                      key={bun.id}
                      onClick={() => handleToggleBunsetsu(idx)}
                      disabled={hasAnswered}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer select-none flex items-center gap-1 ${borderClass}`}
                    >
                      <span>{bun.text}</span>
                      <span className="text-[11px] font-normal opacity-70">ね</span>
                    </button>
                  );
                })}
              </div>
            ) : currentQ.questionType === 'relation_choice' && currentQ.relationPair ? (
              /* Relation Choice: Highlighted pair ① and ② */
              <div className="text-base sm:text-lg leading-relaxed text-slate-800">
                {currentQ.bunsetsuList.map((bun, idx) => {
                  const isFirst = idx === currentQ.relationPair?.fromIndex;
                  const isSecond = idx === currentQ.relationPair?.toIndex;

                  if (isFirst) {
                    return (
                      <span
                        key={bun.id}
                        className="inline-block px-1.5 py-0.5 mx-1 font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                      >
                        ① {bun.text}
                      </span>
                    );
                  }
                  if (isSecond) {
                    return (
                      <span
                        key={bun.id}
                        className="inline-block px-1.5 py-0.5 mx-1 font-bold rounded bg-blue-100 text-blue-900 border border-blue-300 shadow-xs"
                      >
                        ② {bun.text}
                      </span>
                    );
                  }
                  return <span key={bun.id} className="mx-0.5">{bun.text}</span>;
                })}
              </div>
            ) : (
              /* Standard Multiple Choice: Highlight target phrase */
              <div className="text-base sm:text-lg leading-relaxed text-slate-800">
                {currentQ.bunsetsuList.map((bun) => {
                  if (bun.isTarget) {
                    return (
                      <span
                        key={bun.id}
                        className="inline-block font-extrabold text-indigo-700 bg-indigo-100/90 border-b-2 border-indigo-600 px-1.5 py-0.5 rounded-t mx-0.5"
                      >
                        {bun.text}
                      </span>
                    );
                  }
                  return <span key={bun.id} className="mx-0.5">{bun.text}</span>;
                })}
              </div>
            )}
          </div>
        )}

        {/* Options Selection Area */}
        {currentQ.questionType === 'bunsetsu_select' ? (
          <div>
            {!hasAnswered && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500">
                  選択中: {selectedBunsetsuIndices.length} 文節
                </span>
                <button
                  onClick={handleSubmitBunsetsuSelection}
                  disabled={selectedBunsetsuIndices.length === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                    selectedBunsetsuIndices.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>この文節で決定する！</span>
                  {selectedBunsetsuIndices.length > 0 && (
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white border border-white/30">
                      Enter ↵
                    </kbd>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentQ.correctOptionIndex;

              let btnStyle = 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800';

              if (hasAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold line-through';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all cursor-pointer select-none ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-semibold">{opt}</span>
                  </div>

                  {hasAnswered && (
                    <div>
                      {isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-rose-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* In-depth Explanation Panel (Visible immediately after answering) */}
      {hasAnswered && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5 animate-stamp">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">くわしい解説と見分け方のコツ</h3>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isCorrect ? '正解！' : '不正解'}
            </span>
          </div>

          {/* Core Summary */}
          <div className="text-sm text-slate-700 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 leading-relaxed font-medium">
            {currentQ.explanation.summary}
          </div>

          {/* Why Correct explanation */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-1.5">【なぜそうなるの？】</h4>
            <p className="text-sm text-slate-800 leading-relaxed">
              {currentQ.explanation.whyCorrect}
            </p>
          </div>

          {/* Bunsetsu Breakdown Table / List */}
          {currentQ.explanation.breakdown && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-2">【文節ごとの働きと成分】</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentQ.explanation.breakdown.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 shrink-0 min-w-[70px]">
                      {item.bunsetsu}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-700">{item.role}</span>
                      {item.hint && <span className="text-slate-500 text-[11px]">{item.hint}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependency Diagram if present */}
          {currentQ.explanation.diagram && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/70">
              <h4 className="text-xs font-bold text-amber-800 mb-2">【係り受け・相互関係の図解】</h4>
              <div className="flex items-center justify-center gap-3 py-2 text-xs font-bold">
                <span className="px-2.5 py-1 bg-white rounded border border-amber-300 text-slate-800 shadow-xs">
                  {currentQ.explanation.diagram.from}
                </span>
                <span className="text-amber-600 flex items-center gap-1 font-semibold">
                  <ArrowRight className="w-4 h-4" />
                  {currentQ.explanation.diagram.relationLabel}
                </span>
                <span className="px-2.5 py-1 bg-white rounded border border-amber-300 text-slate-800 shadow-xs">
                  {currentQ.explanation.diagram.to}
                </span>
              </div>
              <p className="text-[11px] text-amber-900/90 text-center mt-1">
                {currentQ.explanation.diagram.description}
              </p>
            </div>
          )}

          {/* Test Advice Memo */}
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 leading-relaxed">
              <span className="font-bold block text-emerald-800 mb-0.5">
                🦉 ふくろう先生の定期テスト攻略ポイント
              </span>
              {currentQ.explanation.testAdvice}
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[11px] shadow-xs">
                Enter ↵
              </span>
              <span>キーを押しても次の問題に進めます</span>
            </div>
            <button
              ref={nextButtonRef}
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-indigo-200 ring-2 ring-indigo-300 ring-offset-2"
            >
              <span>{currentIndex + 1 < questions.length ? '次の問題へ進む' : '結果を見る'}</span>
              <kbd className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/30 shadow-xs">
                <span>Enter</span>
                <span className="text-base leading-none">↵</span>
              </kbd>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating keyboard hint pill for quick Enter feedback */}
      {hasAnswered && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-slate-900/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 border border-slate-700 animate-bounce">
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono text-[11px] font-bold border border-white/30">
              Enter ↵
            </kbd>
            <span>キーで次の問題へ進めます</span>
          </div>
        </div>
      )}
    </div>
  );
};
