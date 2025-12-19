import React, { useState, useEffect } from 'react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  itemName: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(note);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/5 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-pop">
        
        {/* Header - Matching CustomizeModal */}
        <div className="p-8 pb-4 bg-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight leading-tight mb-1">
                {itemName}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Special Instructions
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-200 hover:text-gray-900 transition-all p-1 -m-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[1px] w-full bg-gray-50"></div>
        </div>
        
        {/* Body */}
        <div className="p-8 pt-2 bg-white">
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g. Extra spicy, no onions, well done..."
              className="w-full bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl p-6 focus:outline-none focus:ring-4 focus:ring-gray-100/30 transition-all text-xs font-medium h-40 resize-none placeholder:text-gray-300 placeholder:italic"
              autoFocus
            />
            <div className="absolute bottom-4 right-6 text-[8px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">
              Notes for Kitchen
            </div>
          </div>
        </div>
        
        {/* Footer - Matching CustomizeModal style */}
        <div className="p-8 border-t border-gray-50 bg-white flex items-center justify-between shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="text-[9px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
          >
            Discard
          </button>
          
          <button 
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-gray-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-3"
          >
            Save Note
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};