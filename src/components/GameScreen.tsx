import { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { ChatPanel } from './ChatPanel';
import { GameState, Position, Player, ChatMessage, P2PMessage } from '@/types/game';
import { initializeBoard, getValidMoves, makeMove } from '@/lib/gameLogic';
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
  const {game, board} = initializeBoard();
  const [gameState, setGameState] = useState<GameState>(() => ({
    board,
    game,
    currentPlayer: game.turn === 1 ? 1 : 2,
    selectedPosition: null,
    validMoves: [],
    gameOver: false,
    winner: null,
  }));

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSquareClick = useCallback((pos: Position) => {
    console.log(localPlayer, gameState.currentPlayer);
    console.log(gameState);
    if (gameState.gameOver || gameState.currentPlayer !== localPlayer) return;
    console.log("here");
    const piece = gameState.board[pos.row][pos.col];

    // If clicking on own piece
    if (piece && piece.player === localPlayer) {
      const moves = getValidMoves(gameState.game, pos);
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
      const newBoard = makeMove(gameState.game, gameState.selectedPosition, pos);
      const winner = gameState.game.getWinner();
      
      const newGameState = {
        board: newBoard,
        game: gameState.game,
        currentPlayer: (gameState.game.turn === 1 ? 1 : 2) as Player,
        selectedPosition: null,
        validMoves: [],
        gameOver: winner !== null,
        winner,
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
      const newBoard = makeMove(gameState.game, from, to);
      const winner: Player | null = gameState.game.getWinner();
      console.log(winner);

      setGameState({
        board: newBoard,
        game: gameState.game,
        currentPlayer: gameState.game.turn === 1 ? 1 : 2,
        selectedPosition: null,
        validMoves: [],
        gameOver: winner !== null,
        winner,
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
      const {game, board} = initializeBoard();
      setGameState({
        board,
        game,
        currentPlayer: gameState.game.turn === 1 ? 1 : 2,
        selectedPosition: null,
        validMoves: [],
        gameOver: false,
        winner: null,
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
    const {game, board} = initializeBoard();
    setGameState({
      board,
      game,
      currentPlayer: gameState.game.turn === 1 ? 1 : 2,
      selectedPosition: null,
      validMoves: [],
      gameOver: false,
      winner: null,
    });
    setMessages([]);
    onSendP2PMessage({ type: 'reset', data: {} });
    toast({
      title: 'Game Reset',
      description: 'Starting a new game',
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-[#292722]">

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="mb-6 flex items-center justify-between border-b border-[#ddd8cf] pb-4">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#292722] text-white">
              <span className="text-sm font-bold">♟</span>
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                P2P Checkers
              </h1>
              <p className="text-[11px] text-[#918b81]">
                Private peer-to-peer game
              </p>
            </div>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            className="h-9 gap-2 rounded-lg border-[#d7d2c9] bg-[#faf9f6] text-sm hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New game
          </Button>

        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

          <div>
            {gameState.gameOver && gameState.winner && (
              <div className="mb-5 rounded-xl border border-[#d9c9a5] bg-[#fffaf0] px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#292722] text-white">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {gameState.winner === localPlayer
                        ? 'You won'
                        : 'Opponent won'}
                    </h2>

                    <p className="text-sm text-[#777168]">
                      {gameState.winner === localPlayer
                        ? 'Congratulations.'
                        : 'Better luck next time.'}
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

          <div className="h-[600px] lg:sticky lg:top-6">
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
