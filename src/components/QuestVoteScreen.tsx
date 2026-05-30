import { useState } from 'react';
import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';

export default function QuestVoteScreen() {
  const { gameState, myId, isHost, playerAction, cardHidden, setCardHidden } = useGame();
  const [myVote, setMyVote] = useState<'success' | 'fail' | null>(null);

  if (!gameState) return null;

  const quest = gameState.quests[gameState.currentQuestIndex];
  const isOnTeam = quest.team.includes(myId);
  const hasVoted = quest.questVotes[myId] !== undefined;
  const myCurrentVote = quest.questVotes[myId] ?? myVote;
  const me = gameState.players.find(p => p.id === myId);
  const isEvil = me?.alignment === 'evil';

  const totalTeam = quest.team.length;
  const totalVoted = Object.keys(quest.questVotes).length;

  const voteMap: Record<string, boolean> = {};
  quest.team.forEach(pid => {
    voteMap[pid] = quest.questVotes[pid] !== undefined;
  });

  const handleVote = (v: 'success' | 'fail') => {
    if (!isOnTeam || hasVoted) return;
    setMyVote(v);
    playerAction('VOTE_QUEST', v);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs uppercase tracking-wider">Quest {gameState.currentQuestIndex + 1}</p>
            <h2 className="text-white font-bold">The Quest</h2>
          </div>
          <button
            onClick={() => setCardHidden(!cardHidden)}
            className="text-xs bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg active:scale-95"
          >
            {cardHidden ? '👁️ Show' : '🙈 Hide'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestBoard state={gameState} compact />

        {/* Team on quest */}
        <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3">
          <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">Quest Team</p>
          <div className="flex flex-wrap gap-2">
            {quest.team.map(pid => {
              const p = gameState.players.find(pl => pl.id === pid);
              if (!p) return null;
              return (
                <div key={pid} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                  pid === myId ? 'bg-amber-700/30 border-amber-500/50' : 'bg-indigo-800/30 border-indigo-600/40'
                }`}>
                  <span>{p.avatar}</span>
                  <span className="text-white text-sm font-medium">{p.name}</span>
                  {pid === myId && <span className="text-amber-300 text-xs">(You)</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quest vote progress */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Quest Votes</p>
            <p className={`text-sm font-bold ${totalVoted === totalTeam ? 'text-green-400' : 'text-slate-300'}`}>
              {totalVoted}/{totalTeam}
            </p>
          </div>
          <div className="flex gap-1">
            {quest.team.map(pid => (
              <div
                key={pid}
                className={`flex-1 h-3 rounded-full transition-all ${voteMap[pid] ? 'bg-green-500' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {quest.team.map(pid => {
              const p = gameState.players.find(pl => pl.id === pid);
              return (
                <span key={pid} className={`text-xs ${voteMap[pid] ? 'text-green-400' : 'text-slate-500'}`}>
                  {p?.avatar}{voteMap[pid] ? '✓' : '…'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Vote section */}
        {!cardHidden && (
          <>
            {isOnTeam ? (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <p className="text-white font-semibold text-sm text-center mb-1">
                  {hasVoted ? `You voted: ${myCurrentVote === 'success' ? '⚔️ Success' : '💀 Fail'}` : 'You are on the quest!'}
                </p>
                {!hasVoted && (
                  <p className={`text-xs text-center mb-3 ${isEvil ? 'text-red-300' : 'text-green-300'}`}>
                    {isEvil ? '🗡️ Evil: you may play Fail to sabotage' : '⚔️ Good: you must play Success'}
                  </p>
                )}
                {quest.requiresTwoFails && (
                  <p className="text-orange-300 text-xs text-center mb-3">⚠️ This quest requires 2 fails to fail</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVote('success')}
                    disabled={hasVoted}
                    className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                      myCurrentVote === 'success'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/20'
                        : 'bg-blue-900/40 text-blue-300 border border-blue-800/50 disabled:opacity-50'
                    }`}
                  >
                    ⚔️ Success
                  </button>
                  <button
                    onClick={() => handleVote('fail')}
                    disabled={hasVoted || !isEvil}
                    className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                      myCurrentVote === 'fail'
                        ? 'bg-red-700 text-white ring-2 ring-red-400 shadow-lg shadow-red-500/20'
                        : 'bg-red-900/40 text-red-300 border border-red-800/50 disabled:opacity-50'
                    }`}
                  >
                    💀 Fail
                  </button>
                </div>
                {!isEvil && (
                  <p className="text-slate-500 text-xs text-center mt-2">Good players must vote Success</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 text-center">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-slate-300 text-sm font-medium">You are not on this quest</p>
                <p className="text-slate-500 text-xs mt-1">Wait for quest members to vote</p>
              </div>
            )}
          </>
        )}

        {cardHidden && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="text-4xl">🙈</div>
            <p className="text-slate-400 text-sm">Cards hidden</p>
            <button onClick={() => setCardHidden(false)} className="text-indigo-400 text-sm underline">Tap to reveal</button>
          </div>
        )}

        {isHost && totalVoted < totalTeam && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-center">
            <p className="text-amber-300 text-sm">Waiting for all team members to vote…</p>
          </div>
        )}
      </div>
    </div>
  );
}
