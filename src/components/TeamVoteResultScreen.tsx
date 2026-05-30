import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';

export default function TeamVoteResultScreen() {
  const { gameState, isHost, hostAction } = useGame();
  if (!gameState) return null;

  const quest = gameState.quests[gameState.currentQuestIndex];
  const approvals = Object.entries(quest.votes).filter(([, v]) => v === 'approve');
  const rejections = Object.entries(quest.votes).filter(([, v]) => v === 'reject');
  const approved = approvals.length > rejections.length;

  const getPlayer = (id: string) => gameState.players.find(p => p.id === id);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <p className="text-indigo-300 text-xs uppercase tracking-wider text-center">Quest {gameState.currentQuestIndex + 1}</p>
        <h2 className="text-white font-bold text-center">Vote Results</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <QuestBoard state={gameState} compact />

        {/* Result banner */}
        <div className={`rounded-2xl p-5 text-center border ${
          approved
            ? 'bg-green-900/30 border-green-700/40'
            : 'bg-red-900/30 border-red-700/40'
        }`}>
          <div className="text-5xl mb-2">{approved ? '✅' : '❌'}</div>
          <h3 className={`text-2xl font-bold ${approved ? 'text-green-300' : 'text-red-300'}`}>
            {approved ? 'Team Approved!' : 'Team Rejected!'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {approvals.length} approve · {rejections.length} reject
          </p>
          {!approved && (
            <p className="text-orange-300 text-xs mt-2">
              Vote track: {(gameState.voteTrack ?? 0) + 1}/5
            </p>
          )}
        </div>

        {/* Individual votes */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
          <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold mb-3">All Votes</p>
          <div className="space-y-2">
            {Object.entries(quest.votes).map(([pid, vote]) => {
              const player = getPlayer(pid);
              if (!player) return null;
              return (
                <div key={pid} className="flex items-center gap-3">
                  <span className="text-xl">{player.avatar}</span>
                  <span className="text-white text-sm flex-1">{player.name}</span>
                  <span className={`text-sm font-bold ${vote === 'approve' ? 'text-green-400' : 'text-red-400'}`}>
                    {vote === 'approve' ? '✅ Approve' : '❌ Reject'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approve list */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-3">
            <p className="text-green-300 text-xs uppercase font-semibold mb-2">✅ Approve ({approvals.length})</p>
            {approvals.map(([pid]) => {
              const p = getPlayer(pid);
              return p ? (
                <div key={pid} className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-white text-xs">{p.name}</span>
                </div>
              ) : null;
            })}
          </div>
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3">
            <p className="text-red-300 text-xs uppercase font-semibold mb-2">❌ Reject ({rejections.length})</p>
            {rejections.map(([pid]) => {
              const p = getPlayer(pid);
              return p ? (
                <div key={pid} className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-white text-xs">{p.name}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

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
