import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (delta: number) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove, onUpdateQuantity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col bg-white border border-gray-50 p-4 rounded-2xl group animate-fadeIn shadow-sm hover:border-gray-100 transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-[11px] font-bold text-gray-900 uppercase truncate tracking-tight">{item.name}</h4>
          </div>
          <div className="text-[10px] font-black text-gray-400 tracking-tighter">₹{item.price}</div>
          
          {item.selectedOptions && item.selectedOptions.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[8px] font-bold uppercase text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1 mt-1 tracking-widest"
            >
              Customized
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <button 
          onClick={onRemove}
          className="text-gray-200 hover:text-red-500 transition-all p-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      {isExpanded && item.selectedOptions && (
        <div className="mt-3 pl-3 border-l border-gray-100 space-y-1 animate-fadeIn">
          {item.selectedOptions.map(opt => (
            <div key={opt.id} className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              <span>{opt.name}</span>
              <span className="text-gray-300 italic">+₹{opt.price}</span>
            </div>
          ))}
        </div>
      )}

      {item.note && (
        <div className="mt-3 text-[9px] text-gray-400 italic font-medium leading-tight line-clamp-2">
           "{item.note}"
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
              <button 
                onClick={() => onUpdateQuantity(-1)}
                className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm active:scale-90 transition-all border border-transparent hover:border-gray-100"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M20 12H4" strokeWidth={4} />
                </svg>
              </button>
              <span className="text-[11px] font-black text-gray-900 w-8 text-center tabular-nums">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(1)}
                className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm active:scale-90 transition-all border border-transparent hover:border-gray-100"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 4v16m8-8H4" strokeWidth={4} />
                </svg>
              </button>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-black text-gray-900 tabular-nums">₹{item.price * item.quantity}</span>
          </div>
      </div>
    </div>
  );
};