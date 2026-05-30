import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PLAYER_AVATARS } from '../data/characters';

export default function ProfileScreen() {
  const { createProfile } = useGame();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(PLAYER_AVATARS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    createProfile(name.trim(), avatar);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-6">
      {/* Title */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">⚔️</div>
        <h1 className="text-4xl font-bold text-amber-400 tracking-widest drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
          AVALON
        </h1>
        <p className="text-indigo-300 text-sm mt-1 tracking-widest uppercase">The Resistance</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs bg-slate-900/80 border border-indigo-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur">
        <h2 className="text-white text-lg font-semibold mb-5 text-center">Create Your Profile</h2>

        {/* Avatar picker */}
        <div className="mb-5">
          <p className="text-indigo-300 text-xs uppercase tracking-wider mb-3">Choose Avatar</p>
          <div className="grid grid-cols-5 gap-2">
            {PLAYER_AVATARS.map((em) => (
              <button
                key={em}
                onClick={() => setAvatar(em)}
                className={`text-2xl h-12 rounded-xl transition-all ${
                  avatar === em
                    ? 'bg-amber-500/30 ring-2 ring-amber-400 scale-110'
                    : 'bg-slate-800 active:scale-95'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-6">
          <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">Your Name</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            placeholder="Enter your name..."
            className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none border border-slate-700 focus:border-amber-500 transition-colors placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl text-sm tracking-wide active:scale-95 transition-all shadow-lg shadow-amber-500/20"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
