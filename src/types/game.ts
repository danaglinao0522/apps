export type CharacterName =
  | 'Merlin'
  | 'Percival'
  | 'Loyal Servant'
  | 'Mordred'
  | 'Morgana'
  | 'Oberon'
  | 'Minion of Mordred';

export type Alignment = 'good' | 'evil';

export interface CharacterDef {
  name: CharacterName;
  alignment: Alignment;
  description: string;
  special?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string; // emoji
  isHost: boolean;
  character?: CharacterName;
  alignment?: Alignment;
  isConnected: boolean;
}

export type QuestResult = 'success' | 'fail' | null;

export interface Quest {
  index: number; // 0-4
  teamSize: number;
  requiresTwoFails: boolean;
  team: string[]; // player ids
  votes: Record<string, 'approve' | 'reject'>; // team vote
  questVotes: Record<string, 'success' | 'fail'>; // quest vote
  result: QuestResult;
  leaderIndex: number; // index into players array
  voteRound: number; // 1-5 (5th consecutive reject = evil wins)
}

export type GamePhase =
  | 'lobby'
  | 'character-selection' // host selects characters
  | 'role-reveal'         // each player sees their role privately
  | 'team-building'       // leader picks team
  | 'team-vote'           // everyone approves/rejects
  | 'team-vote-result'    // show vote results
  | 'quest'               // selected team votes success/fail
  | 'quest-result'        // show quest result
  | 'assassin'            // evil tries to assassinate Merlin
  | 'game-over';

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  hostId: string;
  availableCharacters: CharacterName[];
  quests: Quest[];
  currentQuestIndex: number;
  currentLeaderIndex: number;
  goodScore: number;
  evilScore: number;
  winner: 'good' | 'evil' | null;
  assassinTarget: string | null; // player id
  voteTrack: number; // consecutive rejected teams (0-4)
  rejectedTeams: number;
}

// Messages sent over PeerJS
export type MessageType =
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'STATE_UPDATE'
  | 'HOST_ACTION'
  | 'PLAYER_ACTION';

export interface PeerMessage {
  type: MessageType;
  payload: unknown;
}

// Host actions
export type HostActionType =
  | 'OPEN_CHARACTER_SELECTION'
  | 'START_GAME'
  | 'SET_CHARACTERS'
  | 'START_TEAM_VOTE'
  | 'START_QUEST_VOTE'
  | 'NEXT_PHASE'
  | 'SELECT_TEAM_MEMBER'
  | 'REMOVE_TEAM_MEMBER'
  | 'CONFIRM_ASSASSIN';

// Player actions
export type PlayerActionType =
  | 'VOTE_TEAM'
  | 'VOTE_QUEST'
  | 'SELECT_ASSASSIN_TARGET';
