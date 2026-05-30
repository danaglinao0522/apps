import { useGame } from '../context/GameContext';
import { CHARACTER_ICONS } from '../data/characters';
import { CharacterName } from '../types/game';

export default function GameOverScreen() {
  const { gameState, leaveRoom } = useGame();
  if (!gameState) return null;

  const winner = gameState.winner;
  const isGoodWin = winner === 'good';

  const merlin = gameState.players.find(p => p.character === 'Merlin');
  const assassinated = gameState.players.find(p => p.id === gameState.assassinTarget);
  const assassinGotMerlin = assassinated?.character === 'Merlin';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className={`border-b px-4 py-4 text-center ${isGoodWin ? 'bg-blue-950/60 border-blue-900/50' : 'bg-red-950/60 border-red-900/50'}`}>
        <div className="text-5xl mb-1">{isGoodWin ? '🏆' : '💀'}</div>
        <h1 className={`text-2xl font-bold ${isGoodWin ? 'text-blue-200' : 'text-red-200'}`}>
          {isGoodWin ? 'Good Triumphs!' : 'Evil Prevails!'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {isGoodWin
            ? assassinated
              ? `Evil assassinated ${assassinated.name} — but it wasn't Merlin!`
              : 'Good completed 3 quests!'
            : gameState.voteTrack >= 5
            ? '5 teams were rejected — Evil wins!'
            : assassinGotMerlin
            ? 'Merlin was assassinated!'
            : 'Evil sabotaged 3 quests!'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Score */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-4 text-center border ${isGoodWin ? 'bg-blue-600/20 border-blue-500/40' : 'bg-blue-900/10 border-blue-900/20'}`}>
            <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Good</p>
            <p className="text-blue-200 text-3xl font-bold">{gameState.goodScore}</p>
          </div>
          <div className={`rounded-xl p-4 text-center border ${!isGoodWin ? 'bg-red-600/20 border-red-500/40' : 'bg-red-900/10 border-red-900/20'}`}>
            <p className="text-red-300 text-xs uppercase tracking-wider mb-1">Evil</p>
            <p className="text-red-200 text-3xl font-bold">{gameState.evilScore}</p>
          </div>
        </div>

        {/* Merlin reveal */}
        {merlin && (
          <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
            <p className="text-blue-300 text-xs uppercase tracking-wider mb-2">🔮 Merlin was…</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{merlin.avatar}</span>
              <div>
                <p className="text-white font-bold text-lg">{merlin.name}</p>
                <p className="text-blue-300 text-xs">The true Merlin</p>
              </div>
            </div>
          </div>
        )}

        {/* Assassination result */}
        {assassinated && (
          <div className={`rounded-xl p-4 border ${assassinGotMerlin ? 'bg-red-950/30 border-red-800/40' : 'bg-green-950/30 border-green-800/40'}`}>
            <p className={`text-xs uppercase tracking-wider mb-2 ${assassinGotMerlin ? 'text-red-300' : 'text-green-300'}`}>
              🗡️ Assassination Target
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{assassinated.avatar}</span>
              <div>
                <p className="text-white font-bold">{assassinated.name}</p>
                <p className={`text-xs ${assassinGotMerlin ? 'text-red-300' : 'text-green-300'}`}>
                  {assassinGotMerlin ? '☠️ Was Merlin — Evil wins!' : `Was ${assassinated.character} — Not Merlin!`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* All character reveals */}
        <div>
          <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2">All Roles Revealed</p>
          <div className="space-y-2">
            {gameState.players.map(player => {
              const char = player.character as CharacterName | undefined;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-xl p-3 border ${
                    player.alignment === 'good'
                      ? 'bg-blue-950/20 border-blue-900/30'
                      : 'bg-red-950/20 border-red-900/30'
                  }`}
                >
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{player.name}</p>
                    {char && (
                      <p className={`text-xs ${player.alignment === 'good' ? 'text-blue-300' : 'text-red-300'}`}>
                        {CHARACTER_ICONS[char]} {char}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    player.alignment === 'good' ? 'bg-blue-900/60 text-blue-200' : 'bg-red-900/60 text-red-200'
                  }`}>
                    {player.alignment === 'good' ? '⚔️ Good' : '💀 Evil'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quest history */}
        <div>
          <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold mb-2">Quest History</p>
          <div className="space-y-2">
            {gameState.quests
              .filter(q => q.result !== null)
              .map((q, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl p-3 border ${
                    q.result === 'success'
                      ? 'bg-blue-950/20 border-blue-900/30'
                      : 'bg-red-950/20 border-red-900/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    q.result === 'success' ? 'bg-blue-600 text-white' : 'bg-red-700 text-white'
                  }`}>
                    {q.result === 'success' ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Quest {i + 1}</p>
                    <p className="text-slate-400 text-xs">
                      Team: {q.team.map(pid => gameState.players.find(p => p.id === pid)?.name).join(', ')}
                    </p>
                  </div>
                  <span className={`text-xs ${q.result === 'success' ? 'text-blue-300' : 'text-red-300'}`}>
                    {Object.values(q.questVotes).filter(v => v === 'fail').length} fail(s)
                  </span>
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={leaveRoom}
          className="w-full bg-slate-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-all mb-4"
        >
          🏠 Back to Menu
        </button>
      </div>
    </div>
  );
}
