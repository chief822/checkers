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

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(
      move => move.row === row && move.col === col
    );
  };

  const isSelected = (row: number, col: number) => {
    return (
      selectedPosition?.row === row &&
      selectedPosition?.col === col
    );
  };

  const isPlayerTurn = currentPlayer === localPlayer;

  return (
    <div className="mx-auto w-full max-w-[680px]">

      {/* Turn indicator */}
      <div className="mb-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#d9d4cb] bg-[#faf9f6] px-4 py-2 shadow-sm">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              currentPlayer === 1
                ? 'bg-[#b93632]'
                : 'bg-[#252422]'
            }`}
          />

          <span className="text-sm font-medium">
            {isPlayerTurn ? 'Your turn' : "Opponent's turn"}
          </span>

        </div>
      </div>

      {/* Board */}
      <div className="rounded-[18px] bg-[#292722] p-2 shadow-[0_20px_50px_rgba(43,38,30,0.18)]">

        <div
          className={`
            grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[10px]
            ${localPlayer === 2 ? 'rotate-180' : ''}
          `}
        >

          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {

              const isDark =
                (rowIndex + colIndex) % 2 === 1;

              const canClick =
                isDark &&
                (
                  isValidMove(rowIndex, colIndex) ||
                  (piece && piece.player === localPlayer)
                );

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    board-square
                    relative
                    flex items-center justify-center
                    ${isDark ? 'dark' : 'light'}
                    ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''}
                    ${isSelected(rowIndex, colIndex) ? 'selected' : ''}
                    ${!isPlayerTurn ? 'pointer-events-none' : ''}
                    ${localPlayer === 2 ? 'rotate-180' : ''}
                  `}
                  onClick={() =>
                    canClick &&
                    onSquareClick({
                      row: rowIndex,
                      col: colIndex
                    })
                  }
                >

                  {/* Move indicator */}
                  {isValidMove(rowIndex, colIndex) && !piece && (
                    <div className="h-[18%] w-[18%] rounded-full bg-[#292722]/25" />
                  )}

                  {piece && (
                    <div className="flex h-full w-full items-center justify-center">

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

      {/* Players */}
      <div className="mt-5 grid grid-cols-2 gap-3">

        <div
          className={`
            flex items-center gap-3 rounded-xl border px-4 py-3
            ${
              localPlayer === 1
                ? 'border-[#d9cbc9] bg-[#faf6f5]'
                : 'border-[#dedad2] bg-[#faf9f6]'
            }
          `}
        >
          <div className="h-7 w-7 rounded-full bg-[#b93632] shadow-sm" />

          <div>
            <p className="text-xs font-semibold">
              {localPlayer === 1 ? 'You' : 'Opponent'}
            </p>

            <p className="text-[11px] text-[#918b81]">
              Red
            </p>
          </div>
        </div>

        <div
          className={`
            flex items-center gap-3 rounded-xl border px-4 py-3
            ${
              localPlayer === 2
                ? 'border-[#d2d0cc] bg-[#faf9f6]'
                : 'border-[#dedad2] bg-[#faf9f6]'
            }
          `}
        >
          <div className="h-7 w-7 rounded-full bg-[#252422] shadow-sm" />

          <div>
            <p className="text-xs font-semibold">
              {localPlayer === 2 ? 'You' : 'Opponent'}
            </p>

            <p className="text-[11px] text-[#918b81]">
              Black
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// $0.style.transform: 'rotate(180deg)';

// const children = $0.children;
// for (let i = 0; i < children.length; i++) {
//   children[i].style.transform: 'rotate(180deg)';
// }

// -----------------

// await setElementStyles($0, { transform: 'rotate(180deg)' });
// const children = $0.children;
// for (let i = 0; i < children.length; i++) {
//   await setElementStyles(children[i], { transform: 'rotate(180deg)' });
// }