import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';

export default function QuestResultScreen() {
  const { gameState, isHost, hostAction } = useGame();
  if (!gameState) return null;

  const quest = gameState.quests[gameState.currentQuestIndex];
  const result = quest.result;
  const isSuccess = result === 'success';

  const failCount = Object.values(quest.questVotes).filter(v => v === 'fail').length;
  const successCount = Object.values(quest.questVotes).filter(v => v === 'success').length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <p className="text-indigo-300 text-xs uppercase tracking-wider text-center">Quest {gameState.currentQuestIndex + 1}</p>
        <h2 className="text-white font-bold text-center">Quest Result</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestBoard state={gameState} />

        {/* Result banner */}
        <div className={`rounded-2xl p-6 text-center border shadow-2xl ${
          isSuccess
            ? 'bg-blue-900/30 border-blue-700/40 shadow-blue-500/10'
            : 'bg-red-900/30 border-red-700/40 shadow-red-500/10'
        }`}>
          <div className="text-6xl mb-3">{isSuccess ? '⚔️' : '💀'}</div>
          <h3 className={`text-3xl font-bold mb-1 ${isSuccess ? 'text-blue-200' : 'text-red-200'}`}>
            Quest {isSuccess ? 'Succeeded!' : 'Failed!'}
          </h3>
          <p className="text-slate-400 text-sm">
            {successCount} success · {failCount} fail
          </p>
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 text-center">
            <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Good</p>
            <p className="text-blue-200 text-3xl font-bold">{gameState.goodScore}</p>
          </div>
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 text-center">
            <p className="text-red-300 text-xs uppercase tracking-wider mb-1">Evil</p>
            <p className="text-red-200 text-3xl font-bold">{gameState.evilScore}</p>
          </div>
        </div>

        {/* Quest team members */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
          <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2">Quest Team</p>
          <div className="flex flex-wrap gap-2">
            {quest.team.map(pid => {
              const p = gameState.players.find(pl => pl.id === pid);
              if (!p) return null;
              return (
                <div key={pid} className="flex items-center gap-1.5 bg-slate-700/40 px-3 py-1.5 rounded-xl">
                  <span>{p.avatar}</span>
                  <span className="text-white text-sm">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next game status */}
        {gameState.winner === 'good' && (
          <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-4 text-center">
            <p className="text-blue-200 text-sm font-semibold">⚔️ Good has 3 victories!</p>
            <p className="text-slate-400 text-xs mt-1">Evil gets one last chance to assassinate Merlin…</p>
          </div>
        )}
        {gameState.winner === 'evil' && (
          <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-center">
            <p className="text-red-200 text-sm font-semibold">💀 Evil has 3 failures!</p>
          </div>
        )}

        {isHost && (
          <button
            onClick={() => hostAction('NEXT_PHASE')}
            className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20 mb-4"
          >
            Continue →
          </button>
        )}
        {!isHost && (
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center mb-4">
            <p className="text-indigo-300 text-sm">⏳ Waiting for host to continue…</p>
          </div>
        )}
      </div>
    </div>
  );
}
