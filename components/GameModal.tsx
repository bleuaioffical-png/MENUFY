import React, { useState, useEffect } from 'react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Player = 'COFFEE' | 'TEA' | null;

export const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isCoffeeTurn, setIsCoffeeTurn] = useState(true);
  const [scores, setScores] = useState({ coffee: 0, tea: 0 });
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBoard(Array(9).fill(null));
      setWinner(null);
      setWinningLine(null);
      setIsCoffeeTurn(true);
    }
  }, [isOpen]);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isCoffeeTurn ? 'COFFEE' : 'TEA';
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner === 'COFFEE' ? 'coffee' : 'tea']: prev[result.winner === 'COFFEE' ? 'coffee' : 'tea'] + 1
      }));
    } else if (!newBoard.includes(null)) {
      setWinner('DRAW');
    } else {
      setIsCoffeeTurn(!isCoffeeTurn);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 bg-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Mini Game</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Coffee vs Tea</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-10 bg-white flex flex-col items-center">
          <div className="flex justify-between w-full mb-10 gap-6">
            <div className={`flex-1 text-center p-5 rounded-2xl transition-all border ${isCoffeeTurn && !winner ? 'bg-gray-50 border-gray-900 shadow-sm' : 'bg-white border-gray-100 opacity-40'}`}>
              <div className="text-2xl mb-2">☕</div>
              <div className="text-xs font-black text-gray-900">{scores.coffee}</div>
            </div>
            <div className={`flex-1 text-center p-5 rounded-2xl transition-all border ${!isCoffeeTurn && !winner ? 'bg-gray-50 border-gray-900 shadow-sm' : 'bg-white border-gray-100 opacity-40'}`}>
              <div className="text-2xl mb-2">🍵</div>
              <div className="text-xs font-black text-gray-900">{scores.tea}</div>
            </div>
          </div>

          <div className="mb-8 h-6 flex items-center">
             {winner ? (
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 animate-pulse">
                  {winner === 'DRAW' ? "It's a draw" : winner === 'COFFEE' ? "Coffee Wins! ☕" : "Tea Wins! 🍵"}
               </span>
             ) : (
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {isCoffeeTurn ? "Coffee's Turn" : "Tea's Turn"}
               </span>
             )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!cell || !!winner}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 border-2 ${
                  cell 
                    ? 'bg-gray-50 border-gray-50' 
                    : 'bg-white border-gray-100 hover:border-gray-900 cursor-pointer shadow-sm'
                } ${winningLine?.includes(i) ? 'border-red-600 ring-4 ring-red-50' : ''}`}
              >
                <span className={`transform transition-all duration-300 ${cell ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  {cell === 'COFFEE' ? '☕' : cell === 'TEA' ? '🍵' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 bg-white">
          <button
            onClick={() => { setBoard(Array(9).fill(null)); setWinner(null); setWinningLine(null); setIsCoffeeTurn(true); }}
            className="w-full py-4 bg-gray-900 text-white font-bold uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-lg hover:bg-black transition-all"
          >
            {winner ? 'Rematch' : 'Reset Game'}
          </button>
        </div>
      </div>
    </div>
  );
};