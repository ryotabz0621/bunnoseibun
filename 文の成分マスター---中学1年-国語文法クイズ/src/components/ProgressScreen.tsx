import React, { useState } from 'react';
import { Award, Zap, CheckCircle2, Flame, BarChart3, HelpCircle } from 'lucide-react';
import { StudentProfile, QuizResult } from '../types/quiz';

interface ProgressScreenProps {
  profile: StudentProfile;
  history: QuizResult[];
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ profile, history }) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const overallAccuracy =
    profile.totalQuestions > 0
      ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
      : 0;

  // Chart data: Take last 10 quiz attempts in chronological order (oldest to newest)
  const chartData = [...history].slice(0, 10).reverse();
  const maxScore = Math.max(...chartData.map((d) => d.score), 10000);

  // SVG Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = chartData.map((d, idx) => {
    const x = chartData.length > 1 ? paddingX + (idx / (chartData.length - 1)) * chartW : svgWidth / 2;
    const y = paddingY + chartH - (d.score / maxScore) * chartH;
    return { x, y, ...d };
  });

  const pathD =
    points.length > 1
      ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
      : '';

  // Calculate Category Mastery
  const categoryStats: Record<string, { correct: number; total: number }> = {
    components: { correct: 0, total: 0 },
    renbunsetsu: { correct: 0, total: 0 },
    relations: { correct: 0, total: 0 },
    comprehensive: { correct: 0, total: 0 },
  };

  history.forEach((res) => {
    Object.entries(res.categoryBreakdown).forEach(([k, val]) => {
      if (categoryStats[k]) {
        categoryStats[k].correct += val.correct;
        categoryStats[k].total += val.total;
      }
    });
  });

  const categories = [
    { key: 'components', name: '主語・述語・修飾語', desc: '文の骨組みと肉付けを見分ける' },
    { key: 'renbunsetsu', name: '連文節（主部・述部・修飾部）', desc: '複数の文節がまとまった成分' },
    { key: 'relations', name: '文節相互の関係', desc: '並立・補助・修飾・接続の関係' },
    { key: 'comprehensive', name: '総合応用問題', desc: '省略された主語やハイレベル判定' },
  ];

  // Badges system
  const badges = [
    {
      id: 'first_quiz',
      name: '初陣の証',
      desc: '初めての文法クイズに挑戦した',
      unlocked: profile.totalQuizzesPlayed >= 1,
      icon: '🌱',
    },
    {
      id: 'combo_3',
      name: 'コンボの芽',
      desc: '3連続正解を達成した',
      unlocked: profile.bestCombo >= 3,
      icon: '🔥',
    },
    {
      id: 'combo_5',
      name: 'FEVERマスター',
      desc: '5連続以上の神業コンボを達成！',
      unlocked: profile.bestCombo >= 5,
      icon: '⚡',
    },
    {
      id: 'high_score',
      name: 'トップスコアラー',
      desc: '1回で7,000pt以上を獲得した',
      unlocked: profile.bestScore >= 7000,
      icon: '🏆',
    },
    {
      id: 'master_100',
      name: 'パーフェクト満点',
      desc: 'クイズで正答率100%を達成した',
      unlocked: history.some((h) => h.accuracy === 100),
      icon: '💮',
    },
    {
      id: 'review_hero',
      name: '克服の勇者',
      desc: '間違えた問題を1問以上マスターした',
      unlocked: profile.masteredQuestionIds.length >= 1,
      icon: '🛡️',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">
                学習の進捗・成長記録
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              問題を解くほどデータが蓄積され、文法の理解度とスコアの伸びがグラフで確認できます。
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 self-start sm:self-auto">
            <span className="font-semibold text-indigo-700">{profile.gradeClass}</span>
            {profile.attendanceNumber && <span className="font-medium text-slate-600">{profile.attendanceNumber}番</span>}
            <span className="font-bold text-slate-900">{profile.name}</span>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">累計解答数</span>
            <span className="text-2xl font-black text-indigo-950 tabular-nums">
              {profile.totalQuestions}
            </span>
            <span className="text-[10px] text-slate-400 block">問挑戦</span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">総合成績（正答率）</span>
            <span className="text-2xl font-black text-emerald-600 tabular-nums">
              {overallAccuracy}%
            </span>
            <span className="text-[10px] text-slate-400 block">
              {profile.totalCorrect}問正解
            </span>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">最高スコア</span>
            <span className="text-2xl font-black text-amber-600 tabular-nums">
              {profile.bestScore.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">pt</span>
          </div>

          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">最高連続コンボ</span>
            <span className="text-2xl font-black text-purple-600 tabular-nums">
              {profile.bestCombo}
            </span>
            <span className="text-[10px] text-slate-400 block">連続正解</span>
          </div>
        </div>
      </div>

      {/* Score Progress Line Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              スコア推移グラフ（直近{chartData.length}回）
            </h3>
            <span className="text-xs text-slate-400">
              日々のトレーニングによる点数の変化
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            最高: {profile.bestScore.toLocaleString()} pt
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            クイズを2回以上解くと、ここにスコア推移グラフが描画されます！
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-60 select-none">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + chartH * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      className="tabular-nums"
                    >
                      {Math.round(maxScore * ratio).toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area gradient under line */}
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`}
                fill="url(#scoreGrad)"
              />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((p, idx) => {
                const isHovered = hoveredPointIndex === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#f59e0b' : '#4f46e5'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                    <text
                      x={p.x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="600"
                    >
                      第{idx + 1}回
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2"
              >
                <span className="font-bold">第{hoveredPointIndex + 1}回</span>
                <span>スコア: {points[hoveredPointIndex].score.toLocaleString()} pt</span>
                <span className="text-emerald-300 font-semibold">
                  ({points[hoveredPointIndex].accuracy}%)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Mastery Progress Bars */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          分野別マスター度（文法単元ごとの進捗）
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          それぞれの単元の習熟度です。苦手な分野を集中的に特訓しましょう！
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const stat = categoryStats[cat.key];
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

            let badgeColor = 'bg-slate-100 text-slate-600';
            let badgeText = '未挑戦';
            if (stat.total > 0) {
              if (pct >= 85) {
                badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                badgeText = '★ マスター達成';
              } else if (pct >= 60) {
                badgeColor = 'bg-indigo-100 text-indigo-800';
                badgeText = '順調に習得中';
              } else {
                badgeColor = 'bg-amber-100 text-amber-800';
                badgeText = '要復習';
              }
            }

            return (
              <div key={cat.key} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{cat.desc}</p>

                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-slate-600">習熟度</span>
                  <span className="text-indigo-600 tabular-nums">
                    {pct}% ({stat.correct}/{stat.total}問正解)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 85 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Trophy Collection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">
              獲得バッジ＆トロフィーコレクション
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {badges.filter((b) => b.unlocked).length} / {badges.length} 獲得
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border transition-all ${
                b.unlocked
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl mb-1 select-none">{b.icon}</div>
              <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{b.desc}</p>
              <div className="mt-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    b.unlocked ? 'bg-amber-200/70 text-amber-900' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {b.unlocked ? '獲得済み！' : '未獲得'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
