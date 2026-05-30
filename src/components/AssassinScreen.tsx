import { useState } from 'react';
import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';

export default function AssassinScreen() {
  const { gameState, myId, isHost, hostAction, playerAction } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!gameState) return null;

  const me = gameState.players.find(p => p.id === myId);
  const isEvil = me?.alignment === 'evil';
  const currentTarget = gameState.assassinTarget ?? selectedTarget;

  // Evil players can select; any evil player votes, host confirms
  const handleSelect = (pid: string) => {
    if (!isEvil) return;
    setSelectedTarget(pid);
    playerAction('SELECT_ASSASSIN_TARGET', pid);
  };

  const handleConfirm = () => {
    if (!isHost || !currentTarget) return;
    hostAction('CONFIRM_ASSASSIN', currentTarget);
  };

  // goodPlayers filtered in render below
  const targetPlayer = gameState.players.find(p => p.id === currentTarget);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-red-950/30 to-slate-950">
      {/* Header */}
      <div className="bg-red-950/80 border-b border-red-900/50 px-4 py-3">
        <h2 className="text-red-200 font-bold text-center text-lg">☠️ Assassination</h2>
        <p className="text-red-300/70 text-xs text-center mt-0.5">Evil's last chance — find Merlin!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestBoard state={gameState} compact />

        {/* Info */}
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2">🗡️</div>
          <h3 className="text-red-200 font-bold text-lg mb-1">Good has won 3 quests</h3>
          <p className="text-slate-300 text-sm">
            {isEvil
              ? 'Evil must now identify and assassinate Merlin. If successful, evil wins!'
              : 'Evil is choosing who to assassinate. If they pick Merlin, evil wins…'}
          </p>
        </div>

        {/* Target selection (evil only) */}
        {isEvil && (
          <div>
            <p className="text-red-300 text-xs uppercase tracking-wider font-semibold mb-2">
              Select Merlin — Good players only
            </p>
            <div className="space-y-2">
              {gameState.players
                .filter(p => p.alignment === 'good')
                .map(player => (
                  <button
                    key={player.id}
                    onClick={() => handleSelect(player.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 ${
                      currentTarget === player.id
                        ? 'bg-red-700/40 border-red-500 ring-1 ring-red-400'
                        : 'bg-slate-800/60 border-slate-700/40'
                    }`}
                  >
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="text-white font-medium flex-1 text-left">{player.name}</span>
                    {currentTarget === player.id && (
                      <span className="text-red-300 text-sm">🎯 Target</span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}

        {!isEvil && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🤫</div>
            <p className="text-slate-300 text-sm">Stay calm. Evil is deliberating…</p>
            {currentTarget && (
              <p className="text-red-300 text-sm mt-2 font-semibold">
                🎯 Evil has targeted: {targetPlayer?.avatar} {targetPlayer?.name}
              </p>
            )}
          </div>
        )}

        {/* Host confirm */}
        {isHost && (
          <div className="space-y-3 mb-4">
            {currentTarget && (
              <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-center">
                <p className="text-red-200 text-sm">
                  Target: <strong>{targetPlayer?.avatar} {targetPlayer?.name}</strong>
                </p>
              </div>
            )}
            <button
              onClick={handleConfirm}
              disabled={!currentTarget}
              className="w-full bg-red-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-red-500/20"
            >
              ⚔️ Confirm Assassination
            </button>
          </div>
        )}

        {!isHost && (
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center mb-4">
            <p className="text-indigo-300 text-sm">⏳ Waiting for host to confirm…</p>
          </div>
        )}
      </div>
    </div>
  );
}
