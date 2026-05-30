import { CharacterDef, CharacterName } from '../types/game';

export const CHARACTER_DEFS: Record<CharacterName, CharacterDef> = {
  Merlin: {
    name: 'Merlin',
    alignment: 'good',
    description: 'Knows who the evil players are (except Mordred). Must hide this knowledge or be assassinated.',
    special: 'Sees all Evil except Mordred',
  },
  Percival: {
    name: 'Percival',
    alignment: 'good',
    description: 'Knows who Merlin and Morgana are but cannot tell them apart.',
    special: 'Sees Merlin & Morgana (but not which is which)',
  },
  'Loyal Servant': {
    name: 'Loyal Servant',
    alignment: 'good',
    description: 'A loyal servant of Arthur. Has no special knowledge.',
    special: 'No special ability',
  },
  Mordred: {
    name: 'Mordred',
    alignment: 'evil',
    description: 'Hidden from Merlin. The leader of evil forces.',
    special: 'Hidden from Merlin',
  },
  Morgana: {
    name: 'Morgana',
    alignment: 'evil',
    description: 'Appears as Merlin to Percival. Knows her evil allies.',
    special: 'Appears as Merlin to Percival',
  },
  Oberon: {
    name: 'Oberon',
    alignment: 'evil',
    description: 'Hidden from other evil players. They are also hidden from Oberon.',
    special: 'Invisible to other Evil (and vice versa)',
  },
  'Minion of Mordred': {
    name: 'Minion of Mordred',
    alignment: 'evil',
    description: 'A servant of evil. Knows the other evil players (except Oberon).',
    special: 'Knows evil allies (except Oberon)',
  },
};

// Player count -> quest team sizes
export const QUEST_CONFIGS: Record<number, { teamSizes: number[]; twoFails: number[] }> = {
  5:  { teamSizes: [2, 3, 2, 3, 3], twoFails: [] },
  6:  { teamSizes: [2, 3, 4, 3, 4], twoFails: [] },
  7:  { teamSizes: [2, 3, 3, 4, 4], twoFails: [3] },
  8:  { teamSizes: [3, 4, 4, 5, 5], twoFails: [3] },
  9:  { teamSizes: [3, 4, 4, 5, 5], twoFails: [3] },
  10: { teamSizes: [3, 4, 4, 5, 5], twoFails: [3] },
};

// Player count -> required evil count
export const EVIL_COUNTS: Record<number, number> = {
  5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 4,
};

export const GOOD_CHARACTERS: CharacterName[] = ['Merlin', 'Percival', 'Loyal Servant'];
export const EVIL_CHARACTERS: CharacterName[] = ['Mordred', 'Morgana', 'Oberon', 'Minion of Mordred'];

export const CHARACTER_COLORS: Record<CharacterName, string> = {
  Merlin: 'from-blue-900 to-indigo-800',
  Percival: 'from-blue-700 to-cyan-700',
  'Loyal Servant': 'from-green-700 to-emerald-600',
  Mordred: 'from-red-900 to-rose-800',
  Morgana: 'from-purple-900 to-fuchsia-800',
  Oberon: 'from-orange-800 to-red-700',
  'Minion of Mordred': 'from-red-700 to-rose-600',
};

export const CHARACTER_ICONS: Record<CharacterName, string> = {
  Merlin: '🔮',
  Percival: '🛡️',
  'Loyal Servant': '⚔️',
  Mordred: '💀',
  Morgana: '🌙',
  Oberon: '🌑',
  'Minion of Mordred': '🗡️',
};

export const PLAYER_AVATARS = ['🧙', '⚔️', '🛡️', '🏹', '🔮', '👑', '🦅', '🐉', '🌙', '⭐'];
