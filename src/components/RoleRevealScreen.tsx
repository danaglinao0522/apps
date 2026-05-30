import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CHARACTER_COLORS, CHARACTER_ICONS } from '../data/characters';
import { CharacterName, Player } from '../types/game';

export default function RoleRevealScreen() {
  const { gameState, myId, myKnowledge, isHost, hostAction } = useGame();
  const [revealed, setRevealed] = useState(false);

  if (!gameState) return null;

  const me = gameState.players.find(p => p.id === myId);
  if (!me || !me.character) return null;

  const char = me.character as CharacterName;
  const isGood = me.alignment === 'good';

  const knownPlayers = (ids: string[]): Player[] =>
    ids.map(id => gameState.players.find(p => p.id === id)).filter(Boolean) as Player[];

  const evilPlayers = knownPlayers(myKnowledge.knownEvil);
  const merlinMorganaPeers = knownPlayers(myKnowledge.knownMerlinMorgana);
  const allies = knownPlayers(myKnowledge.knownAllies);
  const merlinPlayers = knownPlayers(myKnowledge.knownMerlin);

  // each person controls their own reveal independently

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <h2 className="text-white font-bold text-center">Your Role</h2>
        <p className="text-indigo-300 text-xs text-center mt-0.5">Keep this private!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Role card */}
        <div
          onClick={() => setRevealed(r => !r)}
          className={`relative w-full rounded-2xl overflow-hidden shadow-2xl active:scale-98 transition-all select-none ${
            revealed ? `bg-gradient-to-br ${CHARACTER_COLORS[char]}` : 'bg-slate-800'
          }`}
          style={{ minHeight: 200 }}
        >
          {!revealed ? (
            <div className="flex flex-col items-center justify-center h-full py-14 gap-3">
              <div className="text-5xl">🔒</div>
              <p className="text-slate-400 text-sm font-medium">Tap to reveal your role</p>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center gap-3">
              <div className="text-6xl">{CHARACTER_ICONS[char]}</div>
              <h3 className="text-white text-2xl font-bold tracking-wide">{char}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isGood ? 'bg-blue-900/60 text-blue-200' : 'bg-red-900/60 text-red-200'}`}>
                {isGood ? '⚔️ Good' : '💀 Evil'}
              </div>
              <p className="text-white/70 text-xs text-center mt-1 leading-relaxed">
                Tap to hide
              </p>
            </div>
          )}
        </div>

        {/* Knowledge section (only when revealed) */}
        {revealed && (
          <div className="space-y-3">
            {/* Merlin sees evil */}
            {evilPlayers.length > 0 && (
              <KnowledgeCard
                icon="👁️"
                label="You can see these Evil players"
                labelColor="text-red-300"
                borderColor="border-red-800/50"
                bgColor="bg-red-950/30"
                players={evilPlayers}
                badge="Evil"
                badgeColor="bg-red-900/60 text-red-200"
              />
            )}

            {/* Percival sees Merlin/Morgana */}
            {merlinMorganaPeers.length > 0 && (
              <KnowledgeCard
                icon="🌀"
                label="One is Merlin, one is Morgana — you don't know which!"
                labelColor="text-purple-300"
                borderColor="border-purple-800/50"
                bgColor="bg-purple-950/30"
                players={merlinMorganaPeers}
                badge="Merlin / Morgana"
                badgeColor="bg-purple-900/60 text-purple-200"
              />
            )}

            {/* Morgana sees Merlin */}
            {merlinPlayers.length > 0 && (
              <KnowledgeCard
                icon="🔮"
                label="You know who Merlin is — deceive Percival!"
                labelColor="text-blue-300"
                borderColor="border-blue-800/50"
                bgColor="bg-blue-950/30"
                players={merlinPlayers}
                badge="Merlin"
                badgeColor="bg-blue-900/60 text-blue-200"
              />
            )}

            {/* Evil sees allies */}
            {allies.length > 0 && (
              <KnowledgeCard
                icon="🤝"
                label="Your Evil allies"
                labelColor="text-red-300"
                borderColor="border-red-800/50"
                bgColor="bg-red-950/30"
                players={allies}
                badge="Evil"
                badgeColor="bg-red-900/60 text-red-200"
              />
            )}

            {/* Loyal servant / Mordred - no special knowledge */}
            {evilPlayers.length === 0 && merlinMorganaPeers.length === 0 && allies.length === 0 && merlinPlayers.length === 0 && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">You have no special knowledge. Trust your instincts!</p>
              </div>
            )}
          </div>
        )}

        {/* Host can advance once everyone is ready */}
        {isHost && (
          <div className="mt-4">
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 mb-3 text-center">
              <p className="text-amber-300 text-xs">Make sure everyone has seen their role before continuing.</p>
            </div>
            <button
              onClick={() => hostAction('NEXT_PHASE')}
              className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              ⚔️ Begin the Quest
            </button>
          </div>
        )}

        {!isHost && (
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center">
            <p className="text-indigo-300 text-sm">⏳ Waiting for host to begin…</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KnowledgeCard({
  icon, label, labelColor, borderColor, bgColor, players, badge, badgeColor
}: {
  icon: string;
  label: string;
  labelColor: string;
  borderColor: string;
  bgColor: string;
  players: Player[];
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <p className={`text-xs font-medium ${labelColor}`}>{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5">
            <span className="text-lg">{p.avatar}</span>
            <span className="text-white text-sm font-medium">{p.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
