import { CharacterName, GameState, Player, Quest, QuestResult } from '../types/game';
import { CHARACTER_DEFS, EVIL_COUNTS, QUEST_CONFIGS } from '../data/characters';

export function assignCharacters(players: Player[], selectedChars: CharacterName[]): Player[] {
  const shuffled = [...selectedChars].sort(() => Math.random() - 0.5);
  return players.map((p, i) => ({
    ...p,
    character: shuffled[i],
    alignment: CHARACTER_DEFS[shuffled[i]].alignment,
  }));
}

export function buildInitialQuests(playerCount: number): Quest[] {
  const config = QUEST_CONFIGS[playerCount];
  return config.teamSizes.map((size, i) => ({
    index: i,
    teamSize: size,
    requiresTwoFails: config.twoFails.includes(i),
    team: [],
    votes: {},
    questVotes: {},
    result: null,
    leaderIndex: 0,
    voteRound: 1,
  }));
}

export function getRequiredEvilCount(playerCount: number): number {
  return EVIL_COUNTS[playerCount] ?? 2;
}

export function getRequiredGoodCount(playerCount: number): number {
  return playerCount - getRequiredEvilCount(playerCount);
}

export function getDefaultCharacters(playerCount: number): CharacterName[] {
  const evilCount = getRequiredEvilCount(playerCount);
  const goodCount = playerCount - evilCount;

  const goodChars: CharacterName[] = ['Merlin'];
  for (let i = 1; i < goodCount; i++) {
    goodChars.push('Loyal Servant');
  }

  const evilChars: CharacterName[] = [];
  for (let i = 0; i < evilCount; i++) {
    evilChars.push('Minion of Mordred');
  }

  return [...goodChars, ...evilChars];
}

export function validateCharacterSelection(
  selected: CharacterName[],
  playerCount: number
): { valid: boolean; error?: string } {
  const evilCount = getRequiredEvilCount(playerCount);
  const goodCount = playerCount - evilCount;

  if (selected.length !== playerCount) {
    return { valid: false, error: `Need exactly ${playerCount} characters.` };
  }

  const evil = selected.filter(c => CHARACTER_DEFS[c].alignment === 'evil');
  const good = selected.filter(c => CHARACTER_DEFS[c].alignment === 'good');

  if (evil.length !== evilCount) {
    return { valid: false, error: `Need exactly ${evilCount} evil characters for ${playerCount} players.` };
  }
  if (good.length !== goodCount) {
    return { valid: false, error: `Need exactly ${goodCount} good characters for ${playerCount} players.` };
  }

  // Morgana requires Merlin (or at least Percival)
  if (selected.includes('Morgana') && !selected.includes('Percival')) {
    return { valid: false, error: 'Morgana requires Percival to be in the game.' };
  }

  return { valid: true };
}

export function resolveQuestResult(quest: Quest): QuestResult {
  const failCount = Object.values(quest.questVotes).filter(v => v === 'fail').length;
  if (quest.requiresTwoFails) {
    return failCount >= 2 ? 'fail' : 'success';
  }
  return failCount >= 1 ? 'fail' : 'success';
}

export function checkWinCondition(state: GameState): 'good' | 'evil' | null {
  if (state.goodScore >= 3) return 'good';
  if (state.evilScore >= 3) return 'evil';
  return null;
}

// What a player sees based on their character
export interface PlayerKnowledge {
  knownEvil: string[];       // player ids known to be evil
  knownMerlinMorgana: string[]; // Merlin/Morgana visible to Percival
  knownAllies: string[];     // evil player's allies
  knownMerlin: string[];     // Morgana sees Merlin
}

export function computePlayerKnowledge(
  myId: string,
  players: Player[]
): PlayerKnowledge {
  const me = players.find(p => p.id === myId);
  if (!me || !me.character) return { knownEvil: [], knownMerlinMorgana: [], knownAllies: [], knownMerlin: [] };

  const result: PlayerKnowledge = {
    knownEvil: [],
    knownMerlinMorgana: [],
    knownAllies: [],
    knownMerlin: [],
  };

  if (me.character === 'Merlin') {
    // Merlin sees all evil except Mordred
    result.knownEvil = players
      .filter(p => p.id !== myId && p.alignment === 'evil' && p.character !== 'Mordred')
      .map(p => p.id);
  }

  if (me.character === 'Percival') {
    // Percival sees Merlin and Morgana (but not which is which)
    result.knownMerlinMorgana = players
      .filter(p => p.id !== myId && (p.character === 'Merlin' || p.character === 'Morgana'))
      .map(p => p.id);
  }

  if (me.character === 'Morgana') {
    // Morgana sees Merlin
    result.knownMerlin = players
      .filter(p => p.character === 'Merlin')
      .map(p => p.id);
    // Also knows evil allies (not Oberon)
    result.knownAllies = players
      .filter(p => p.id !== myId && p.alignment === 'evil' && p.character !== 'Oberon')
      .map(p => p.id);
  }

  if (me.alignment === 'evil' && me.character !== 'Oberon') {
    // Evil sees allies except Oberon
    result.knownAllies = players
      .filter(p => p.id !== myId && p.alignment === 'evil' && p.character !== 'Oberon')
      .map(p => p.id);
  }

  return result;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const GOOD_CHARACTERS_LIST: CharacterName[] = ['Merlin', 'Percival', 'Loyal Servant'];
export const EVIL_CHARACTERS_LIST: CharacterName[] = ['Mordred', 'Morgana', 'Oberon', 'Minion of Mordred'];
