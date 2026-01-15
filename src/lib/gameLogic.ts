import { Board, Piece, Position, Player } from '@/types/game';
import { CheckersGame, Move } from './checkersEngine'; // no types provided

export const BOARD_SIZE = 8;

export function createGame() {
  const game = new CheckersGame();

  return game as any;
}

export function boardFromDraughts(game: any): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );

  const draughtsBoard = game.board;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = draughtsBoard[row][col];
      if (!cell) continue;
  
      const isKing = cell.isKing;
  
      board[row][col] = {
        player: cell.player === 1 ? 1 : 2,
        isKing: isKing,
      };
    }
  }

  return board;
}

export function initializeBoard(): {
  game: any;
  board: Board;
} {
  const game = createGame();
  const board = boardFromDraughts(game);

  return { game, board };
}


export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

// function and method both have same names so just a note
export function getValidMoves(game: any, pos: Position): Position[] {
  const {row, col} = pos;
  const moves = game.getValidMoves(row, col);
  const movesList: Position[] = moves.map(move => ({
    row: move.to.r,
    col: move.to.c
  }));
  console.log(movesList);
  console.log(moves);
  return movesList
}

export function makeMove(game: any, from: Position, to: Position): Board {
  // 1. Get the full move objects from the engine
  const moves: Move[] = game.getValidMoves(from.row, from.col);
  
  // 2. Find the specific move object that matches the destination
  const targetMove = moves.find((m: any) => m.to.r === to.row && m.to.c === to.col);

  // 3. Safety Check: If no move was found, don't call the engine!
  if (!targetMove) {
    console.error("Invalid move attempted: Move object not found in valid moves list.");
    return boardFromDraughts(game); // Return current board unchanged
  }

  // 4. Execute the move using the FULL object
  const result = game.move(targetMove);

  if (!result.success) {
    console.error("Engine rejected move:", result);
  }

  return boardFromDraughts(game);
}
