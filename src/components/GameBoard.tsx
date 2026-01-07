import { Position, Board, Player } from '@/types/game';

interface GameBoardProps {
  board: Board;
  selectedPosition: Position | null;
  validMoves: Position[];
  onSquareClick: (pos: Position) => void;
  currentPlayer: Player;
  localPlayer: Player;
}

export function GameBoard({
  board,
  selectedPosition,
  validMoves,
  onSquareClick,
  currentPlayer,
  localPlayer
}: GameBoardProps) {
  const displayBoard = localPlayer === 1 ? board : [...board].reverse();
  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const isPlayerTurn = currentPlayer === localPlayer;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-card rounded-lg border">
          <div className={`w-4 h-4 rounded-full ${currentPlayer === 1 ? 'bg-player1' : 'bg-player2 border-2 border-gray-400'}`} />
          <span className="font-semibold">
            {isPlayerTurn ? "Your Turn" : "Opponent's Turn"}
          </span>
        </div>
      </div>

      <div className="aspect-square bg-card rounded-lg shadow-2xl p-2 border-4 border-border">
        <div className={`grid grid-cols-8 gap-0 h-full w-full`}>
          {displayBoard.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const canClick = isDark && (isValidMove(rowIndex, colIndex) || (piece && piece.player === localPlayer));
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    board-square
                    ${isDark ? 'dark' : 'light'}
                    ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''}
                    ${isSelected(rowIndex, colIndex) ? 'selected' : ''}
                    ${!isPlayerTurn ? 'pointer-events-none' : ''}
                  `}
                  onClick={() => canClick && onSquareClick({ row: rowIndex, col: colIndex })}
                >
                  {piece && (
                    <div className="w-[85%] h-[85%]">
                      <div
                        className={`
                          checker-piece
                          player${piece.player}
                          ${piece.isKing ? 'king' : ''}
                        `}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-player1 shadow-md" />
          <span className={localPlayer === 1 ? 'font-bold' : ''}>
            {localPlayer === 1 ? 'You (Red)' : 'Opponent (Red)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-player2 shadow-md border-2 border-gray-400" />
          <span className={localPlayer === 2 ? 'font-bold' : ''}>
            {localPlayer === 2 ? 'You (Black)' : 'Opponent (Black)'}
          </span>
        </div>
      </div>
    </div>
  );
}


// await setElementStyles($0, {
//   transform: 'rotate(180deg)',
// });

// const children = $0.children;
// for (let i = 0; i < children.length; i++) {
//   await setElementStyles(children[i], {
//     transform: 'rotate(180deg)',
//   });
// }

// -----------------

// await setElementStyles($0, { transform: 'rotate(180deg)' });
// const children = $0.children;
// for (let i = 0; i < children.length; i++) {
//   await setElementStyles(children[i], { transform: 'rotate(180deg)' });
// }