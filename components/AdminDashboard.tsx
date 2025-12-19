import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { MenuItem, OrderStatus, CustomizationOption, DiscountMilestone, Order, RestaurantSettings, ActivityEntry, CustomizationChoice } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import QRCode from 'qrcode';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend
} from 'recharts';

type TimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';

export const AdminDashboard: React.FC = () => {
  const { 
    tenantId,
    menuItems = [], 
    categories = [],
    orders = [], 
    discountMilestones = [],
    activityLog = [],
    settings,
    logout, 
    addMenuItem, 
    updateMenuItem,
    deleteMenuItem, 
    addCategory,
    removeCategory,
    renameCategory,
    updateDiscountMilestones,
    updateSettings,
    updateOrderStatus,
    toggleOrderTakeaway,
    clearHistory
  } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'MENU' | 'PROMOTIONS' | 'ANALYTICS' | 'SETTINGS' | 'HISTORY'>('ORDERS');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | 'TAKEAWAY' | 'DINEIN'>('ALL');
  const [analyticsRange, setAnalyticsRange] = useState<TimeRange>('MONTH');
  
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [promoMilestones, setPromoMilestones] = useState<DiscountMilestone[]>([]);
  
  const [settingsForm, setSettingsForm] = useState<RestaurantSettings>(settings);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const [formState, setFormState] = useState<Partial<MenuItem>>({
    name: '', price: 0, description: '', category: categories[0] || '',
    dietaryTags: ['Veg'], isChefSpecial: false, suggestedItemId: '', customizationOptions: []
  });

  const prevOrdersCount = useRef(orders.length);
  const chimeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0];
      if (newOrder && newOrder.status === 'PENDING') {
        if (!chimeRef.current) {
          chimeRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        }
        chimeRef.current.play().catch(e => console.log('Audio blocked', e));

        if (Notification.permission === "granted") {
          new Notification(`New Order #${newOrder.id.slice(0, 4)}`, {
            body: `${newOrder.customerName} - ₹${newOrder.total.toFixed(0)}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png'
          });
        }
      }
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  useEffect(() => {
    setPromoMilestones(discountMilestones);
  }, [discountMilestones]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (isPreviewOpen && orderToPrint && settings.upiId) {
      const merchantName = encodeURIComponent(settings.upiName || settings.name);
      const upiId = encodeURIComponent(settings.upiId);
      const amount = orderToPrint.total.toFixed(2);
      const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`;
      
      QRCode.toDataURL(upiLink, { 
        margin: 1, 
        width: 150,
        color: { dark: '#000000', light: '#ffffff' }
      }).then(url => setQrCodeUrl(url));
    } else {
      setQrCodeUrl('');
    }
  }, [isPreviewOpen, orderToPrint, settings]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormState({
      name: '', price: 0, description: '',
      category: categories[0] || '', dietaryTags: ['Veg'],
      isChefSpecial: false, suggestedItemId: '', customizationOptions: []
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormState({ ...item });
    setIsMenuModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;
    const finalItem = { ...formState, id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9) } as MenuItem;
    if (editingItem) updateMenuItem(finalItem);
    else addMenuItem(finalItem);
    setIsMenuModalOpen(false);
  };

  const analyticsData = useMemo(() => {
    const now = new Date();
    const startTime = new Date();
    
    if (analyticsRange === 'TODAY') startTime.setHours(0,0,0,0);
    else if (analyticsRange === 'WEEK') startTime.setDate(now.getDate() - 7);
    else if (analyticsRange === 'MONTH') startTime.setDate(now.getDate() - 30);
    else if (analyticsRange === 'YEAR') startTime.setFullYear(now.getFullYear() - 1);

    const filteredOrders = orders.filter(o => o.timestamp >= startTime.getTime() && o.status !== 'REJECTED');
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    
    const trendMap: Record<string, number> = {};
    const productStats: Record<string, { name: string, qty: number, revenue: number, category: string }> = {};
    const categoryStats: Record<string, number> = {};

    filteredOrders.forEach(order => {
      const date = new Date(order.timestamp);
      let key = '';
      if (analyticsRange === 'TODAY') key = `${date.getHours()}:00`;
      else key = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      trendMap[key] = (trendMap[key] || 0) + order.total;

      order.items.forEach(item => {
        if (!productStats[item.id]) {
          productStats[item.id] = { name: item.name, qty: 0, revenue: 0, category: item.category };
        }
        productStats[item.id].qty += item.quantity;
        productStats[item.id].revenue += (item.price * item.quantity);
        categoryStats[item.category] = (categoryStats[item.category] || 0) + (item.price * item.quantity);
      });
    });

    const trendData = Object.entries(trendMap).map(([name, value]) => ({ name, value }));
    const heroProducts = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
    const topCategory = categoryData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A';

    return { 
      totalRevenue, totalOrders, heroProducts, trendData, categoryData, topCategory,
      bestSeller: heroProducts[0]?.name || 'N/A'
    };
  }, [orders, analyticsRange]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('Settings updated!');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const statusMatch = filterStatus === 'ALL' ? true : o.status === filterStatus;
      const typeMatch = orderTypeFilter === 'ALL' ? true : (orderTypeFilter === 'TAKEAWAY' ? o.isTakeaway : !o.isTakeaway);
      return statusMatch && typeMatch;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, filterStatus, orderTypeFilter]);

  const filteredMenuItems = useMemo(() => {
    if (!menuSearchQuery.trim()) return menuItems;
    const query = menuSearchQuery.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }, [menuItems, menuSearchQuery]);

  const handleAddMilestone = () => setPromoMilestones(prev => [...prev, { threshold: 0, percentage: 0 }]);
  const handleRemoveMilestone = (idx: number) => setPromoMilestones(prev => prev.filter((_, i) => i !== idx));
  const handleSaveMilestones = () => { updateDiscountMilestones(promoMilestones); alert('Promotions updated!'); };

  const handlePrint = (order: Order) => {
    setOrderToPrint(order);
    setTimeout(() => { window.print(); }, 200);
  };

  const handlePreview = (order: Order) => {
    setOrderToPrint(order);
    setIsPreviewOpen(true);
  };

  const handleRenameCategorySubmit = (oldName: string) => {
    if (tempCategoryName && tempCategoryName.trim() && tempCategoryName.trim() !== oldName) {
      renameCategory(oldName, tempCategoryName.trim());
    }
    setEditingCategory(null);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const COLORS = ['#111827', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

  // Customization Helpers
  const handleAddOption = () => {
    const newOption: CustomizationOption = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Option', type: 'single', required: false,
      choices: [{ id: Math.random().toString(36).substr(2, 9), name: 'Choice 1', price: 0 }]
    };
    setFormState({...formState, customizationOptions: [...(formState.customizationOptions || []), newOption]});
  };
  const handleRemoveOption = (optId: string) => setFormState({...formState, customizationOptions: (formState.customizationOptions || []).filter(o => o.id !== optId)});
  const handleUpdateOption = (optId: string, updates: Partial<CustomizationOption>) => setFormState({...formState, customizationOptions: (formState.customizationOptions || []).map(o => o.id === optId ? { ...o, ...updates } : o)});
  const handleAddChoice = (optId: string) => {
    const newChoice: CustomizationChoice = { id: Math.random().toString(36).substr(2, 9), name: 'New Choice', price: 0 };
    setFormState({...formState, customizationOptions: (formState.customizationOptions || []).map(o => o.id === optId ? { ...o, choices: [...o.choices, newChoice] } : o)});
  };
  const handleUpdateChoice = (optId: string, choiceId: string, updates: Partial<CustomizationChoice>) => setFormState({...formState, customizationOptions: (formState.customizationOptions || []).map(o => o.id === optId ? { ...o, choices: o.choices.map(c => c.id === choiceId ? { ...c, ...updates } : c) } : o)});
  const handleRemoveChoice = (optId: string, choiceId: string) => setFormState({...formState, customizationOptions: (formState.customizationOptions || []).map(o => o.id === optId ? { ...o, choices: o.choices.filter(c => c.id !== choiceId) } : o)});

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body flex flex-col">
      <header className="bg-white border-b border-gray-100 p-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-900 flex items-center justify-center rounded-lg text-white font-black">{getInitials(settings.name)}</div>
                <div>
                    <h1 className="text-sm font-bold uppercase tracking-widest">{settings.name}</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Manager Dashboard</p>
                </div>
            </div>
            <button onClick={logout} className="px-4 py-2 text-gray-400 hover:text-red-600 font-bold uppercase text-[10px] tracking-widest">Log Out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 flex-1 w-full">
        <div className="flex gap-8 mb-10 border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {['ORDERS', 'MENU', 'PROMOTIONS', 'ANALYTICS', 'SETTINGS', 'HISTORY'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}>{tab}</button>
            ))}
        </div>

        <div className="animate-fadeIn">
        {activeTab === 'ORDERS' && (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-3 bg-gray-50/50 p-1 rounded-2xl w-fit border border-gray-100">
                    {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(opt => (
                      <button key={opt} onClick={() => setFilterStatus(opt as any)} className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${filterStatus === opt ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>{opt}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50/50 p-1 rounded-2xl w-fit border border-gray-100">
                    <button onClick={() => setOrderTypeFilter('ALL')} className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${orderTypeFilter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>All Types</button>
                    <button onClick={() => setOrderTypeFilter('TAKEAWAY')} className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${orderTypeFilter === 'TAKEAWAY' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>Takeaway</button>
                    <button onClick={() => setOrderTypeFilter('DINEIN')} className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${orderTypeFilter === 'DINEIN' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>Dine-in</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className={`bg-white border rounded-2xl p-6 flex flex-col shadow-soft ${order.status === 'PENDING' ? 'ring-2 ring-gray-900/5' : 'border-gray-50'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-lg font-bold text-gray-900">#{order.id.slice(0,4)}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.customerName}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
                                  {order.isTakeaway && <span className="text-[7px] font-black text-red-600 uppercase tracking-widest">Takeaway</span>}
                                </div>
                            </div>
                            <div className="space-y-3 mb-8 flex-1">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] border-b border-gray-50 pb-2">
                                        <span className="text-gray-600 font-bold">{item.quantity}x {item.name}</span>
                                        <span className="text-gray-400 font-black">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                {order.packingCharge > 0 && (
                                  <div className="flex justify-between text-[11px] border-b border-gray-50 pb-2">
                                      <span className="text-gray-400 font-bold uppercase italic">Packing Charge</span>
                                      <span className="text-gray-400 font-black">₹{order.packingCharge}</span>
                                  </div>
                                )}
                                <div className="pt-4 flex justify-between items-end">
                                  <span className="text-[10px] font-black text-gray-300 uppercase">{new Date(order.timestamp).toLocaleTimeString()}</span>
                                  <span className="text-lg font-black text-gray-900 tabular-nums">₹{order.total}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {order.status === 'PENDING' && (
                                  <div className="mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Order Type</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button 
                                        onClick={() => order.isTakeaway && toggleOrderTakeaway(order.id)} 
                                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${!order.isTakeaway ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'}`}
                                      >
                                        Dine-in
                                      </button>
                                      <button 
                                        onClick={() => !order.isTakeaway && toggleOrderTakeaway(order.id)} 
                                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${order.isTakeaway ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'}`}
                                      >
                                        Takeaway
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button onClick={() => handlePreview(order)} className="flex-1 py-2.5 bg-gray-50 text-gray-600 border border-gray-100 font-black uppercase text-[8px] tracking-[0.2em] rounded-xl">Preview</button>
                                  <button onClick={() => handlePrint(order)} className="flex-1 py-2.5 bg-gray-900 text-white font-black uppercase text-[8px] tracking-[0.2em] rounded-xl">Print</button>
                                </div>
                                {order.status === 'PENDING' && (
                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div className="flex gap-3">
                                            <button onClick={() => updateOrderStatus(order.id, 'REJECTED')} className="flex-1 py-3 text-red-500 font-black uppercase text-[10px] tracking-widest">Reject</button>
                                            <button onClick={() => updateOrderStatus(order.id, 'ACCEPTED')} className="flex-1 py-3 bg-gray-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl">Accept</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">No matching orders found</div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'MENU' && (
          <div className="space-y-12">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Manage Categories</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Organize your menu structure</p>
                    </div>
                    <div className="flex gap-3 w-full sm:max-w-sm">
                        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name..." className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase focus:border-gray-900 transition-all" />
                        <button onClick={() => { if(newCategoryName.trim()){ addCategory(newCategoryName); setNewCategoryName(''); } }} className="px-6 bg-gray-900 text-white font-black uppercase text-[9px] tracking-widest rounded-xl">Add</button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    {categories.map(cat => (
                        <div key={cat} className="bg-gray-50 border border-gray-100 pl-5 pr-3 py-3 rounded-[1.5rem] flex items-center gap-6 group cursor-default">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{cat}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setEditingCategory(cat); setTempCategoryName(cat); }} className="text-gray-300 hover:text-gray-900">✎</button>
                                <button onClick={() => setDeletingCategory(cat)} className="text-gray-200 hover:text-red-500">×</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Manage Dishes</h3>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <input type="text" placeholder="Search dishes..." value={menuSearchQuery} onChange={(e) => setMenuSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none" />
                        <button onClick={handleOpenAddModal} className="px-8 py-3 bg-gray-900 text-white font-black uppercase text-[9px] tracking-[0.2em] rounded-xl whitespace-nowrap">+ New Dish</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl relative">
                           <div className="flex justify-between items-start mb-4">
                              <h4 className="text-xs font-black uppercase text-gray-900">{item.name}</h4>
                              <span className="text-xs font-black text-gray-900">₹{item.price}</span>
                           </div>
                           <div className="flex justify-end gap-3 mt-6">
                              <button onClick={() => handleOpenEditModal(item)} className="text-[9px] font-black uppercase text-gray-400 hover:text-gray-900 transition-colors">Edit</button>
                              <button onClick={() => setItemToDelete(item)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors">Delete</button>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto">
            <div className="flex items-center gap-3 bg-gray-50/50 p-1 rounded-2xl w-fit border border-gray-100 mb-8">
              {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map(range => (
                <button key={range} onClick={() => setAnalyticsRange(range as any)} className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${analyticsRange === range ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}>{range}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-soft text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                  <h4 className="text-2xl font-black text-gray-900">₹{analyticsData.totalRevenue.toLocaleString()}</h4>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-soft text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                  <h4 className="text-2xl font-black text-gray-900">{analyticsData.totalOrders}</h4>
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-soft min-h-[400px]">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-8">Revenue Performance</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={analyticsData.trendData}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={3} fill="url(#colorVal)" />
                       </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-soft flex flex-col items-center">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-8">Sales by Category</h3>
                  <div className="h-[250px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={analyticsData.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                             {analyticsData.categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'PROMOTIONS' && (
          <div className="max-w-3xl space-y-8 animate-fadeIn">
             <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-soft">
                <h3 className="text-sm font-black uppercase tracking-widest mb-10">Discount Milestones</h3>
                <div className="space-y-4 mb-8">
                  {promoMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                       <div className="flex-1 space-y-2">
                          <label className="text-[8px] font-black uppercase text-gray-400">Threshold (₹)</label>
                          <input type="number" value={m.threshold} onChange={(e) => { const newM = [...promoMilestones]; newM[idx].threshold = Number(e.target.value); setPromoMilestones(newM); }} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none" />
                       </div>
                       <div className="flex-1 space-y-2">
                          <label className="text-[8px] font-black uppercase text-gray-400">Discount %</label>
                          <input type="number" value={m.percentage} onChange={(e) => { const newM = [...promoMilestones]; newM[idx].percentage = Number(e.target.value); setPromoMilestones(newM); }} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold outline-none" />
                       </div>
                       <button onClick={() => handleRemoveMilestone(idx)} className="mt-6 text-red-300 hover:text-red-500">×</button>
                    </div>
                  ))}
                  <button onClick={handleAddMilestone} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-300 hover:border-gray-900">+ Add Milestone</button>
                </div>
                <button onClick={handleSaveMilestones} className="w-full py-5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-3xl">Save Promotions</button>
             </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-4xl animate-fadeIn bg-white border border-gray-100 rounded-3xl p-10 shadow-soft">
              <h3 className="text-xs font-black uppercase tracking-widest mb-10">Business Configuration</h3>
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Restaurant Name</label>
                    <input required value={settingsForm.name} onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tagline</label>
                    <input required value={settingsForm.tagline} onChange={(e) => setSettingsForm({...settingsForm, tagline: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Address</label>
                    <textarea required value={settingsForm.address} onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900 h-20 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Phone Number (For Call Button)</label>
                    <input required value={settingsForm.phone} onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Google Location URL</label>
                    <input value={settingsForm.googleLocation || ''} onChange={(e) => setSettingsForm({...settingsForm, googleLocation: e.target.value})} placeholder="https://maps.app.goo.gl/..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">GST / Tax (%)</label>
                    <input type="number" step="0.01" value={settingsForm.gstPercentage} onChange={(e) => setSettingsForm({...settingsForm, gstPercentage: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Takeaway Packing Charge (₹)</label>
                    <input type="number" value={settingsForm.packingCharge} onChange={(e) => setSettingsForm({...settingsForm, packingCharge: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">UPI ID (e.g. upi@bank)</label>
                    <input value={settingsForm.upiId || ''} onChange={(e) => setSettingsForm({...settingsForm, upiId: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">UPI Name (Merchant Name)</label>
                    <input value={settingsForm.upiName || ''} onChange={(e) => setSettingsForm({...settingsForm, upiName: e.target.value})} placeholder="Owner / Shop Name" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-[0.3em] rounded-xl shadow-lg">Save Settings</button>
              </form>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="max-w-4xl space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Activity Log</h3>
              <button onClick={() => { if(window.confirm('Clear all logs?')) clearHistory(); }} className="text-[9px] font-black uppercase text-gray-400 hover:text-red-600">Clear History</button>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft">
              <div className="space-y-6">
                {activityLog.length === 0 ? <div className="py-20 text-center text-[10px] font-bold uppercase text-gray-300">No logs available</div> : activityLog.map((entry) => (
                  <div key={entry.id} className="flex gap-6 border-b border-gray-50 pb-4 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-gray-900" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-900">{entry.description}</div>
                      <p className="text-[9px] font-bold text-gray-400 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Bill Preview */}
      {isPreviewOpen && orderToPrint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <span className="text-[10px] font-black uppercase tracking-widest">Receipt Preview</span>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-300 hover:text-gray-900 p-1">×</button>
            </div>
            <div className="p-8 bg-gray-50 flex-1 overflow-y-auto">
              <div id="printable-invoice" className="bg-white p-6 font-mono text-[10px] text-black shadow-sm">
                <div className="text-center mb-6">
                  <p className="font-black text-sm uppercase tracking-widest">{settings.name}</p>
                  <p className="text-[7px] mt-1 uppercase leading-tight">{settings.address}</p>
                  <p className="text-[7px] mt-1">CONTACT: {settings.phone}</p>
                </div>
                <div className="flex justify-between mb-4 border-b border-dashed pb-2 text-[8px]">
                   <span>ORDER: #{orderToPrint.id.slice(0,6)}</span>
                   <span>{new Date(orderToPrint.timestamp).toLocaleString()}</span>
                </div>
                <div className="mb-4">
                  <span className="text-[8px] font-black uppercase tracking-widest">TYPE: {orderToPrint.isTakeaway ? 'TAKEAWAY' : 'DINE-IN'}</span>
                </div>
                <div className="space-y-1.5 mb-4 border-b border-dashed pb-4">
                  {orderToPrint.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="flex-1">{item.quantity}x {item.name.toUpperCase()}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 text-right mb-6 border-b border-dashed pb-4">
                  <div className="flex justify-between"><span>SUBTOTAL</span><span>₹{orderToPrint.subtotal}</span></div>
                  {orderToPrint.discount > 0 && <div className="flex justify-between text-red-600"><span>DISCOUNT</span><span>-₹{orderToPrint.discount}</span></div>}
                  {orderToPrint.packingCharge > 0 && <div className="flex justify-between"><span>PACKING</span><span>₹{orderToPrint.packingCharge}</span></div>}
                  {orderToPrint.taxAmount > 0 && <div className="flex justify-between"><span>TAX ({settings.gstPercentage}%)</span><span>₹{orderToPrint.taxAmount.toFixed(2)}</span></div>}
                </div>
                <div className="flex justify-between font-black text-xs border-b border-dashed pb-2 mb-8">
                  <span>NET AMOUNT</span><span>₹{orderToPrint.total.toFixed(0)}</span>
                </div>
                {qrCodeUrl && (
                  <div className="mt-8 flex flex-col items-center">
                    <img src={qrCodeUrl} alt="UPI QR" className="w-32 h-32" />
                    <p className="text-[7px] font-black uppercase tracking-widest text-gray-500 mt-2">{settings.upiName || settings.name}</p>
                    <p className="text-[6px] font-bold text-gray-400 mt-1">Scan to Pay: ₹{orderToPrint.total.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-white border-t border-gray-100 flex gap-3">
              <button onClick={() => { setIsPreviewOpen(false); handlePrint(orderToPrint); }} className="w-full py-3 bg-gray-900 text-white font-black uppercase text-[10px] rounded-xl">Print Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 backdrop-blur-md">
            <div className="bg-white border border-gray-100 rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-50 bg-white flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{editingItem ? 'Edit Dish' : 'New Dish'}</h3>
                   <button onClick={() => setIsMenuModalOpen(false)} className="text-gray-200 hover:text-gray-900 p-1">×</button>
                </div>
                <form onSubmit={handleSaveItem} className="p-8 space-y-8 overflow-y-auto flex-1 bg-white scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400">Item Name</label>
                                <input required value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] font-bold uppercase focus:border-gray-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400">Price (₹)</label>
                                    <input type="number" required value={formState.price === 0 ? '' : formState.price} onChange={(e) => setFormState({...formState, price: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] font-bold outline-none focus:border-gray-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400">Category</label>
                                    <select required value={formState.category} onChange={(e) => setFormState({...formState, category: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] font-bold outline-none">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-gray-400">Dietary Type</label>
                                <div className="flex gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => setFormState({...formState, dietaryTags: ['Veg']})}
                                    className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formState.dietaryTags?.includes('Veg') && !formState.dietaryTags?.includes('Non-Veg') ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                  >
                                    Veg
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormState({...formState, dietaryTags: ['Non-Veg']})}
                                    className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formState.dietaryTags?.includes('Non-Veg') ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                  >
                                    Non-Veg
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormState({...formState, dietaryTags: ['Veg', 'Non-Veg']})}
                                    className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formState.dietaryTags?.includes('Veg') && formState.dietaryTags?.includes('Non-Veg') ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                  >
                                    Both
                                  </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400">Description</label>
                                <textarea value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] font-medium h-24 resize-none outline-none focus:border-gray-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400">Recommended Pairing (Upsell)</label>
                                <select 
                                    value={formState.suggestedItemId || ''} 
                                    onChange={(e) => setFormState({...formState, suggestedItemId: e.target.value})} 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] font-bold outline-none"
                                >
                                    <option value="">Auto-Suggest (Based on Category)</option>
                                    {menuItems.filter(i => i.id !== editingItem?.id).map(i => (
                                        <option key={i.id} value={i.id}>{i.name} (₹{i.price})</option>
                                    ))}
                                </select>
                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1 px-1 italic">This item will be shown as a recommendation on the menu card.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] font-black uppercase text-gray-400">Customization Groups</label>
                                <button type="button" onClick={handleAddOption} className="text-[8px] font-black uppercase text-gray-900">+ Add Group</button>
                            </div>
                            <div className="space-y-6">
                              {(formState.customizationOptions || []).map((opt) => (
                                <div key={opt.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                  <div className="flex gap-2">
                                    <input value={opt.title} onChange={(e) => handleUpdateOption(opt.id, { title: e.target.value })} className="flex-1 bg-white border border-transparent rounded-lg px-3 py-2 text-[10px] font-bold uppercase focus:border-gray-900 outline-none" placeholder="TITLE" />
                                    <button type="button" onClick={() => handleRemoveOption(opt.id)} className="text-red-400">×</button>
                                  </div>
                                  <div className="space-y-2">
                                    {opt.choices.map((choice) => (
                                      <div key={choice.id} className="flex gap-2 items-center">
                                        <input value={choice.name} onChange={(e) => handleUpdateChoice(opt.id, choice.id, { name: e.target.value })} className="flex-1 bg-white border-transparent rounded-lg px-2 py-1 text-[9px] font-medium outline-none focus:border-gray-200" placeholder="Choice" />
                                        <input type="number" value={choice.price || 0} onChange={(e) => handleUpdateChoice(opt.id, choice.id, { price: Number(e.target.value) })} className="w-16 bg-white border-transparent rounded-lg px-2 py-1 text-[9px] font-black outline-none focus:border-gray-200" />
                                        <button type="button" onClick={() => handleRemoveChoice(opt.id, choice.id)} className="text-gray-300">×</button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddChoice(opt.id)} className="text-[8px] font-black uppercase text-gray-400 hover:text-gray-900">+ Add Choice</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={() => setIsMenuModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-gray-900 text-white font-black uppercase text-[10px] rounded-xl shadow-lg">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Item Delete Confirmation */}
      <ConfirmationModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={() => {
          if (itemToDelete) {
            deleteMenuItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }} 
        title="Delete Dish" 
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`} 
      />

      {/* Category Delete Confirmation */}
      <ConfirmationModal 
        isOpen={!!deletingCategory} 
        onClose={() => setDeletingCategory(null)} 
        onConfirm={() => {
          if (deletingCategory) {
            removeCategory(deletingCategory);
            setDeletingCategory(null);
          }
        }} 
        title="Delete Category" 
        message={`Deleting "${deletingCategory}" will also remove all dishes assigned to this category. Continue?`} 
      />
    </div>
  );
};