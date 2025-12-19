import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-50 bg-white">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{title}</h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Action Required</p>
        </div>

        {/* Body */}
        <div className="p-10 bg-white text-center">
          <p className="text-gray-500 text-xs font-medium leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="p-8 border-t border-gray-50 bg-white flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
          >
            Back
          </button>
          <button 
            onClick={onConfirm}
            className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};