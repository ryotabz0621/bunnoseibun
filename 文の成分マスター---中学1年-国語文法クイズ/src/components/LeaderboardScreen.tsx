import React, { useState } from 'react';
import { Trophy, Medal, Users, Sparkles, TrendingUp } from 'lucide-react';
import { StudentProfile, LeaderboardEntry } from '../types/quiz';
import { AVATARS } from '../services/storage';

interface LeaderboardScreenProps {
  profile: StudentProfile;
  leaderboard: LeaderboardEntry[];
  onStartQuiz: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  profile,
  leaderboard,
  onStartQuiz,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'class'>('all');

  const filteredList =
    filterMode === 'class'
      ? leaderboard.filter((entry) => entry.gradeClass === profile.gradeClass)
      : leaderboard;

  // Find user's index in the filtered list
  const userRankIndex = filteredList.findIndex(
    (e) => e.isCurrentUser || e.id === profile.id || e.studentName === profile.name
  );
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
  const userEntry = userRankIndex >= 0 ? filteredList[userRankIndex] : null;

  // Next target player to overtake
  const nextTarget = userRankIndex > 0 ? filteredList[userRankIndex - 1] : null;
  const pointsToOvertake =
    userEntry && nextTarget ? nextTarget.score - userEntry.score + 1 : 0;

  const getAvatarEmoji = (avatarId: string) => {
    return AVATARS.find((a) => a.id === avatarId)?.emoji || '🐱';
  };

  const top3 = filteredList.slice(0, 3);
  const restList = filteredList.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900">
                学年文法スコアランキング
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              中学1年生のライバルたちとスコアを競い合い、トップマスターを目指そう！
            </p>
          </div>

          {/* Filter Tabs (Interactive filter tab buttons) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              学年全体
            </button>
            <button
              onClick={() => setFilterMode('class')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterMode === 'class'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              自分のクラス ({profile.gradeClass})
            </button>
          </div>
        </div>

        {/* User Rank Card Highlight */}
        {userRank !== null && userEntry ? (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-indigo-200">
                <span className="text-[10px] uppercase font-bold tracking-wider">RANK</span>
                <span className="text-lg leading-none">{userRank}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg select-none">{getAvatarEmoji(userEntry.avatarId)}</span>
                  <span className="text-sm font-bold text-slate-900">{userEntry.studentName}（あなた）</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white text-indigo-600 font-semibold border border-indigo-100">
                    {userEntry.gradeClass}
                    {userEntry.attendanceNumber ? ` ${userEntry.attendanceNumber}番` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>ハイスコア: <strong className="text-indigo-600">{userEntry.score.toLocaleString()}</strong> pt</span>
                  <span>正答率: <strong>{userEntry.accuracy}%</strong></span>
                  <span>最高コンボ: <strong>{userEntry.maxCombo}連勝</strong></span>
                </div>
              </div>
            </div>

            {nextTarget && pointsToOvertake > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-indigo-100 text-xs text-slate-600 shadow-xs">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>
                  あと <strong className="text-indigo-600 font-bold">{pointsToOvertake.toLocaleString()} pt</strong> で
                  「{nextTarget.studentName}」さんを抜いて <strong>第{userRank - 1}位</strong> に浮上！
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 mb-2">
              まだランキングに記録がありません。クイズを解いてランキングに自分の名前を載せよう！
            </p>
            <button
              onClick={onStartQuiz}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              クイズに挑戦する
            </button>
          </div>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {top3.map((entry, idx) => {
          const rankColors = [
            { bg: 'from-amber-100 to-amber-50 border-amber-300 text-amber-900', badge: '🥇 1位', crown: '👑' },
            { bg: 'from-slate-100 to-slate-50 border-slate-300 text-slate-800', badge: '🥈 2位', crown: '⭐' },
            { bg: 'from-orange-100 to-orange-50 border-orange-200 text-orange-900', badge: '🥉 3位', crown: '✨' },
          ][idx];

          const isCurrent = entry.isCurrentUser || entry.id === profile.id;

          return (
            <div
              key={entry.id}
              className={`p-5 rounded-2xl border-2 bg-gradient-to-b ${rankColors.bg} relative text-center shadow-xs ${
                isCurrent ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="absolute top-3 right-3 text-lg select-none">
                {rankColors.crown}
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/80 shadow-xs inline-block mb-2">
                {rankColors.badge}
              </span>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm my-1 select-none">
                {getAvatarEmoji(entry.avatarId)}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2 truncate">
                {entry.studentName} {isCurrent && <span className="text-xs text-indigo-600 font-bold">（あなた）</span>}
              </h4>
              <span className="text-xs text-slate-500 block">
                {entry.gradeClass}
                {entry.attendanceNumber ? ` ${entry.attendanceNumber}番` : ''}
              </span>
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <span className="text-xs text-slate-500 block">スコア</span>
                <span className="text-2xl font-black text-indigo-900 tabular-nums">
                  {entry.score.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-normal"> pt</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>順位一覧（{filteredList.length}名登録中）</span>
          </h3>
          <span className="text-xs text-slate-400">リアルタイム更新</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-bold text-center w-14">順位</th>
                <th className="py-3 px-4 font-bold">生徒名</th>
                <th className="py-3 px-4 font-bold">クラス / 出席番号</th>
                <th className="py-3 px-4 font-bold text-right">スコア</th>
                <th className="py-3 px-4 font-bold text-center">正答率</th>
                <th className="py-3 px-4 font-bold text-center">最大コンボ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((entry, idx) => {
                const isCurrent = entry.isCurrentUser || entry.id === profile.id;
                const rankNum = idx + 1;

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-indigo-50/70 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      {rankNum === 1 ? (
                        <span className="text-base">🥇</span>
                      ) : rankNum === 2 ? (
                        <span className="text-base">🥈</span>
                      ) : rankNum === 3 ? (
                        <span className="text-base">🥉</span>
                      ) : (
                        <span className="text-slate-500 font-bold tabular-nums">{rankNum}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{getAvatarEmoji(entry.avatarId)}</span>
                        <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                          {entry.studentName}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {entry.gradeClass}
                      {entry.attendanceNumber ? ` ${entry.attendanceNumber}番` : ''}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-700 tabular-nums">
                      {entry.score.toLocaleString()} pt
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 tabular-nums font-medium">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3 px-4 text-center text-amber-600 tabular-nums font-bold">
                      {entry.maxCombo} 連勝
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
