export type Player = 1 | 2;

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  player: Player;
  isKing: boolean;
}

export type Board = (Piece | null)[][];

export interface Move {
  from: Position;
  to: Position;
  captured?: Position[];
}

export interface GameState {
  board: Board;
  game: any;
  currentPlayer: Player;
  selectedPosition: Position | null;
  validMoves: Position[];
  gameOver: true | false;
  winner: Player | null;
}

export interface ChatMessage {
  id: string;
  sender: 'local' | 'remote';
  text: string;
  timestamp: number;
}

export type ConnectionStatus = 'idle' | 'creating' | 'waiting_for_guest' | 'waiting_for_host' | 'connected' | 'error';

export interface P2PMessage {
  type: 'move' | 'chat' | 'reset';
  data: any;
}
