import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem, Order, OrderStatus, Category, DiscountMilestone, RestaurantSettings, ActivityEntry } from '../types';
import { MENU_ITEMS, INITIAL_SETTINGS } from '../constants';

interface RestaurantContextType {
  tenantId: string;
  menuItems: MenuItem[];
  categories: string[];
  orders: Order[];
  lastPlacedOrder: Order | null;
  discountMilestones: DiscountMilestone[];
  settings: RestaurantSettings;
  activityLog: ActivityEntry[];
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  updateDiscountMilestones: (milestones: DiscountMilestone[]) => void;
  updateSettings: (newSettings: RestaurantSettings) => void;
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderTakeaway: (orderId: string) => void;
  clearHistory: () => void;
  importBusinessData: (data: string) => boolean;
  exportBusinessData: () => string;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'default-cafe';
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [discountMilestones, setDiscountMilestones] = useState<DiscountMilestone[]>([
    { threshold: 1000, percentage: 10 },
    { threshold: 1500, percentage: 15 },
    { threshold: 2000, percentage: 20 }
  ]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const getKeys = useCallback((id: string) => ({
    menu: `menu_db_${id}`,
    orders: `orders_db_${id}`,
    cats: `categories_db_${id}`,
    discounts: `discounts_db_${id}`,
    settings: `settings_db_${id}`,
    log: `activity_log_${id}`
  }), []);

  useEffect(() => {
    const keys = getKeys(tenantId);
    try {
      const savedMenu = localStorage.getItem(keys.menu);
      const savedOrders = localStorage.getItem(keys.orders);
      const savedCats = localStorage.getItem(keys.cats);
      const savedDiscounts = localStorage.getItem(keys.discounts);
      const savedSettings = localStorage.getItem(keys.settings);
      const savedLog = localStorage.getItem(keys.log);
      
      if (savedMenu !== null && savedMenu !== "undefined") setMenuItems(JSON.parse(savedMenu));
      else setMenuItems([...MENU_ITEMS] as any);
      
      if (savedCats !== null && savedCats !== "undefined") setCategories(JSON.parse(savedCats));
      else setCategories(Object.values(Category));

      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedDiscounts) setDiscountMilestones(JSON.parse(savedDiscounts));
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        setSettings({ ...INITIAL_SETTINGS, name: tenantId.replace(/-/g, ' ').toUpperCase() });
      }

      if (savedLog) setActivityLog(JSON.parse(savedLog));
      setIsInitialized(true);
    } catch (e) {
      console.error("Failed to load tenant data:", e);
      setMenuItems([...MENU_ITEMS] as any);
      setCategories(Object.values(Category));
      setIsInitialized(true);
    }
  }, [tenantId, getKeys]);

  useEffect(() => {
    if (!isInitialized) return;
    const keys = getKeys(tenantId);
    localStorage.setItem(keys.menu, JSON.stringify(menuItems));
    localStorage.setItem(keys.cats, JSON.stringify(categories));
    localStorage.setItem(keys.orders, JSON.stringify(orders));
    localStorage.setItem(keys.discounts, JSON.stringify(discountMilestones));
    localStorage.setItem(keys.settings, JSON.stringify(settings));
    localStorage.setItem(keys.log, JSON.stringify(activityLog));
  }, [menuItems, categories, orders, discountMilestones, settings, activityLog, tenantId, isInitialized, getKeys]);

  const logActivity = (type: ActivityEntry['type'], entity: ActivityEntry['entity'], description: string) => {
    const newEntry: ActivityEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      entity,
      description,
      timestamp: Date.now()
    };
    setActivityLog(prev => [newEntry, ...prev].slice(0, 100));
  };

  const login = (password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
    logActivity('CREATE', 'MENU_ITEM', `Added new dish: ${item.name}`);
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    logActivity('UPDATE', 'MENU_ITEM', `Updated dish: ${updatedItem.name}`);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => {
      const itemToDelete = prev.find(i => i.id === id);
      if (itemToDelete) {
        logActivity('DELETE', 'MENU_ITEM', `Deleted dish: ${itemToDelete.name}`);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      logActivity('CREATE', 'CATEGORY', `Created category: ${trimmed}`);
      return [...prev, trimmed];
    });
  };

  const renameCategory = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedNew === oldName) return;
    setCategories(prev => prev.map(c => c === oldName ? trimmedNew : c));
    setMenuItems(prev => prev.map(item => item.category === oldName ? { ...item, category: trimmedNew } : item));
    logActivity('UPDATE', 'CATEGORY', `Renamed category: ${oldName} to ${trimmedNew}`);
  };

  const removeCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
    setMenuItems(prev => prev.filter(item => item.category !== name));
    logActivity('DELETE', 'CATEGORY', `Permanently deleted category: ${name}`);
  };

  const updateDiscountMilestones = (milestones: DiscountMilestone[]) => {
    setDiscountMilestones([...milestones].sort((a, b) => a.threshold - b.threshold));
    logActivity('UPDATE', 'PROMOTION', `Updated automatic discount milestones`);
  };

  const updateSettings = (newSettings: RestaurantSettings) => {
    setSettings(newSettings);
    logActivity('UPDATE', 'SETTINGS', `Updated restaurant branding & settings`);
  };

  const placeOrder = (newOrderData: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
    const newOrder: Order = {
      ...newOrderData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      timestamp: Date.now(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const toggleOrderTakeaway = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextTakeaway = !order.isTakeaway;
        const packingDiff = nextTakeaway ? settings.packingCharge : -settings.packingCharge;
        return {
          ...order,
          isTakeaway: nextTakeaway,
          packingCharge: nextTakeaway ? settings.packingCharge : 0,
          total: order.total + packingDiff
        };
      }
      return order;
    }));
  };

  const clearHistory = () => {
    setActivityLog([]);
    logActivity('SYSTEM', 'SETTINGS', `Activity history was cleared`);
  };

  const exportBusinessData = () => {
    const data = {
      menuItems,
      categories,
      settings,
      discountMilestones
    };
    return JSON.stringify(data);
  };

  const importBusinessData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.menuItems) setMenuItems(data.menuItems);
      if (data.categories) setCategories(data.categories);
      if (data.settings) setSettings(data.settings);
      if (data.discountMilestones) setDiscountMilestones(data.discountMilestones);
      logActivity('SYSTEM', 'SETTINGS', `Imported external business configuration`);
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  };

  return (
    <RestaurantContext.Provider value={{
      tenantId,
      menuItems,
      categories,
      orders,
      lastPlacedOrder,
      discountMilestones,
      settings,
      activityLog,
      isAdmin,
      login,
      logout,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addCategory,
      removeCategory,
      renameCategory,
      updateDiscountMilestones,
      updateSettings,
      placeOrder,
      updateOrderStatus,
      toggleOrderTakeaway,
      clearHistory,
      exportBusinessData,
      importBusinessData
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};