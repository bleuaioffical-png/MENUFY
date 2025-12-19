import React, { useMemo, useState } from 'react';
import { MenuItem, Category } from '../types';
import { useRestaurant } from '../contexts/RestaurantContext';

interface MenuCardProps {
  item: MenuItem;
  isFavorite: boolean;
  onAddToCart: (item: MenuItem) => void;
  onToggleFavorite: () => void;
  onAddNote: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  isFavorite, 
  onAddToCart, 
  onToggleFavorite,
  onAddNote,
  onCustomize
}) => {
  const { menuItems } = useRestaurant();
  const [isAdded, setIsAdded] = useState(false);
  
  const hasCustomizations = item.customizationOptions && item.customizationOptions.length > 0;

  const handleDirectAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const suggestedItem = useMemo(() => {
    // 1. Check for manual pairing from Admin
    if (item.suggestedItemId) {
      const manual = menuItems.find(i => i.id === item.suggestedItemId);
      if (manual) return manual;
    }

    // 2. Automatic fallback logic
    let targetCategory: Category | null = null;
    switch (item.category) {
        case Category.MOMO: targetCategory = Category.SOUP; break;
        case Category.PASTA: targetCategory = Category.SIDES_VEG; break;
        case Category.SIDES_VEG: targetCategory = Category.NOODLES; break;
        case Category.RICE: targetCategory = Category.SIDES_NON_VEG; break;
        case Category.SOUP: targetCategory = Category.MOMO; break;
        default: targetCategory = null;
    }

    if (!targetCategory) return null;
    const candidates = menuItems.filter(i => i.category === targetCategory);
    if (candidates.length === 0) return null;
    const seed = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return candidates[seed % candidates.length];
  }, [item, menuItems]);

  return (
    <div className={`flex flex-col bg-white border-b border-gray-50 pb-10 group relative transition-all duration-500 ${item.isChefSpecial ? 'pt-6' : ''}`}>
      {item.isChefSpecial && (
        <div className="absolute -top-1 -left-2 z-10 animate-pop">
           <div className="bg-gray-900 text-white text-[7px] font-black uppercase tracking-[0.3em] pl-3 pr-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
             <span className="relative flex h-1.5 w-1.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
             </span>
             Chef's Special
           </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-6 mb-4">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors uppercase tracking-tight leading-tight">
                      {item.name}
                  </h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2 italic">{item.description}</p>
          </div>
          
          <div className="text-right shrink-0">
             <div className="text-sm font-black text-gray-900 mb-2">₹{item.price}</div>
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} 
                className={`transition-all p-1 -m-1 ${isFavorite ? 'text-red-600' : 'text-gray-200 hover:text-red-400'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </button>
          </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
              {item.dietaryTags?.map(tag => (
                <span key={tag} className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${tag.toLowerCase().includes('veg') && !tag.toLowerCase().includes('non') ? 'text-green-600 border-green-50 bg-green-50/30' : 'text-red-500 border-red-50 bg-red-50/30'}`}>{tag}</span>
              ))}
          </div>

          <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onAddNote(item); }} 
                className="text-gray-300 hover:text-gray-900 transition-colors"
                title="Add special instructions"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
              </button>

              {hasCustomizations ? (
                  <button 
                    onClick={() => onCustomize(item)} 
                    className="px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-900 border border-gray-900 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    Customize
                  </button>
              ) : (
                  <button 
                    onClick={handleDirectAdd} 
                    disabled={isAdded} 
                    className={`px-6 py-2 text-[9px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all shadow-sm ${isAdded ? 'text-green-600 bg-green-50 border border-green-100' : 'bg-gray-900 text-white hover:bg-black hover:shadow-md'}`}
                  >
                    {isAdded ? 'Added' : 'Add to Order'}
                  </button>
              )}
          </div>
      </div>

      {suggestedItem && (
          <div 
            className="mt-5 p-3 bg-gray-50/50 rounded-2xl flex items-center justify-between cursor-pointer group/suggest hover:bg-gray-100 transition-all duration-300 border border-transparent hover:border-gray-100" 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (suggestedItem.customizationOptions?.length) onCustomize(suggestedItem); 
              else onAddToCart(suggestedItem); 
            }}
          >
              <div className="flex-1 min-w-0">
                  <span className="text-[7px] font-black uppercase text-gray-400 block tracking-widest mb-0.5">Recommended Pairing</span>
                  <span className="text-[10px] font-bold text-gray-600 truncate block uppercase group-hover/suggest:text-gray-900">{suggestedItem.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] font-black text-gray-900 shrink-0">+₹{suggestedItem.price}</span>
                <div className="w-5 h-5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover/suggest:text-gray-900 group-hover/suggest:border-gray-900 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};