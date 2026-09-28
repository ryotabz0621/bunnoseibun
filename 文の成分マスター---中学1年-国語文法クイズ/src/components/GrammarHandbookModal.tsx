import React, { useState } from 'react';
import { X, BookOpen, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';

interface GrammarHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarHandbookModal: React.FC<GrammarHandbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'renbunsetsu' | 'relations' | 'bunsetsu'>('components');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-stamp relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              中学1年 国語文法「文の成分」要点まとめ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection buttons */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'components'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ① 文の5大成分
          </button>
          <button
            onClick={() => setActiveTab('renbunsetsu')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'renbunsetsu'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ② 連文節（主部・述部など）
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'relations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ③ 文節相互の5つの関係
          </button>
          <button
            onClick={() => setActiveTab('bunsetsu')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'bunsetsu'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ④ 文節の区切り方
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-slate-700 flex-1">
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">
                  文の成分とは？
                </span>
                文の中でそれぞれの文節が果たしている役割（骨組みや肉付け）のことです。
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    主語（しゅご）
                  </h4>
                  <p className="text-slate-600 mb-1">「何が・だれが」にあたる言葉。</p>
                  <div className="p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    例: <strong className="text-indigo-600">小鳥が</strong> さえずる。
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    述語（じゅつご）
                  </h4>
                  <p className="text-slate-600 mb-1">「どうする・どんなだ・何だ・ある」を表し、文末に来る。</p>
                  <div className="p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    例: 空が <strong className="text-indigo-600">青い。</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                  <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    修飾語（しゅうしょくご）
                  </h4>
                  <p className="text-slate-600 mb-2">他の文節をくわしく説明する言葉。2つのタイプがあります：</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded border border-slate-100">
                      <span className="font-bold text-amber-700 block">連体修飾語（体言＝名詞を修飾）</span>
                      「どんな・何の＋名詞」<br />
                      例: <strong className="text-amber-600">赤い</strong> リンゴ、<strong className="text-amber-600">昨日の</strong> 天気
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-100">
                      <span className="font-bold text-emerald-700 block">連用修飾語（用言＝動詞などを修飾）</span>
                      「いつ・どこで・どのように＋動詞」<br />
                      例: <strong className="text-emerald-600">元気に</strong> 走る、<strong className="text-emerald-600">明日</strong> 会う
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    接続語（せつぞくご）
                  </h4>
                  <p className="text-slate-600 mb-1">前後の文節や文をつなぐ言葉。</p>
                  <div className="p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    例: 雨が降った。<strong className="text-indigo-600">だから</strong> 傘をさす。
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    独立語（どくりつご）
                  </h4>
                  <p className="text-slate-600 mb-1">他の文節と直接係らない言葉（感動・呼びかけ・応答・提示）。</p>
                  <div className="p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    例: <strong className="text-indigo-600">ああ、</strong> 美しい富士山だ。
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'renbunsetsu' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">
                  連文節（れんぶんせつ）とは？
                </span>
                2つ以上の文節が合わさって、1つの文の成分の働きをするまとまりのことです。
                末尾に「部」をつけて呼びます。
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">① 主部（しゅぶ）</span>
                  <p className="text-slate-600 mt-0.5">2文節以上で「何が・だれが」を表す主語のまとまり。</p>
                  <div className="mt-1.5 p-2 bg-white rounded border border-slate-100 font-mono">
                    例: <u className="font-bold text-indigo-600">白い 子猫が</u> 眠っている。
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">② 述部（じゅつぶ）</span>
                  <p className="text-slate-600 mt-0.5">2文節以上で述語の働きをするまとまり（文末の「〜になる」「〜てみる」など）。</p>
                  <div className="mt-1.5 p-2 bg-white rounded border border-slate-100 font-mono">
                    例: 空が <u className="font-bold text-indigo-600">暗く なってきた。</u>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">③ 修飾部（しゅうしょくぶ）</span>
                  <p className="text-slate-600 mt-0.5">2文節以上で他の言葉をくわしく説明するまとまり。</p>
                  <div className="mt-1.5 p-2 bg-white rounded border border-slate-100 font-mono">
                    例: <u className="font-bold text-indigo-600">とても 熱心に</u> 話を聞く。
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">④ 接続部 / 独立部</span>
                  <p className="text-slate-600 mt-0.5">2文節以上で接続語・独立語の働きをするもの。</p>
                  <div className="mt-1.5 p-2 bg-white rounded border border-slate-100 font-mono">
                    例: <u className="font-bold text-indigo-600">そればかりか、</u> 風も強い。 / <u className="font-bold text-indigo-600">おい みんな、</u> 集合だ。
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">
                  文節相互の5つの関係
                </span>
                文節同士がどんな関係で結びついているかを見極める問題は、中学定期テストの大本命です！
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">1. 主語・述語の関係</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">基本骨組み</span>
                  </div>
                  <p className="text-slate-600">「何が」と「どうする」の骨組み。</p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    「花が」⇄「咲く」
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">2. 修飾・被修飾の関係</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">矢印のかかり受け</span>
                  </div>
                  <p className="text-slate-600">修飾語（説明する側）と被修飾語（説明される側）。</p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    「速く」→「走る」、「青い」→「海」
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">3. 並立の関係（へいりつ）</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">入れ替えOK!</span>
                  </div>
                  <p className="text-slate-600">対等の資格で並んでいる関係。前後をひっくり返しても意味が通じます！</p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    「兄と」「弟」＝「弟と」「兄」
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">4. 補助の関係（ほじょ）</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">〜て（で）＋補助動詞</span>
                  </div>
                  <p className="text-slate-600">
                    上の文節（本動詞）に下の文節が補助的な意味を添える関係。
                  </p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    「読んで」＋「いる」、「走って」＋「みる」、「教えて」＋「くれた」
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">5. 接続の関係</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">原因・理由など</span>
                  </div>
                  <p className="text-slate-600">接続助詞（〜ので、〜から、〜けれど）で前後の条件をつなぐ。</p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-100 font-mono text-[11px]">
                    「雨が降ったので、」→「遠足が中止だ。」
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bunsetsu' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">
                  文節の区切り方テクニック
                </span>
                文を、言葉の意味を壊さないでできるだけ小さく分けた単位が「文節」です。
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">
                  魔法の合言葉「ネ」「サ」「ヨ」を挟む！
                </h4>
                <p className="text-slate-600">
                  声に出して読んだとき、間に「ね」や「さ」を入れて自然なところで区切ることができます。
                </p>

                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs">
                  青い（ね）空に（ね）白い（ね）雲が（ね）浮かぶ（ね）
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-1">⚠️ 注意ポイント</span>
                  単語レベルまで細かく分解しすぎないこと！（例:「空に」は1つの文節です。「空」と「に」に分けるのは単語の区切りになります）
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
