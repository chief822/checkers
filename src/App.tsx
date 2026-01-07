import { useCallback, useEffect } from 'react';
import { ConnectionScreen } from '@/components/ConnectionScreen';
import { GameScreen } from '@/components/GameScreen';
import { useWebRTC } from '@/hooks/useWebRTC';
import { P2PMessage, Player } from '@/types/game';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const handleP2PMessage = useCallback((message: P2PMessage) => {
    if ((window as any).handleP2PMessage) {
      (window as any).handleP2PMessage(message);
    }
  }, []);

  const {
    connectionStatus,
    createGame,
    joinGameRef,
    sendMessage,
    connectionCode,
    error,
    isHost
  } = useWebRTC(handleP2PMessage);

  const localPlayer: Player = isHost ? 1 : 2;

  useEffect(() => {
    console.log('Connection status:', connectionStatus);
  }, [connectionStatus]);

  if (connectionStatus === 'connected') 
  {
    return (
      <>
        <GameScreen
          localPlayer={localPlayer}
          isHost={isHost}
          onSendP2PMessage={sendMessage}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <ConnectionScreen
        onCreateGame={createGame}
        onJoinGameRef={joinGameRef}
        connectionCode={connectionCode}
        status={connectionStatus}
        error={error}
      />
      <Toaster />
    </>
  );
}

export default App;
