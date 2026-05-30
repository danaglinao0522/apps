import { useGame } from '../context/GameContext';
import QuestBoard from './QuestBoard';
import PlayerGrid from './PlayerGrid';

export default function TeamBuildingScreen() {
  const { gameState, myId, isHost, myKnowledge, hostAction, cardHidden, setCardHidden } = useGame();
  if (!gameState) return null;

  const quest = gameState.quests[gameState.currentQuestIndex];
  const leader = gameState.players[gameState.currentLeaderIndex];
  // isLeader check done via leader comparison in UI
  const teamFull = quest.team.length >= quest.teamSize;
  const voteTrack = gameState.voteTrack ?? 0;

  const handleSelect = (pid: string) => {
    if (!isHost) return;
    if (quest.team.includes(pid)) {
      hostAction('REMOVE_TEAM_MEMBER', pid);
    } else {
      hostAction('SELECT_TEAM_MEMBER', pid);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs uppercase tracking-wider">Quest {gameState.currentQuestIndex + 1}</p>
            <h2 className="text-white font-bold">Team Building</h2>
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
        <QuestBoard state={gameState} />

        {/* Vote track */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Vote Track</p>
            <p className="text-slate-400 text-xs">{voteTrack}/5 rejections</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2.5 rounded-full transition-all ${
                  i < voteTrack ? 'bg-red-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          {voteTrack >= 4 && (
            <p className="text-red-400 text-xs mt-2 text-center">⚠️ Next rejection = Evil wins!</p>
          )}
        </div>

        {/* Leader info */}
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{leader?.avatar}</span>
          <div>
            <p className="text-amber-300 text-xs uppercase tracking-wider">Current Leader</p>
            <p className="text-white font-semibold">{leader?.name}{leader?.id === myId ? ' (You)' : ''}</p>
          </div>
          <div className="ml-auto">
            <p className="text-amber-400 text-xs">Needs {quest.teamSize} players</p>
          </div>
        </div>

        {/* Team slots */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              Quest Team ({quest.team.length}/{quest.teamSize})
            </p>
            {quest.requiresTwoFails && (
              <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded-full">Needs 2 fails</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {[...Array(quest.teamSize)].map((_, i) => {
              const pid = quest.team[i];
              const player = gameState.players.find(p => p.id === pid);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border ${
                    player
                      ? 'bg-indigo-700/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-500'
                  }`}
                >
                  {player ? (
                    <>
                      <span>{player.avatar}</span>
                      <span className="font-medium">{player.name}</span>
                      {isHost && (
                        <button
                          onClick={() => hostAction('REMOVE_TEAM_MEMBER', pid)}
                          className="text-red-400 text-xs ml-1 active:scale-90"
                        >✕</button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs">Slot {i + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Players grid */}
        {!cardHidden && (
          <div>
            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              {isHost ? 'Tap to add/remove from team' : 'All Players'}
            </p>
            <PlayerGrid
              players={gameState.players}
              currentQuest={quest}
              myId={myId}
              myKnowledge={myKnowledge}
              onSelectPlayer={isHost ? handleSelect : undefined}
              selectableIds={isHost ? gameState.players.map(p => p.id) : []}
              selectedIds={quest.team}
              currentLeaderId={leader?.id}
            />
          </div>
        )}

        {cardHidden && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="text-4xl">🙈</div>
            <p className="text-slate-400 text-sm">Cards hidden</p>
            <button onClick={() => setCardHidden(false)} className="text-indigo-400 text-sm underline">Tap to reveal</button>
          </div>
        )}

        {/* Host: start vote */}
        {isHost && (
          <button
            onClick={() => hostAction('START_TEAM_VOTE')}
            disabled={!teamFull}
            className="w-full bg-amber-500 disabled:opacity-40 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20 mb-4"
          >
            {teamFull ? '🗳️ Start Team Vote' : `Need ${quest.teamSize - quest.team.length} more player(s)`}
          </button>
        )}

        {!isHost && (
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center mb-4">
            <p className="text-indigo-300 text-sm">⏳ Waiting for host to send team to vote…</p>
          </div>
        )}
      </div>
    </div>
  );
}
