import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterName } from '../types/game';
import { CHARACTER_DEFS, CHARACTER_ICONS, EVIL_CHARACTERS, GOOD_CHARACTERS } from '../data/characters';
import {
  getRequiredEvilCount,
  getRequiredGoodCount,
  validateCharacterSelection,
} from '../utils/gameLogic';

export default function CharacterSelectionScreen() {
  const { gameState, isHost, hostAction } = useGame();
  if (!gameState) return null;

  const playerCount = gameState.players.length;
  const requiredEvil = getRequiredEvilCount(playerCount);
  const requiredGood = getRequiredGoodCount(playerCount);

  const [selected, setSelected] = useState<CharacterName[]>(() => {
    if (gameState.availableCharacters.length === playerCount) {
      return gameState.availableCharacters;
    }
    // Default: Merlin + Loyal Servants + Minions
    const good: CharacterName[] = ['Merlin'];
    for (let i = 1; i < requiredGood; i++) good.push('Loyal Servant');
    const evil: CharacterName[] = [];
    for (let i = 0; i < requiredEvil; i++) evil.push('Minion of Mordred');
    return [...good, ...evil];
  });

  const validation = validateCharacterSelection(selected, playerCount);
  const evilSelected = selected.filter(c => CHARACTER_DEFS[c].alignment === 'evil');
  const goodSelected = selected.filter(c => CHARACTER_DEFS[c].alignment === 'good');

  const toggle = (char: CharacterName) => {
    if (!isHost) return;
    const def = CHARACTER_DEFS[char];
    const isSelected = selected.includes(char);
    const isMust = char === 'Merlin'; // Merlin always required

    if (isMust) return; // can't deselect Merlin

    if (isSelected) {
      setSelected(prev => {
        const idx = prev.lastIndexOf(char);
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
    } else {
      const currentEvil = selected.filter(c => CHARACTER_DEFS[c].alignment === 'evil').length;
      const currentGood = selected.filter(c => CHARACTER_DEFS[c].alignment === 'good').length;

      if (def.alignment === 'evil' && currentEvil >= requiredEvil) return;
      if (def.alignment === 'good' && currentGood >= requiredGood) return;

      setSelected(prev => [...prev, char]);
    }
  };

  const handleConfirm = () => {
    if (!validation.valid) return;
    hostAction('SET_CHARACTERS', selected);
    hostAction('START_GAME');
  };

  const countOf = (char: CharacterName) => selected.filter(c => c === char).length;

  const renderCharCard = (char: CharacterName) => {
    const def = CHARACTER_DEFS[char];
    const count = countOf(char);
    const isGood = def.alignment === 'good';
    const isMust = char === 'Merlin';
    const isLoyalServant = char === 'Loyal Servant';
    const isMinion = char === 'Minion of Mordred';

    // Max selectable
    const maxCount = isLoyalServant ? requiredGood - 1 : isMinion ? requiredEvil : 1;
    const canAdd = isGood
      ? goodSelected.length < requiredGood
      : evilSelected.length < requiredEvil;
    const canRemove = !isMust && count > 0;

    return (
      <div
        key={char}
        className={`rounded-xl border p-3 flex gap-3 items-center transition-all ${
          count > 0
            ? isGood
              ? 'border-blue-500/50 bg-blue-950/40'
              : 'border-red-500/50 bg-red-950/40'
            : 'border-slate-700/40 bg-slate-800/40 opacity-60'
        }`}
      >
        <div className="text-2xl">{CHARACTER_ICONS[char]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">{char}</p>
          <p className="text-slate-400 text-xs line-clamp-2">{def.special}</p>
        </div>
        {isHost && (
          <div className="flex items-center gap-1">
            {(isLoyalServant || isMinion) ? (
              <>
                <button
                  onClick={() => canRemove && toggle(char)}
                  disabled={!canRemove}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white disabled:opacity-30 text-sm font-bold active:scale-90 transition-all"
                >−</button>
                <span className="text-white text-sm w-4 text-center font-bold">{count}</span>
                <button
                  onClick={() => canAdd && count < maxCount && toggle(char)}
                  disabled={!canAdd || count >= maxCount}
                  className="w-7 h-7 rounded-lg bg-slate-700 text-white disabled:opacity-30 text-sm font-bold active:scale-90 transition-all"
                >+</button>
              </>
            ) : (
              <button
                onClick={() => toggle(char)}
                disabled={isMust || (!count && !canAdd)}
                className={`w-8 h-8 rounded-lg text-sm font-bold active:scale-90 transition-all disabled:opacity-30 ${
                  count > 0
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {isMust ? '✓' : count > 0 ? '✓' : '+'}
              </button>
            )}
          </div>
        )}
        {!isHost && count > 0 && (
          <span className={`text-xs px-2 py-1 rounded-full ${isGood ? 'bg-blue-900/50 text-blue-300' : 'bg-red-900/50 text-red-300'}`}>
            {count > 1 ? `×${count}` : '✓'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-indigo-900/50 px-4 py-3">
        <h2 className="text-white font-bold text-center text-lg">Character Selection</h2>
        <p className="text-indigo-300 text-xs text-center mt-0.5">
          {playerCount} Players • {requiredGood} Good • {requiredEvil} Evil
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progress */}
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-center">
            <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">Good</p>
            <p className={`text-xl font-bold ${goodSelected.length === requiredGood ? 'text-green-400' : 'text-white'}`}>
              {goodSelected.length}/{requiredGood}
            </p>
          </div>
          <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-center">
            <p className="text-red-400 text-xs uppercase tracking-wider mb-1">Evil</p>
            <p className={`text-xl font-bold ${evilSelected.length === requiredEvil ? 'text-green-400' : 'text-white'}`}>
              {evilSelected.length}/{requiredEvil}
            </p>
          </div>
        </div>

        {/* Good characters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-blue-900/50" />
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">⚔️ Good</p>
            <div className="h-px flex-1 bg-blue-900/50" />
          </div>
          <div className="space-y-2">
            {GOOD_CHARACTERS.map(c => renderCharCard(c))}
          </div>
        </div>

        {/* Evil characters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-red-900/50" />
            <p className="text-red-300 text-xs font-semibold uppercase tracking-wider">💀 Evil</p>
            <div className="h-px flex-1 bg-red-900/50" />
          </div>
          <div className="space-y-2">
            {EVIL_CHARACTERS.map(c => renderCharCard(c))}
          </div>
        </div>

        {/* Validation */}
        {!validation.valid && isHost && (
          <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-3">
            <p className="text-red-300 text-xs text-center">{validation.error}</p>
          </div>
        )}

        {/* Host confirm */}
        {isHost && (
          <button
            onClick={handleConfirm}
            disabled={!validation.valid}
            className="w-full bg-amber-500 disabled:opacity-40 text-slate-950 font-bold py-4 rounded-2xl text-base active:scale-95 transition-all shadow-lg shadow-amber-500/20 mb-4"
          >
            🎲 Start Game
          </button>
        )}

        {!isHost && (
          <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-800/40 text-center mb-4">
            <p className="text-indigo-300 text-sm">⏳ Host is selecting characters…</p>
          </div>
        )}
      </div>
    </div>
  );
}
