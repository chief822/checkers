import { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { GameState, Position, Player, ChatMessage, P2PMessage } from '@/types/game';
import { initializeBoard, getValidMoves, makeMove, hasCaptures, checkWinner } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameScreenProps {
  localPlayer: Player;
  isHost: boolean;
  onSendP2PMessage: (message: P2PMessage) => void;
}

export function GameScreen({ localPlayer, isHost, onSendP2PMessage }: GameScreenProps) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 1,
    selectedPosition: null,
    validMoves: [],
    gameOver: false,
    winner: null,
    mustCapture: false
  }));

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const mustCapture = hasCaptures(gameState.board, gameState.currentPlayer);
    setGameState(prev => ({ ...prev, mustCapture }));
  }, [gameState.board, gameState.currentPlayer]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameState.gameOver || gameState.currentPlayer !== localPlayer) return;

    const piece = gameState.board[pos.row][pos.col];

    // If clicking on own piece
    if (piece && piece.player === localPlayer) {
      const moves = getValidMoves(gameState.board, pos, gameState.mustCapture);
      setGameState(prev => ({
        ...prev,
        selectedPosition: pos,
        validMoves: moves
      }));
      return;
    }

    // If clicking on valid move
    if (gameState.selectedPosition && gameState.validMoves.some(
      m => m.row === pos.row && m.col === pos.col
    )) {
      const newBoard = makeMove(gameState.board, gameState.selectedPosition, pos);
      const winner = checkWinner(newBoard, gameState.currentPlayer === 1 ? 2 : 1);
      
      const newGameState = {
        board: newBoard,
        currentPlayer: (gameState.currentPlayer === 1 ? 2 : 1) as Player,
        selectedPosition: null,
        validMoves: [],
        gameOver: winner !== null,
        winner,
        mustCapture: false
      };

      setGameState(newGameState);

      // Send move to opponent
      onSendP2PMessage({
        type: 'move',
        data: {
          from: gameState.selectedPosition,
          to: pos
        }
      });

      if (winner) {
        toast({
          title: winner === localPlayer ? '🎉 You Won!' : '😔 You Lost',
          description: winner === localPlayer ? 'Congratulations!' : 'Better luck next time!',
        });
      }
    }
  }, [gameState, localPlayer, onSendP2PMessage, toast]);

  const handleSendMessage = useCallback((text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'local',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, message]);

    onSendP2PMessage({
      type: 'chat',
      data: { text }
    });
  }, [onSendP2PMessage]);

  const handleIncomingMessage = useCallback((message: P2PMessage) => {
    if (message.type === 'move') {
      const { from, to } = message.data;
      const newBoard = makeMove(gameState.board, from, to);
      const winner = checkWinner(newBoard, gameState.currentPlayer === 1 ? 2 : 1);

      setGameState({
        board: newBoard,
        currentPlayer: (gameState.currentPlayer === 1 ? 2 : 1) as Player,
        selectedPosition: null,
        validMoves: [],
        gameOver: winner !== null,
        winner,
        mustCapture: false
      });

      if (winner) {
        toast({
          title: winner === localPlayer ? '🎉 You Won!' : '😔 You Lost',
          description: winner === localPlayer ? 'Congratulations!' : 'Better luck next time!',
        });
      }
    } else if (message.type === 'chat') {
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'remote',
        text: message.data.text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, chatMessage]);
    } else if (message.type === 'reset') {
      setGameState({
        board: initializeBoard(),
        currentPlayer: 1,
        selectedPosition: null,
        validMoves: [],
        gameOver: false,
        winner: null,
        mustCapture: false
      });
      setMessages([]);
      toast({
        title: 'Game Reset',
        description: 'Your opponent started a new game',
      });
    }
  }, [gameState.board, gameState.currentPlayer, localPlayer, toast]);

  // Expose message handler
  useEffect(() => {
    (window as any).handleP2PMessage = handleIncomingMessage;
    return () => {
      delete (window as any).handleP2PMessage;
    };
  }, [handleIncomingMessage]);

  const handleReset = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 1,
      selectedPosition: null,
      validMoves: [],
      gameOver: false,
      winner: null,
      mustCapture: false
    });
    setMessages([]);
    onSendP2PMessage({ type: 'reset', data: {} });
    toast({
      title: 'Game Reset',
      description: 'Starting a new game',
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            P2P Checkers
          </h1>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div>
            {gameState.gameOver && gameState.winner && (
              <div className="mb-6 p-6 bg-card rounded-lg border-2 border-primary animate-glow">
                <div className="flex items-center gap-4">
                  <Trophy className="w-12 h-12 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {gameState.winner === localPlayer ? 'You Won!' : 'Opponent Won!'}
                    </h2>
                    <p className="text-muted-foreground">
                      {gameState.winner === localPlayer ? 'Congratulations!' : 'Better luck next time!'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <GameBoard
              board={gameState.board}
              selectedPosition={gameState.selectedPosition}
              validMoves={gameState.validMoves}
              onSquareClick={handleSquareClick}
              currentPlayer={gameState.currentPlayer}
              localPlayer={localPlayer}
            />
          </div>

          <div className="h-[600px]">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
