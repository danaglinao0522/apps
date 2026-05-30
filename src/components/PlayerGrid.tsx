import { Player, Quest } from '../types/game';

interface Props {
  players: Player[];
  currentQuest?: Quest;
  myId: string;
  myKnowledge?: {
    knownEvil: string[];
    knownMerlinMorgana: string[];
    knownAllies: string[];
    knownMerlin: string[];
  };
  onSelectPlayer?: (id: string) => void;
  selectableIds?: string[];
  selectedIds?: string[];
  voteMap?: Record<string, boolean>; // true = has voted
  currentLeaderId?: string;
}

export default function PlayerGrid({
  players,
  currentQuest,
  myId,
  myKnowledge,
  onSelectPlayer,
  selectableIds,
  selectedIds = [],
  voteMap = {},
  currentLeaderId,
}: Props) {
  const teamIds = currentQuest?.team ?? [];

  return (
    <div className="grid grid-cols-3 gap-2">
      {players.map(player => {
        const isMe = player.id === myId;
        const isLeader = player.id === currentLeaderId;
        const isOnTeam = teamIds.includes(player.id);
        const isSelected = selectedIds.includes(player.id);
        const isSelectable = selectableIds?.includes(player.id);
        const hasVoted = voteMap[player.id] ?? false;
        const isKnownEvil = myKnowledge?.knownEvil.includes(player.id);
        const isKnownMerlinMorgana = myKnowledge?.knownMerlinMorgana.includes(player.id);
        const isKnownAlly = myKnowledge?.knownAllies.includes(player.id);
        const isKnownMerlin = myKnowledge?.knownMerlin.includes(player.id);

        return (
          <button
            key={player.id}
            onClick={() => isSelectable && onSelectPlayer?.(player.id)}
            className={`rounded-xl p-2.5 flex flex-col items-center gap-1 border transition-all active:scale-95 ${
              isSelected
                ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20'
                : isOnTeam
                ? 'bg-indigo-600/20 border-indigo-400'
                : isSelectable
                ? 'bg-slate-800/60 border-slate-600 hover:border-amber-500/50'
                : 'bg-slate-800/40 border-slate-700/40'
            } ${!isSelectable ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`text-3xl ${isLeader ? 'animate-bounce' : ''}`}>{player.avatar}</div>
              {isLeader && (
                <div className="absolute -top-1 -right-1 text-xs">👑</div>
              )}
              {hasVoted && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-slate-900" />
              )}
            </div>

            {/* Name */}
            <p className={`text-xs font-medium truncate w-full text-center ${isMe ? 'text-amber-400' : 'text-white'}`}>
              {player.name}
              {isMe ? ' (You)' : ''}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-0.5 justify-center">
              {isOnTeam && !isSelected && (
                <span className="text-[9px] bg-indigo-700/60 text-indigo-200 px-1 py-0.5 rounded-full">Quest</span>
              )}
              {isSelected && (
                <span className="text-[9px] bg-amber-600/60 text-amber-100 px-1 py-0.5 rounded-full">Selected</span>
              )}
              {isKnownEvil && (
                <span className="text-[9px] bg-red-900/70 text-red-200 px-1 py-0.5 rounded-full">Evil</span>
              )}
              {isKnownMerlinMorgana && (
                <span className="text-[9px] bg-purple-900/70 text-purple-200 px-1 py-0.5 rounded-full">M/M</span>
              )}
              {isKnownAlly && !isKnownEvil && (
                <span className="text-[9px] bg-red-900/50 text-red-300 px-1 py-0.5 rounded-full">Ally</span>
              )}
              {isKnownMerlin && (
                <span className="text-[9px] bg-blue-900/70 text-blue-200 px-1 py-0.5 rounded-full">Merlin</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
