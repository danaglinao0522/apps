import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function LobbyScreen() {
  const { myName, myAvatar, isConnected, connectionError, createRoom, joinRoom, gameState } = useGame();
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  if (isConnected && gameState) {
    return <WaitingRoom />;
  }

  if (mode === 'join') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-6">
        <button
          onClick={() => setMode('choose')}
          className="text-indigo-400 text-sm mb-6 self-start active:opacity-60"
        >
          ← Back
        </button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-white text-xl font-bold mb-2">Join a Room</h2>
          <p className="text-indigo-300 text-sm mb-6">Enter the room code from the host</p>
          <div className="w-full max-w-xs space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="XXXXX"
              className="w-full bg-slate-800 text-white text-center text-2xl font-bold tracking-[0.5em] rounded-xl px-4 py-4 outline-none border border-slate-700 focus:border-amber-500 transition-colors placeholder-slate-600"
            />
            {connectionError && (
              <p className="text-red-400 text-xs text-center">{connectionError}</p>
            )}
            <button
              onClick={() => joinRoom(joinCode)}
              disabled={joinCode.length < 5}
              className="w-full bg-indigo-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-all"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-5xl mb-2">{myAvatar}</div>
        <h2 className="text-white font-bold text-lg">{myName}</h2>
        <p className="text-indigo-400 text-xs">Ready to play</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={createRoom}
          className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20"
        >
          🏰 Create Room
        </button>
        <button
          onClick={() => setMode('join')}
          className="w-full bg-indigo-700 text-white font-bold py-4 rounded-2xl text-base active:scale-95 transition-all"
        >
          🔗 Join Room
        </button>
      </div>

      {connectionError && (
        <p className="text-red-400 text-xs mt-4 text-center">{connectionError}</p>
      )}
    </div>
  );
}

function WaitingRoom() {
  const { gameState, roomCode, isHost, hostAction, leaveRoom } = useGame();
  if (!gameState) return null;

  const playerCount = gameState.players.length;
  const canStart = playerCount >= 5 && playerCount <= 10;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-4 flex items-center justify-between">
        <button onClick={leaveRoom} className="text-slate-400 text-sm active:opacity-60">← Leave</button>
        <div className="text-center">
          <p className="text-indigo-300 text-xs uppercase tracking-wider">Room Code</p>
          <p className="text-amber-400 text-2xl font-bold tracking-widest">{roomCode}</p>
        </div>
        <div className="w-12" />
      </div>

      {/* Players */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
            Players ({playerCount}/10)
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${canStart ? 'bg-green-900/50 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
            {canStart ? '✓ Ready' : `Need ${Math.max(0, 5 - playerCount)} more`}
          </span>
        </div>

        <div className="space-y-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700/50"
            >
              <div className="text-2xl">{player.avatar}</div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{player.name}</p>
                {player.isHost && (
                  <p className="text-amber-400 text-xs">👑 Host</p>
                )}
              </div>
              <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>

        {!isHost && (
          <div className="mt-6 bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center">
            <p className="text-indigo-300 text-sm">⏳ Waiting for host to start the game…</p>
          </div>
        )}

        {isHost && (
          <div className="mt-6 space-y-3">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
              <p className="text-slate-300 text-xs text-center">
                Share the code <span className="text-amber-400 font-bold">{roomCode}</span> with other players so they can join.
              </p>
            </div>
            <button
              onClick={() => hostAction('OPEN_CHARACTER_SELECTION')}
              disabled={!canStart}
              className="w-full bg-amber-500 disabled:opacity-40 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              ⚔️ Character Selection →
            </button>
            {!canStart && (
              <p className="text-slate-400 text-xs text-center">Needs 5–10 players to start</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
