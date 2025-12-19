import React from 'react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-pop">
        
        {/* Main Content */}
        <div className="p-12 text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-soft animate-pop">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-red-400 rounded-full animate-bounce opacity-20"></div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Order Placed!</h2>
            <p className="text-gray-400 text-[10px] font-bold leading-relaxed uppercase tracking-[0.2em]">
              Your order has been received. <br/> Relax while we prepare your meal.
            </p>
          </div>
          
          <div className="pt-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Kitchen is working</span>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-10 pt-0 bg-white shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-gray-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] rounded-[1.5rem] shadow-xl transition-all active:scale-95"
          >
            Great!
          </button>
        </div>
      </div>
    </div>
  );
};