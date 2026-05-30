import { GameProvider, useGame } from './context/GameContext';
import ProfileScreen from './components/ProfileScreen';
import LobbyScreen from './components/LobbyScreen';
import CharacterSelectionScreen from './components/CharacterSelectionScreen';
import RoleRevealScreen from './components/RoleRevealScreen';
import TeamBuildingScreen from './components/TeamBuildingScreen';
import TeamVoteScreen from './components/TeamVoteScreen';
import TeamVoteResultScreen from './components/TeamVoteResultScreen';
import QuestVoteScreen from './components/QuestVoteScreen';
import QuestResultScreen from './components/QuestResultScreen';
import AssassinScreen from './components/AssassinScreen';
import GameOverScreen from './components/GameOverScreen';

function Router() {
  const { myName, gameState } = useGame();

  // No profile yet
  if (!myName) {
    return <ProfileScreen />;
  }

  // No game state or not in a room
  if (!gameState) {
    return <LobbyScreen />;
  }

  // Route based on game phase
  switch (gameState.phase) {
    case 'lobby':
      return <LobbyScreen />;
    case 'character-selection':
      return <CharacterSelectionScreen />;
    case 'role-reveal':
      return <RoleRevealScreen />;
    case 'team-building':
      return <TeamBuildingScreen />;
    case 'team-vote':
      return <TeamVoteScreen />;
    case 'team-vote-result':
      return <TeamVoteResultScreen />;
    case 'quest':
      return <QuestVoteScreen />;
    case 'quest-result':
      return <QuestResultScreen />;
    case 'assassin':
      return <AssassinScreen />;
    case 'game-over':
      return <GameOverScreen />;
    default:
      return <LobbyScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="max-w-sm mx-auto min-h-screen">
        <Router />
      </div>
    </GameProvider>
  );
}
