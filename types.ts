export enum Category {
  MOMO = "Momo",
  CHEESE_MOMO = "Cheese Momo",
  PASTA = "Pasta",
  SIDES_VEG = "Sides (Veg)",
  SIDES_NON_VEG = "Sides (Non-Veg)",
  NOODLES = "Noodles",
  CHOP_SUEY = "Chop Suey",
  PRAWNS = "Prawns",
  WINGS = "Wings",
  RICE = "Rice",
  SOUP = "Soup",
  COMBO = "Combo"
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  logo?: string;
  address: string;
  phone: string;
  gstin?: string;
  gstPercentage: number;
  packingCharge: number;
  defaultDiscount: number;
  upiId?: string;
  upiName?: string;
  googleLocation?: string;
}

export interface CustomizationChoice {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface CustomizationOption {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  required?: boolean;
  choices: CustomizationChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; 
  image: string;
  ingredients: string[];
  calories?: number;
  dietaryTags: string[]; 
  customizationOptions?: CustomizationOption[];
  isChefSpecial?: boolean;
  suggestedItemId?: string; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
  cartId: string;
  selectedOptions?: CustomizationChoice[];
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface DiscountMilestone {
  threshold: number;
  percentage: number;
}

export interface Order {
  id: string;
  customerName: string;
  tableNo?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  packingCharge: number;
  total: number;
  status: OrderStatus;
  timestamp: number;
  note?: string;
  isTakeaway: boolean;
}

export interface ActivityEntry {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM';
  entity: 'MENU_ITEM' | 'CATEGORY' | 'SETTINGS' | 'PROMOTION';
  description: string;
  timestamp: number;
}