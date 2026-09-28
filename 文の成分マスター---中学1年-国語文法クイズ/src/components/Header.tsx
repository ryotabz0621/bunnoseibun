import React from 'react';
import { Volume2, VolumeX, User, BookOpen } from 'lucide-react';
import { soundManager } from '../services/sound';
import { StudentProfile } from '../types/quiz';
import { AVATARS } from '../services/storage';

interface HeaderProps {
  currentTab: 'quiz' | 'review' | 'ranking' | 'progress';
  onSelectTab: (tab: 'quiz' | 'review' | 'ranking' | 'progress') => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  onOpenHandbook: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlayingQuiz: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onOpenProfile,
  onOpenHandbook,
  isMuted,
  onToggleMute,
  isPlayingQuiz,
}) => {
  const currentAvatar = AVATARS.find((a) => a.id === profile.avatarId) || AVATARS[0];
  const wrongCount = profile.wrongQuestionIds.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single Wordmark Brand */}
        <button
          onClick={() => onSelectTab('quiz')}
          className="text-left group flex items-center gap-2 cursor-pointer focus-visible:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-indigo-950 group-hover:text-indigo-600 transition-colors">
            文の成分マスター
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
            中1国語
          </span>
        </button>

        {/* Zone 2: Clean 4-5 Text Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('quiz')}
            disabled={isPlayingQuiz}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'quiz'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            クイズ挑戦
          </button>

          <button
            onClick={() => onSelectTab('review')}
            disabled={isPlayingQuiz}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer relative ${
              currentTab === 'review'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            間違い復習
            {wrongCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold text-rose-600 bg-rose-100 rounded-full">
                {wrongCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('ranking')}
            disabled={isPlayingQuiz}
            className={`hidden md:block px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'ranking'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            学年ランキング
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            disabled={isPlayingQuiz}
            className={`hidden sm:block px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'progress'
                ? 'text-indigo-600 font-bold bg-indigo-50/80'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            成長グラフ
          </button>

          <button
            onClick={onOpenHandbook}
            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2 py-1.5 transition-colors whitespace-nowrap cursor-pointer"
            title="文法要点まとめ"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline">要点まとめ</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions (Sound + Student Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'サウンドをオンにする' : 'サウンドをミュートにする'}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Student Profile Quick View / Switch */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors cursor-pointer text-left"
            title="プロフィール設定・生徒ログイン"
          >
            <span className="text-base select-none">{currentAvatar.emoji}</span>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                {profile.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
                {profile.gradeClass}{profile.attendanceNumber ? ` ${profile.attendanceNumber}番` : ''}
              </span>
            </div>
            <User className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};
