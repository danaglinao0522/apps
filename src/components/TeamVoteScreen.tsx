import { useState } from 'react';
import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';

export default function TeamVoteScreen() {
  const { gameState, myId, isHost, playerAction, cardHidden, setCardHidden } = useGame();
  const [myVote, setMyVote] = useState<'approve' | 'reject' | null>(null);

  if (!gameState) return null;

  const quest = gameState.quests[gameState.currentQuestIndex];
  const leader = gameState.players[gameState.currentLeaderIndex];

  const hasVoted = quest.votes[myId] !== undefined;
  const myCurrentVote = quest.votes[myId] ?? myVote;
  const totalVoted = Object.keys(quest.votes).length;
  const totalPlayers = gameState.players.length;

  // voteMap: player id -> has voted (boolean)
  const voteMap: Record<string, boolean> = {};
  gameState.players.forEach(p => {
    voteMap[p.id] = quest.votes[p.id] !== undefined;
  });

  const handleVote = (v: 'approve' | 'reject') => {
    if (hasVoted) return;
    setMyVote(v);
    playerAction('VOTE_TEAM', v);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs uppercase tracking-wider">Quest {gameState.currentQuestIndex + 1}</p>
            <h2 className="text-white font-bold">Team Vote</h2>
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
        {/* Quest board */}
        <QuestBoard state={gameState} compact />

        {/* Team going on quest */}
        <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3">
          <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">Proposed Team</p>
          <div className="flex flex-wrap gap-2">
            {quest.team.map(pid => {
              const p = gameState.players.find(pl => pl.id === pid);
              if (!p) return null;
              return (
                <div key={pid} className="flex items-center gap-1.5 bg-indigo-800/40 px-3 py-1.5 rounded-xl">
                  <span>{p.avatar}</span>
                  <span className="text-white text-sm font-medium">{p.name}</span>
                </div>
              );
            })}
          </div>
          <p className="text-slate-400 text-xs mt-2">
            Led by {leader?.avatar} {leader?.name}
          </p>
        </div>

        {/* Vote progress */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Votes Cast</p>
            <p className={`text-sm font-bold ${totalVoted === totalPlayers ? 'text-green-400' : 'text-slate-300'}`}>
              {totalVoted}/{totalPlayers}
            </p>
          </div>
          <div className="flex gap-1">
            {gameState.players.map(p => (
              <div
                key={p.id}
                className={`flex-1 h-3 rounded-full transition-all ${
                  voteMap[p.id] ? 'bg-green-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {gameState.players.map(p => (
              <span key={p.id} className={`text-xs ${voteMap[p.id] ? 'text-green-400' : 'text-slate-500'}`}>
                {p.avatar}{voteMap[p.id] ? '✓' : '…'}
              </span>
            ))}
          </div>
        </div>

        {/* My vote */}
        {!cardHidden && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <p className="text-white font-semibold text-sm text-center mb-3">
              {hasVoted ? `You voted: ${myCurrentVote === 'approve' ? '✅ Approve' : '❌ Reject'}` : 'Cast your vote'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('approve')}
                disabled={hasVoted}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  myCurrentVote === 'approve'
                    ? 'bg-green-600 text-white ring-2 ring-green-400 shadow-lg shadow-green-500/20'
                    : 'bg-green-900/40 text-green-300 border border-green-800/50 disabled:opacity-50'
                }`}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleVote('reject')}
                disabled={hasVoted}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  myCurrentVote === 'reject'
                    ? 'bg-red-700 text-white ring-2 ring-red-400 shadow-lg shadow-red-500/20'
                    : 'bg-red-900/40 text-red-300 border border-red-800/50 disabled:opacity-50'
                }`}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}

        {cardHidden && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="text-4xl">🙈</div>
            <p className="text-slate-400 text-sm">Cards hidden</p>
            <button onClick={() => setCardHidden(false)} className="text-indigo-400 text-sm underline">Tap to reveal</button>
          </div>
        )}

        {/* Host: waiting message */}
        {isHost && totalVoted < totalPlayers && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-center">
            <p className="text-amber-300 text-sm">Waiting for all players to vote…</p>
          </div>
        )}
      </div>
    </div>
  );
}
