export interface Position {
  r: number;
  c: number;
}

export interface Piece {
  player: 1 | 2;
  r: number;
  c: number;
  isKing: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  isJump: boolean;
  captured?: Position | null;
}

export interface MoveResult {
  success: boolean;
  turnChanged: boolean;
  winner: 1 | 2 | null;
}

export class CheckersGame {
  public board: (Piece | null)[][];
  public turn: 1 | 2;
  public score: { 1: number; 2: number };
  public activePiece: Position | null;

  constructor() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 1;
    this.score = { 1: 0, 2: 0 };
    this.activePiece = null;
    this.reset();
  }

  reset(): void {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 1;
    this.score = { 1: 0, 2: 0 };
    this.activePiece = null;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) this._addPiece(r, c, 2); // Player 2 at top
          if (r > 4) this._addPiece(r, c, 1); // Player 1 at bottom
        }
      }
    }
  }

  private _addPiece(r: number, c: number, player: 1 | 2): void {
    this.board[r][c] = { player, r, c, isKing: false };
  }

  getWinner(): 1 | 2 | null {
    if (this.score[1] === 12) return 1;
    if (this.score[2] === 12) return 2;
    return null;
  }

  getValidMoves(r: number, c: number): Move[] {
    const piece = this.board[r][c];
    if (!piece || piece.player !== this.turn || this.getWinner() !== null) return [];

    if (this.activePiece && (this.activePiece.r !== r || this.activePiece.c !== c)) {
      return [];
    }

    const globalJumpAvailable = this._checkGlobalJumpAvailable();
    const moves = this._generateMovesForPiece(piece);

    return globalJumpAvailable ? moves.filter(m => m.isJump) : moves;
  }

  move(moveObj: Move): MoveResult {
    const validMoves = this.getValidMoves(moveObj.from.r, moveObj.from.c);
    const isValid = validMoves.some(m => m.to.r === moveObj.to.r && m.to.c === moveObj.to.c);

    if (!isValid) return { success: false, turnChanged: false, winner: this.getWinner() };

    const piece = this.board[moveObj.from.r][moveObj.from.c]!;
    this.board[moveObj.from.r][moveObj.from.c] = null;
    this.board[moveObj.to.r][moveObj.to.c] = piece;
    piece.r = moveObj.to.r;
    piece.c = moveObj.to.c;

    if (moveObj.isJump && moveObj.captured) {
      this.board[moveObj.captured.r][moveObj.captured.c] = null;
      this.score[piece.player]++;
    }

    if (!piece.isKing) {
      if ((piece.player === 1 && piece.r === 0) || (piece.player === 2 && piece.r === 7)) {
        piece.isKing = true;
      }
    }

    let turnChanged = true;
    if (moveObj.isJump) {
      const canJumpAgain = this._generateMovesForPiece(piece).some(m => m.isJump);
      if (canJumpAgain) {
        this.activePiece = { r: piece.r, c: piece.c };
        turnChanged = false;
      }
    }

    if (turnChanged) {
      this.turn = this.turn === 1 ? 2 : 1;
      this.activePiece = null;
    }

    return { success: true, turnChanged, winner: this.getWinner() };
  }

  private _checkGlobalJumpAvailable(): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.player === this.turn) {
          if (this._generateMovesForPiece(p).some(m => m.isJump)) return true;
        }
      }
    }
    return false;
  }

  private _generateMovesForPiece(piece: Piece): Move[] {
    const moves: Move[] = [];
    const rowDirs = piece.isKing ? [1, -1] : [piece.player === 1 ? -1 : 1];
    const colDirs = [-1, 1];

    rowDirs.forEach(dr => {
      colDirs.forEach(dc => {
        const r1 = piece.r + dr, c1 = piece.c + dc;
        if (this._isValid(r1, c1) && !this.board[r1][c1] && !this.activePiece) {
          moves.push({ from: { r: piece.r, c: piece.c }, to: { r: r1, c: c1 }, isJump: false });
        }
        const r2 = piece.r + dr * 2, c2 = piece.c + dc * 2;
        if (this._isValid(r2, c2) && !this.board[r2][c2]) {
          const mid = this.board[r1]?.[c1];
          if (mid && mid.player !== piece.player) {
            moves.push({ from: { r: piece.r, c: piece.c }, to: { r: r2, c: c2 }, isJump: true, captured: { r: r1, c: c1 } });
          }
        }
      });
    });
    return moves;
  }

  private _isValid(r: number, c: number) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
}