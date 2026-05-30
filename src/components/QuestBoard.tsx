import { GameState } from '../types/game';

interface Props {
  state: GameState;
  compact?: boolean;
}

export default function QuestBoard({ state, compact = false }: Props) {
  const { quests, goodScore, evilScore } = state;

  return (
    <div className={`${compact ? '' : 'bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-4'}`}>
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Quest Board</h3>
          <div className="flex gap-3">
            <span className="text-blue-300 text-xs font-bold">⚔️ {goodScore}</span>
            <span className="text-red-300 text-xs font-bold">💀 {evilScore}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2">
        {quests.map((quest, i) => {
          const isCurrent = i === state.currentQuestIndex;
          const isSuccess = quest.result === 'success';
          const isFail = quest.result === 'fail';

          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 ${compact ? 'flex-1' : ''}`}
            >
              <div
                className={`${compact ? 'w-12 h-12' : 'w-14 h-14'} rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all ${
                  isSuccess
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                    : isFail
                    ? 'bg-red-700 border-red-500 text-white shadow-lg shadow-red-500/30'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-slate-800/60 border-slate-600 text-slate-400'
                }`}
              >
                {isSuccess ? '✓' : isFail ? '✗' : `Q${i + 1}`}
              </div>
              <div className="text-center">
                <p className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold ${
                  isSuccess ? 'text-blue-300' : isFail ? 'text-red-300' : isCurrent ? 'text-amber-300' : 'text-slate-500'
                }`}>
                  {quest.teamSize}👤
                </p>
                {quest.requiresTwoFails && (
                  <p className="text-[9px] text-orange-400">2✗</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-4">
          {/* Score bar */}
          <div className="flex gap-1 h-3">
            {[...Array(5)].map((_, i) => {
              const filled = i < goodScore ? 'good' : i >= 5 - evilScore ? 'evil' : 'empty';
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full ${
                    filled === 'good'
                      ? 'bg-blue-500'
                      : filled === 'evil'
                      ? 'bg-red-600'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-blue-300 text-xs">Good: {goodScore}</span>
            <span className="text-slate-400 text-xs">First to 3 wins</span>
            <span className="text-red-300 text-xs">Evil: {evilScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}
