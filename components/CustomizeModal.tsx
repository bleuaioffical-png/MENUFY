import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, CustomizationChoice, CustomizationOption } from '../types';
import { useRestaurant } from '../contexts/RestaurantContext';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, selectedChoices: CustomizationChoice[]) => void;
  item: MenuItem | null;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
  const { menuItems } = useRestaurant();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen && item) {
      setSelectedOptions({});
    }
  }, [isOpen, item]);

  const currentSelections = useMemo(() => {
    if (!item?.customizationOptions) return [];
    
    const choices: CustomizationChoice[] = [];
    
    (Object.entries(selectedOptions) as [string, string[]][]).forEach(([optionId, choiceIds]) => {
      const option = item.customizationOptions?.find(o => o.id === optionId);
      if (option) {
        choiceIds.forEach(cId => {
          const choice = option.choices.find(c => c.id === cId);
          if (choice) choices.push(choice);
        });
      }
    });
    return choices;
  }, [selectedOptions, item]);

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    const addonsPrice = currentSelections.reduce((sum, c) => sum + c.price, 0);
    return item.price + addonsPrice;
  }, [item, currentSelections]);

  const handleToggle = (optionId: string, choiceId: string, type: 'single' | 'multiple') => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      
      if (type === 'single') {
        return { ...prev, [optionId]: current.includes(choiceId) ? [] : [choiceId] };
      } else {
        if (current.includes(choiceId)) {
          return { ...prev, [optionId]: current.filter(id => id !== choiceId) };
        } else {
          return { ...prev, [optionId]: [...current, choiceId] };
        }
      }
    });
  };

  const handleConfirm = () => {
    if (item) {
      onConfirm(item, currentSelections);
      onClose();
    }
  };

  const suggestedItem = useMemo(() => {
    if (!item) return null;
    if (item.suggestedItemId) {
      return menuItems.find(i => i.id === item.suggestedItemId);
    }
    return null;
  }, [item, menuItems]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/5 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-pop max-h-[90vh]">
        
        <div className="p-8 pb-4 bg-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight leading-tight mb-1">
                {item.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed">
                {item.description}
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
        
        <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-8 bg-white scrollbar-hide">
          {item.customizationOptions?.map(option => (
            <div key={option.id} className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {option.title}
                </h4>
                <div className="h-[1px] flex-1 bg-gray-50"></div>
              </div>

              <div className="space-y-1.5">
                {option.choices.map(choice => {
                  const isSelected = selectedOptions[option.id]?.includes(choice.id);
                  return (
                    <div 
                      key={choice.id} 
                      onClick={() => handleToggle(option.id, choice.id, option.type)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-gray-900 border-gray-900 shadow-sm' 
                          : 'bg-white border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-white border-white' : 'border-gray-200 bg-white'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                          {choice.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {choice.price > 0 && (
                          <span className={`text-[9px] font-black tabular-nums ${isSelected ? 'text-gray-300' : 'text-gray-900'}`}>
                            +₹{choice.price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {suggestedItem && (
            <div className="pt-4 border-t border-gray-50 animate-fadeIn">
               <div className="flex items-center gap-3 mb-4">
                <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Pairs Well With
                </h4>
                <div className="h-[1px] flex-1 bg-gray-50"></div>
              </div>
              <div 
                className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                onClick={() => {
                  onConfirm(suggestedItem, []);
                  // Don't close so they can finish current item
                }}
              >
                <div>
                  <span className="text-[10px] font-bold text-gray-900 block uppercase">{suggestedItem.name}</span>
                  <span className="text-[9px] font-black text-gray-400 block uppercase">₹{suggestedItem.price}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-gray-900 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-gray-50 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Total Amount</span>
              <span className="text-sm font-black text-gray-900">₹{totalPrice}</span>
            </div>
            
            <button 
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-gray-900 text-white font-bold uppercase text-[9px] tracking-[0.2em] rounded-2xl shadow-sm hover:bg-black transition-all active:scale-95 flex items-center gap-3"
            >
              Add to Order
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};