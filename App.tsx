import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MenuItem, CartItem, CustomizationChoice, Order, Category } from './types';
import { Navbar } from './components/Navbar';
import { MenuCard } from './components/MenuCard';
import { NoteModal } from './components/NoteModal';
import { CustomizeModal } from './components/CustomizeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CartItemCard } from './components/CartItemCard';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { GameModal } from './components/GameModal';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

const Storefront: React.FC = () => {
  const { menuItems, categories, orders, discountMilestones, settings, placeOrder } = useRestaurant();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteItem, setNoteItem] = useState<MenuItem | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON-VEG'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInfo, setCustomerInfo] = useState('');
  const [customerInfoError, setCustomerInfoError] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 5) {
      setIsAdminLoginOpen(true);
      setLogoClickCount(0);
    }
  };

  const itemsByCategory = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    categories.forEach(cat => {
      groups[cat] = menuItems.filter(item => item.category === cat);
    });
    return groups;
  }, [menuItems, categories]);

  const addToCart = (item: MenuItem, note?: string, customizations?: CustomizationChoice[]) => {
    const customIdPart = customizations ? customizations.map(c => c.id).sort().join(',') : 'none';
    const cartId = `${item.id}-${note || 'default'}-${customIdPart}`;
    const customPrice = customizations ? item.price + customizations.reduce((acc, c) => acc + c.price, 0) : item.price;

    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, price: customPrice, quantity: 1, note, cartId, selectedOptions: customizations }];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const discountData = useMemo(() => {
    let percentage = settings.defaultDiscount || 0;
    let nextMilestone = null;
    
    const sortedMilestones = [...discountMilestones].sort((a, b) => a.threshold - b.threshold);
    
    for (const m of sortedMilestones) {
      if (subtotal >= m.threshold) {
        percentage = Math.max(percentage, m.percentage);
      } else {
        nextMilestone = m;
        break;
      }
    }
    
    const discountAmount = (subtotal * percentage) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxTotal = (taxableAmount * settings.gstPercentage) / 100;
    const finalTotal = taxableAmount + taxTotal;
    
    return { percentage, discountAmount, taxTotal, finalTotal, nextMilestone };
  }, [subtotal, discountMilestones, settings]);

  const { percentage: discountPercent, discountAmount, taxTotal, finalTotal, nextMilestone } = discountData;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!customerInfo.trim()) { setCustomerInfoError(true); return; }
    placeOrder({ 
      customerName: customerInfo, 
      items: cart, 
      subtotal, 
      discount: discountAmount, 
      taxAmount: taxTotal,
      packingCharge: 0,
      total: finalTotal, 
      note: `Digital Menu Order`,
      isTakeaway: false
    });
    setIsCartOpen(false);
    setIsOrderSuccessOpen(true);
    setCart([]);
  };

  const cartRecommendation = useMemo(() => {
    if (cart.length === 0) return null;
    const lastItem = cart[cart.length - 1];
    // Prioritize manual pairing
    if (lastItem.suggestedItemId) {
      const suggested = menuItems.find(i => i.id === lastItem.suggestedItemId);
      if (suggested && !cart.some(ci => ci.id === suggested.id)) return suggested;
    }
    // Fallback logic
    const categoryPairs: Record<string, string> = {
      [Category.MOMO]: Category.SOUP,
      [Category.PASTA]: Category.SIDES_VEG,
      [Category.RICE]: Category.SIDES_NON_VEG
    };
    const targetCat = categoryPairs[lastItem.category];
    if (targetCat) {
      const suggested = menuItems.find(i => i.category === targetCat && !cart.some(ci => ci.id === i.id));
      if (suggested) return suggested;
    }
    return null;
  }, [cart, menuItems]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} onGameClick={() => setIsGameOpen(true)} />

      <header className="pt-16 pb-8 px-6 text-center border-b border-gray-50 bg-white">
        <div onClick={handleLogoClick} className="inline-block cursor-pointer">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">{settings.name}</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mt-1">{settings.tagline}</p>
          {settings.googleLocation && (
            <a 
              href={settings.googleLocation} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.573 2.057 8.208 8.208 0 00.707.361l.03.014.006.003.001.001zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              View on Maps
            </a>
          )}
        </div>
      </header>

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="relative max-w-xl mx-auto w-full">
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-12 focus:outline-none focus:ring-4 focus:ring-gray-100/50 transition-all text-sm font-medium" 
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setDietaryFilter('ALL')} 
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${dietaryFilter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}
            >
              All
            </button>
            <button 
              onClick={() => setDietaryFilter('VEG')} 
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${dietaryFilter === 'VEG' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-green-600'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${dietaryFilter === 'VEG' ? 'bg-white' : 'bg-green-500'}`} />
              Veg
            </button>
            <button 
              onClick={() => setDietaryFilter('NON-VEG')} 
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${dietaryFilter === 'NON-VEG' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-red-600'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${dietaryFilter === 'NON-VEG' ? 'bg-white' : 'bg-red-500'}`} />
              Non-Veg
            </button>
          </div>

          <div className="relative flex items-center">
            <div ref={scrollRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1 px-4 items-center justify-center">
              <button onClick={() => setActiveCategory('ALL')} className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap transition-all ${activeCategory === 'ALL' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900 bg-gray-50'}`}>All Categories</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900 bg-gray-50'}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12 pb-32">
        <div className="space-y-16">
          {Object.entries(itemsByCategory).map(([category, items]) => {
            if (activeCategory !== 'ALL' && category !== activeCategory) return null;
            let filtered = (items as MenuItem[]).filter(i => {
              const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesDiet = dietaryFilter === 'ALL' || (dietaryFilter === 'VEG' ? i.dietaryTags.includes('Veg') : i.dietaryTags.includes('Non-Veg'));
              return matchesSearch && matchesDiet;
            });
            if (!filtered.length) return null;
            return (
              <section key={category} className="animate-fadeIn">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">{category}</h2>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filtered.map(item => (
                      <MenuCard 
                        key={item.id} 
                        item={item} 
                        isFavorite={favorites.includes(item.id)} 
                        onToggleFavorite={() => toggleFavorite(item.id)} 
                        onAddToCart={addToCart} 
                        onAddNote={(it) => { setNoteItem(it); setIsNoteModalOpen(true); }} 
                        onCustomize={(it) => { setCustomizingItem(it); setIsCustomizeModalOpen(true); }} 
                      />
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/5 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slideIn border-l border-gray-50">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-300 hover:text-gray-900 transition-all p-1">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white scrollbar-hide">
              <div className="space-y-4">
                {cart.map(item => (
                  <CartItemCard 
                    key={item.cartId} 
                    item={item} 
                    onRemove={() => setItemToRemove(item.cartId)} 
                    onUpdateQuantity={(d) => updateQuantity(item.cartId, d)} 
                  />
                ))}
                {cart.length === 0 && <div className="py-24 text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest italic">Empty Tray</div>}
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-50 space-y-4">
              {cartRecommendation && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-fadeIn">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Frequently Paired With</span>
                    <span className="text-[8px] font-bold text-gray-300 italic">Recommended</span>
                  </div>
                  <div 
                    className="flex items-center justify-between cursor-pointer group/upsell"
                    onClick={() => {
                      if (cartRecommendation.customizationOptions?.length) {
                        setCustomizingItem(cartRecommendation);
                        setIsCustomizeModalOpen(true);
                      } else {
                        addToCart(cartRecommendation);
                      }
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-gray-900 block uppercase group-hover/upsell:text-red-700 transition-colors">{cartRecommendation.name}</span>
                      <span className="text-[9px] font-black text-gray-400 block uppercase mt-0.5">₹{cartRecommendation.price}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover/upsell:text-gray-900 group-hover/upsell:border-gray-900 transition-all shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {nextMilestone && cart.length > 0 && (
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Next Reward: {nextMilestone.percentage}% Off</span>
                    <span className="text-[8px] font-black text-gray-900">₹{Math.max(0, nextMilestone.threshold - subtotal)} left</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-900 transition-all duration-700 ease-out" 
                      style={{ width: `${Math.min(100, (subtotal / nextMilestone.threshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[9px] text-red-600 font-bold uppercase tracking-widest">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {taxTotal > 0 && (
                    <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>Tax ({settings.gstPercentage}%)</span>
                      <span className="text-gray-900">₹{taxTotal.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 mt-2 border-t border-gray-900/10">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</span>
                    <span className="text-xl font-black text-gray-900 tabular-nums">₹{finalTotal.toFixed(0)}</span>
                  </div>
              </div>

              <div className="space-y-3 pt-2">
                <input 
                  type="text" 
                  value={customerInfo} 
                  onChange={(e) => { setCustomerInfo(e.target.value); setCustomerInfoError(false); }} 
                  placeholder="Table / Name" 
                  className={`w-full bg-gray-50 border rounded-xl py-3.5 px-4 text-[10px] font-bold uppercase outline-none transition-all ${customerInfoError ? 'border-red-500 bg-red-50/20' : 'border-gray-100 focus:border-gray-900'}`} 
                />
                <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-4 bg-gray-900 text-white font-bold text-[9px] uppercase tracking-[0.4em] rounded-xl active:scale-95 shadow-lg flex items-center justify-center gap-3">
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onConfirm={(n) => noteItem && addToCart(noteItem, n)} itemName={noteItem?.name || ''} />
      <CustomizeModal isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)} item={customizingItem} onConfirm={(i, c) => addToCart(i, undefined, c)} />
      <ConfirmationModal isOpen={!!itemToRemove} onClose={() => setItemToRemove(null)} onConfirm={() => { setCart(prev => prev.filter(i => i.cartId !== itemToRemove)); setItemToRemove(null); }} title="Remove" message="Remove from order?" />
      <OrderSuccessModal isOpen={isOrderSuccessOpen} onClose={() => { setIsOrderSuccessOpen(false); }} />
      <GameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
      {isAdminLoginOpen && <AdminLogin onClose={() => setIsAdminLoginOpen(false)} />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAdmin } = useRestaurant();
  return isAdmin ? <AdminDashboard /> : <Storefront />;
};

const App: React.FC = () => {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
};

export default App;