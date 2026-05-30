import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CharacterName,
  GameState,
  HostActionType,
  PeerMessage,
  Player,
  PlayerActionType,
} from '../types/game';
import {
  assignCharacters,
  buildInitialQuests,
  computePlayerKnowledge,
  generateRoomCode,
  PlayerKnowledge,
  resolveQuestResult,
} from '../utils/gameLogic';
import { PLAYER_AVATARS } from '../data/characters';

interface GameContextValue {
  // Local player info
  myId: string;
  myName: string;
  myAvatar: string;

  // Connection state
  isHost: boolean;
  roomCode: string;
  isConnected: boolean;
  connectionError: string | null;

  // Game state
  gameState: GameState | null;
  myKnowledge: PlayerKnowledge;

  // UI state
  cardHidden: boolean;
  setCardHidden: (v: boolean) => void;

  // Actions
  createProfile: (name: string, avatar: string) => void;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;

  // Host actions
  hostAction: (type: HostActionType, payload?: unknown) => void;
  // Player actions
  playerAction: (type: PlayerActionType, payload?: unknown) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const PEER_CONFIG = {
  // Use public PeerJS server
  host: '0.peerjs.com',
  port: 443,
  secure: true,
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [myId] = useState<string>(() => uuidv4());
  const [myName, setMyName] = useState('');
  const [myAvatar, setMyAvatar] = useState(PLAYER_AVATARS[0]);
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [cardHidden, setCardHidden] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const hostConnRef = useRef<DataConnection | null>(null); // client -> host connection
  const clientConnsRef = useRef<Map<string, DataConnection>>(new Map()); // host -> all clients

  const myKnowledge: PlayerKnowledge = gameState
    ? computePlayerKnowledge(myId, gameState.players)
    : { knownEvil: [], knownMerlinMorgana: [], knownAllies: [], knownMerlin: [] };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const broadcastToClients = useCallback((msg: PeerMessage) => {
    clientConnsRef.current.forEach(conn => {
      if (conn.open) conn.send(msg);
    });
  }, []);

  const sendToHost = useCallback((msg: PeerMessage) => {
    if (hostConnRef.current?.open) {
      hostConnRef.current.send(msg);
    }
  }, []);

  // ── Game logic (runs on host) ─────────────────────────────────────────────

  const processHostAction = useCallback(
    (type: HostActionType, payload: unknown, currentState: GameState): GameState => {
      let state = { ...currentState };

      switch (type) {
        case 'OPEN_CHARACTER_SELECTION': {
          state.phase = 'character-selection';
          break;
        }

        case 'SET_CHARACTERS': {
          state.availableCharacters = payload as CharacterName[];
          break;
        }

        case 'START_GAME': {
          const chars = state.availableCharacters;
          const assigned = assignCharacters(state.players, chars);
          const quests = buildInitialQuests(state.players.length);
          quests[0].leaderIndex = 0;
          state = {
            ...state,
            players: assigned,
            quests,
            currentQuestIndex: 0,
            currentLeaderIndex: 0,
            phase: 'role-reveal',
          };
          break;
        }

        case 'NEXT_PHASE': {
          if (state.phase === 'role-reveal') {
            state.phase = 'team-building';
          } else if (state.phase === 'team-vote-result') {
            const quest = state.quests[state.currentQuestIndex];
            const approveCount = Object.values(quest.votes).filter(v => v === 'approve').length;
            const rejectCount = Object.values(quest.votes).filter(v => v === 'reject').length;

            if (approveCount > rejectCount) {
              // Team approved -> quest phase
              state.phase = 'quest';
            } else {
              // Team rejected
              state.voteTrack = (state.voteTrack ?? 0) + 1;
              state.rejectedTeams = (state.rejectedTeams ?? 0) + 1;

              if (state.voteTrack >= 5) {
                // Evil wins by vote track
                state.winner = 'evil';
                state.phase = 'game-over';
              } else {
                // Next leader
                state.currentLeaderIndex = (state.currentLeaderIndex + 1) % state.players.length;
                const newQuests = [...state.quests];
                const newQuest = {
                  ...newQuests[state.currentQuestIndex],
                  team: [],
                  votes: {},
                  questVotes: {},
                  leaderIndex: state.currentLeaderIndex,
                  voteRound: (newQuests[state.currentQuestIndex].voteRound ?? 1) + 1,
                };
                newQuests[state.currentQuestIndex] = newQuest;
                state.quests = newQuests;
                state.phase = 'team-building';
              }
            }
          } else if (state.phase === 'quest-result') {
            const win = state.winner;
            if (win) {
              if (win === 'good') {
                // Check if assassin phase needed
                const hasAssassin = state.players.some(p => p.character === 'Mordred' || p.character === 'Minion of Mordred' || p.character === 'Morgana' || p.character === 'Oberon');
                const hasMerlin = state.players.some(p => p.character === 'Merlin');
                if (hasMerlin && hasAssassin) {
                  state.phase = 'assassin';
                } else {
                  state.phase = 'game-over';
                }
              } else {
                state.phase = 'game-over';
              }
            } else {
              // Next quest
              const nextIdx = state.currentQuestIndex + 1;
              state.currentQuestIndex = nextIdx;
              state.currentLeaderIndex = (state.currentLeaderIndex + 1) % state.players.length;
              state.voteTrack = 0;
              const newQuests = [...state.quests];
              newQuests[nextIdx] = {
                ...newQuests[nextIdx],
                leaderIndex: state.currentLeaderIndex,
              };
              state.quests = newQuests;
              state.phase = 'team-building';
            }
          }
          break;
        }

        case 'SELECT_TEAM_MEMBER': {
          const pid = payload as string;
          const qi = state.currentQuestIndex;
          const quest = state.quests[qi];
          if (quest.team.includes(pid)) break;
          if (quest.team.length >= quest.teamSize) break;
          const newQuests = [...state.quests];
          newQuests[qi] = { ...quest, team: [...quest.team, pid] };
          state.quests = newQuests;
          break;
        }

        case 'REMOVE_TEAM_MEMBER': {
          const pid = payload as string;
          const qi = state.currentQuestIndex;
          const quest = state.quests[qi];
          const newQuests = [...state.quests];
          newQuests[qi] = { ...quest, team: quest.team.filter(id => id !== pid) };
          state.quests = newQuests;
          break;
        }

        case 'START_TEAM_VOTE': {
          state.phase = 'team-vote';
          break;
        }

        case 'START_QUEST_VOTE': {
          state.phase = 'quest';
          break;
        }

        case 'CONFIRM_ASSASSIN': {
          const targetId = payload as string;
          state.assassinTarget = targetId;
          const target = state.players.find(p => p.id === targetId);
          if (target?.character === 'Merlin') {
            state.winner = 'evil';
          } else {
            state.winner = 'good';
          }
          state.phase = 'game-over';
          break;
        }
      }

      return state;
    },
    []
  );

  const processPlayerAction = useCallback(
    (playerId: string, type: PlayerActionType, payload: unknown, currentState: GameState): GameState => {
      let state = { ...currentState };

      switch (type) {
        case 'VOTE_TEAM': {
          const vote = payload as 'approve' | 'reject';
          const qi = state.currentQuestIndex;
          const newQuests = [...state.quests];
          const quest = { ...newQuests[qi] };
          quest.votes = { ...quest.votes, [playerId]: vote };
          newQuests[qi] = quest;
          state.quests = newQuests;

          // Check if everyone voted
          if (Object.keys(quest.votes).length === state.players.length) {
            state.phase = 'team-vote-result';
          }
          break;
        }

        case 'VOTE_QUEST': {
          const vote = payload as 'success' | 'fail';
          const qi = state.currentQuestIndex;
          const quest = state.quests[qi];

          // Only team members can vote on quest
          if (!quest.team.includes(playerId)) break;

          const newQuests = [...state.quests];
          const newQuest = { ...quest };
          newQuest.questVotes = { ...quest.questVotes, [playerId]: vote };
          newQuests[qi] = newQuest;
          state.quests = newQuests;

          // Check if all team members voted
          if (Object.keys(newQuest.questVotes).length === quest.team.length) {
            const result = resolveQuestResult(newQuest);
            newQuests[qi] = { ...newQuest, result };
            state.quests = newQuests;

            if (result === 'success') {
              state.goodScore = (state.goodScore ?? 0) + 1;
            } else {
              state.evilScore = (state.evilScore ?? 0) + 1;
            }

            if (state.goodScore >= 3) state.winner = 'good';
            if (state.evilScore >= 3) state.winner = 'evil';

            state.phase = 'quest-result';
          }
          break;
        }

        case 'SELECT_ASSASSIN_TARGET': {
          state.assassinTarget = payload as string;
          break;
        }
      }

      return state;
    },
    []
  );

  // ── Peer setup ────────────────────────────────────────────────────────────

  const setupPeer = useCallback((peerId: string): Promise<Peer> => {
    return new Promise((resolve, reject) => {
      const peer = new Peer(peerId, PEER_CONFIG as object);
      peer.on('open', () => resolve(peer));
      peer.on('error', (err) => {
        setConnectionError(err.message);
        reject(err);
      });
      peerRef.current = peer;
    });
  }, []);

  // ── Create Room (Host) ────────────────────────────────────────────────────

  const createRoom = useCallback(async () => {
    if (!myName.trim()) return;
    try {
      setConnectionError(null);
      const code = generateRoomCode();
      const hostPeerId = `avalon-host-${code}`;
      const peer = await setupPeer(hostPeerId);

      const initialState: GameState = {
        roomCode: code,
        phase: 'lobby',
        players: [
          {
            id: myId,
            name: myName,
            avatar: myAvatar,
            isHost: true,
            isConnected: true,
          },
        ],
        hostId: myId,
        availableCharacters: [],
        quests: [],
        currentQuestIndex: 0,
        currentLeaderIndex: 0,
        goodScore: 0,
        evilScore: 0,
        winner: null,
        assassinTarget: null,
        voteTrack: 0,
        rejectedTeams: 0,
      };

      setGameState(initialState);
      setRoomCode(code);
      setIsHost(true);
      setIsConnected(true);

      // Listen for incoming connections
      peer.on('connection', (conn) => {
        clientConnsRef.current.set(conn.peer, conn);

        conn.on('open', () => {
          // Send current state to new client
          conn.send({ type: 'STATE_UPDATE', payload: gameStateRef.current });
        });

        conn.on('data', (raw) => {
          const msg = raw as PeerMessage;
          if (msg.type === 'PLAYER_JOIN') {
            const player = msg.payload as Player;
            setGameState(prev => {
              if (!prev) return prev;
              const exists = prev.players.find(p => p.id === player.id);
              if (exists) {
                const updated = { ...prev, players: prev.players.map(p => p.id === player.id ? { ...p, isConnected: true } : p) };
                broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
                return updated;
              }
              const updated = { ...prev, players: [...prev.players, player] };
              broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
              return updated;
            });
          } else if (msg.type === 'HOST_ACTION') {
            const { type: actionType, payload: actionPayload } = msg.payload as { type: HostActionType; payload: unknown };
            setGameState(prev => {
              if (!prev) return prev;
              const updated = processHostAction(actionType, actionPayload, prev);
              broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
              return updated;
            });
          } else if (msg.type === 'PLAYER_ACTION') {
            const { playerId, type: actionType, payload: actionPayload } = msg.payload as {
              playerId: string;
              type: PlayerActionType;
              payload: unknown;
            };
            setGameState(prev => {
              if (!prev) return prev;
              const updated = processPlayerAction(playerId, actionType, actionPayload, prev);
              broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
              return updated;
            });
          }
        });

        conn.on('close', () => {
          setGameState(prev => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              players: prev.players.map(p =>
                clientConnsRef.current.get(conn.peer) ? { ...p } : p
              ),
            };
            return updated;
          });
          clientConnsRef.current.delete(conn.peer);
        });
      });
    } catch (e) {
      setConnectionError((e as Error).message);
    }
  }, [myId, myName, myAvatar, setupPeer, broadcastToClients, processHostAction, processPlayerAction]);

  // We need a ref to always get the latest gameState in the peer callback
  const gameStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ── Join Room (Client) ────────────────────────────────────────────────────

  const joinRoom = useCallback(async (code: string) => {
    if (!myName.trim()) return;
    try {
      setConnectionError(null);
      const clientPeerId = `avalon-client-${myId}`;
      const peer = await setupPeer(clientPeerId);
      const hostPeerId = `avalon-host-${code.toUpperCase()}`;

      const conn = peer.connect(hostPeerId, { reliable: true });
      hostConnRef.current = conn;

      conn.on('open', () => {
        setIsConnected(true);
        setRoomCode(code.toUpperCase());
        const myPlayer: Player = {
          id: myId,
          name: myName,
          avatar: myAvatar,
          isHost: false,
          isConnected: true,
        };
        conn.send({ type: 'PLAYER_JOIN', payload: myPlayer });
      });

      conn.on('data', (raw) => {
        const msg = raw as PeerMessage;
        if (msg.type === 'STATE_UPDATE') {
          setGameState(msg.payload as GameState);
        }
      });

      conn.on('close', () => {
        setIsConnected(false);
        setConnectionError('Disconnected from host.');
      });

      conn.on('error', (err) => {
        setConnectionError(err.message);
      });

      peer.on('error', (err) => {
        setConnectionError(`Could not connect: ${err.message}`);
      });
    } catch (e) {
      setConnectionError((e as Error).message);
    }
  }, [myId, myName, myAvatar, setupPeer]);

  // ── Leave Room ────────────────────────────────────────────────────────────

  const leaveRoom = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    hostConnRef.current = null;
    clientConnsRef.current.clear();
    setGameState(null);
    setIsHost(false);
    setRoomCode('');
    setIsConnected(false);
    setConnectionError(null);
  }, []);

  // ── Host Action ───────────────────────────────────────────────────────────

  const hostAction = useCallback(
    (type: HostActionType, payload?: unknown) => {
      if (isHost) {
        // Process directly
        setGameState(prev => {
          if (!prev) return prev;
          const updated = processHostAction(type, payload, prev);
          broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
          return updated;
        });
      } else {
        sendToHost({ type: 'HOST_ACTION', payload: { type, payload } });
      }
    },
    [isHost, processHostAction, broadcastToClients, sendToHost]
  );

  // ── Player Action ─────────────────────────────────────────────────────────

  const playerAction = useCallback(
    (type: PlayerActionType, payload?: unknown) => {
      if (isHost) {
        setGameState(prev => {
          if (!prev) return prev;
          const updated = processPlayerAction(myId, type, payload, prev);
          broadcastToClients({ type: 'STATE_UPDATE', payload: updated });
          return updated;
        });
      } else {
        sendToHost({
          type: 'PLAYER_ACTION',
          payload: { playerId: myId, type, payload },
        });
      }
    },
    [isHost, myId, processPlayerAction, broadcastToClients, sendToHost]
  );

  // ── Profile ───────────────────────────────────────────────────────────────

  const createProfile = useCallback((name: string, avatar: string) => {
    setMyName(name);
    setMyAvatar(avatar);
  }, []);

  return (
    <GameContext.Provider
      value={{
        myId,
        myName,
        myAvatar,
        isHost,
        roomCode,
        isConnected,
        connectionError,
        gameState,
        myKnowledge,
        cardHidden,
        setCardHidden,
        createProfile,
        createRoom,
        joinRoom,
        leaveRoom,
        hostAction,
        playerAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
