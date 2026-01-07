import { Board, Piece, Position, Move, Player } from '@/types/game';

export const BOARD_SIZE = 8;

export function initializeBoard(): Board {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  
  // Place player 2 pieces (black) on top
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 2, isKing: false };
      }
    }
  }
  
  // Place player 1 pieces (red) on bottom
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 1, isKing: false };
      }
    }
  }
  
  return board;
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function getValidMoves(board: Board, pos: Position, mustCapture: boolean): Position[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];
  
  const captures = getCapturesMoves(board, pos);
  
  if (mustCapture) {
    return captures;
  }
  
  if (captures.length > 0) {
    return captures;
  }
  
  return getSimpleMoves(board, pos);
}

function getSimpleMoves(board: Board, pos: Position): Position[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  const directions = piece.isKing 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
    : piece.player === 1 
      ? [[-1, -1], [-1, 1]] 
      : [[1, -1], [1, 1]];
  
  for (const [dRow, dCol] of directions) {
    const newPos = { row: pos.row + dRow, col: pos.col + dCol };
    if (isValidPosition(newPos) && !board[newPos.row][newPos.col]) {
      moves.push(newPos);
    }
  }
  
  return moves;
}

function getCapturesMoves(board: Board, pos: Position): Position[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];
  
  const captures: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  
  for (const [dRow, dCol] of directions) {
    if (!piece.isKing) {
      if (piece.player === 1 && dRow > 0) continue;
      if (piece.player === 2 && dRow < 0) continue;
    }
    
    const jumpOver = { row: pos.row + dRow, col: pos.col + dCol };
    const landOn = { row: pos.row + 2 * dRow, col: pos.col + 2 * dCol };
    
    if (isValidPosition(landOn)) {
      const jumpedPiece = board[jumpOver.row][jumpOver.col];
      const landingSquare = board[landOn.row][landOn.col];
      
      if (jumpedPiece && jumpedPiece.player !== piece.player && !landingSquare) {
        captures.push(landOn);
      }
    }
  }
  
  return captures;
}

export function hasCaptures(board: Board, player: Player): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const captures = getCapturesMoves(board, { row, col });
        if (captures.length > 0) return true;
      }
    }
  }
  return false;
}

export function makeMove(board: Board, from: Position, to: Position): Board {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) return newBoard;
  
  // Move the piece
  newBoard[to.row][to.col] = { ...piece };
  newBoard[from.row][from.col] = null;
  
  // Check for capture
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  
  if (Math.abs(rowDiff) === 2) {
    const capturedRow = from.row + rowDiff / 2;
    const capturedCol = from.col + colDiff / 2;
    newBoard[capturedRow][capturedCol] = null;
  }
  
  // Check for king promotion
  if (piece.player === 1 && to.row === 0) {
    newBoard[to.row][to.col]!.isKing = true;
  } else if (piece.player === 2 && to.row === BOARD_SIZE - 1) {
    newBoard[to.row][to.col]!.isKing = true;
  }
  
  return newBoard;
}

export function checkWinner(board: Board, currentPlayer: Player): Player | null {
  let player1Pieces = 0;
  let player2Pieces = 0;
  let player1CanMove = false;
  let player2CanMove = false;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.player === 1) {
          player1Pieces++;
          if (getValidMoves(board, { row, col }, false).length > 0) {
            player1CanMove = true;
          }
        } else {
          player2Pieces++;
          if (getValidMoves(board, { row, col }, false).length > 0) {
            player2CanMove = true;
          }
        }
      }
    }
  }
  
  if (player1Pieces === 0 || (currentPlayer === 1 && !player1CanMove)) {
    return 2;
  }
  
  if (player2Pieces === 0 || (currentPlayer === 2 && !player2CanMove)) {
    return 1;
  }
  
  return null;
}
