import React, { useState, useEffect } from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { StudentProfile } from '../types/quiz';
import { AVATARS, storage } from '../services/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(profile.name);
  const [gradeClass, setGradeClass] = useState(profile.gradeClass);
  const [attendanceNumber, setAttendanceNumber] = useState<number | ''>(
    profile.attendanceNumber ?? ''
  );
  const [avatarId, setAvatarId] = useState(profile.avatarId);

  useEffect(() => {
    setName(profile.name);
    setGradeClass(profile.gradeClass);
    setAttendanceNumber(profile.attendanceNumber ?? '');
    setAvatarId(profile.avatarId);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = attendanceNumber === '' ? undefined : Number(attendanceNumber);
    const updated = storage.updateProfileNameAndClass(name, gradeClass, avatarId, num);
    onProfileUpdated(updated);
    onClose();
  };

  const handleCreateNewStudent = () => {
    const defaultName = `生徒_${Math.floor(100 + Math.random() * 900)}`;
    const randomNum = Math.floor(1 + Math.random() * 35);
    const newProfile: StudentProfile = {
      id: 'student_' + Math.random().toString(36).substring(2, 9),
      name: defaultName,
      gradeClass: '1年1組',
      attendanceNumber: randomNum,
      avatarId: 'rabbit',
      createdAt: new Date().toISOString(),
      totalQuizzesPlayed: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestCombo: 0,
      wrongQuestionIds: [],
      masteredQuestionIds: [],
    };
    storage.saveProfile(newProfile);
    onProfileUpdated(newProfile);
    setName(defaultName);
    setGradeClass('1年1組');
    setAttendanceNumber(randomNum);
    setAvatarId('rabbit');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-stamp relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          生徒ログイン＆プロフィール設定
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          名前・クラス・出席番号を設定すると、学年ランキングや結果画面に反映されます！
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              アバター相棒を選択
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => {
                const isSelected = avatarId === av.id;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatarId(av.id)}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl select-none">{av.emoji}</span>
                    <span className="text-[10px] text-slate-600 mt-1 font-medium truncate w-full text-center">
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ニックネーム / 氏名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: たくみ、国語マスター"
              maxLength={12}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              ※ ランキングや解答記録に表示される名前です（最大12文字）
            </span>
          </div>

          {/* Grade Class Selection & Attendance Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                クラス <span className="text-rose-500">*</span>
              </label>
              <select
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold bg-white cursor-pointer"
              >
                <optgroup label="中学1年生">
                  <option value="1年1組">1年1組</option>
                  <option value="1年2組">1年2組</option>
                  <option value="1年3組">1年3組</option>
                  <option value="1年4組">1年4組</option>
                  <option value="1年5組">1年5組</option>
                  <option value="1年6組">1年6組</option>
                </optgroup>
                <optgroup label="中学2年生（復習）">
                  <option value="2年1組">2年1組</option>
                  <option value="2年2組">2年2組</option>
                  <option value="2年3組">2年3組</option>
                  <option value="2年4組">2年4組</option>
                  <option value="2年5組">2年5組</option>
                  <option value="2年6組">2年6組</option>
                </optgroup>
                <optgroup label="中学3年生（復習・入試）">
                  <option value="3年1組">3年1組</option>
                  <option value="3年2組">3年2組</option>
                  <option value="3年3組">3年3組</option>
                  <option value="3年4組">3年4組</option>
                  <option value="3年5組">3年5組</option>
                  <option value="3年6組">3年6組</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                出席番号 <span className="text-slate-400 font-normal">（任意）</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={attendanceNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setAttendanceNumber('');
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setAttendanceNumber(Math.max(1, Math.min(60, parsed)));
                      }
                    }
                  }}
                  placeholder="例: 15"
                  className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-500 select-none pointer-events-none">
                  番
                </span>
              </div>
            </div>
          </div>

          {/* Stats Summary for current account */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800">挑戦回数:</span> {profile.totalQuizzesPlayed} 回
            </div>
            <div>
              <span className="font-bold text-slate-800">最高得点:</span>{' '}
              <span className="text-indigo-600 font-bold">{profile.bestScore.toLocaleString()} pt</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">最高コンボ:</span> {profile.bestCombo} 連勝
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>変更を保存する</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewStudent}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>新しい生徒アカウントでログイン / 切り替え</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
