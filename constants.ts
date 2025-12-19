import { Category, MenuItem, CustomizationOption, RestaurantSettings } from './types';

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: "YOUR CAFE NAME",
  tagline: "ADD YOU TAGLINE",
  address: "",
  phone: "+91 00000 00000",
  gstin: "",
  gstPercentage: 5,
  packingCharge: 20,
  defaultDiscount: 0,
  upiId: "",
  upiName: "",
  googleLocation: ""
};

export const RESTAURANT_NAME = INITIAL_SETTINGS.name;
export const RESTAURANT_DESC = INITIAL_SETTINGS.tagline;

// --- CUSTOMIZATION OPTIONS ---

const MOMO_VARIANTS: CustomizationOption[] = [{
  id: 'filling',
  title: 'Select Filling',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'chicken', name: 'Chicken', price: 20 },
    { id: 'pork', name: 'Pork', price: 50 },
  ]
}];

const MOMO_VARIANTS_SPECIAL: CustomizationOption[] = [{
  id: 'filling',
  title: 'Select Filling',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'chicken', name: 'Chicken', price: 20 },
    { id: 'pork', name: 'Pork', price: 40 },
  ]
}];

const CHEESE_MOMO_VARIANTS: CustomizationOption[] = [{
  id: 'filling',
  title: 'Select Filling',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'chicken', name: 'Chicken', price: 20 },
  ]
}];

const PASTA_VARIANTS: CustomizationOption[] = [{
  id: 'variant',
  title: 'Select Variant',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'egg', name: 'Egg', price: 10 },
    { id: 'chicken', name: 'Chicken', price: 20 },
    { id: 'egg_chicken', name: 'Egg Chicken', price: 30 },
  ]
}];

const CHINESE_VARIANTS: CustomizationOption[] = [{
  id: 'variant',
  title: 'Select Variant',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'egg', name: 'Egg', price: 10 },
    { id: 'chicken', name: 'Chicken', price: 30 },
    { id: 'pork', name: 'Pork', price: 50 },
    { id: 'mixed', name: 'Mixed', price: 50 },
  ]
}];

const SOUP_VARIANTS: CustomizationOption[] = [{
  id: 'variant',
  title: 'Select Variant',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'chicken', name: 'Chicken', price: 20 },
  ]
}];

const CHOPSUEY_VARIANTS: CustomizationOption[] = [{
  id: 'variant',
  title: 'Select Variant',
  type: 'single',
  required: true,
  choices: [
    { id: 'veg', name: 'Veg', price: 0 },
    { id: 'chicken', name: 'Chicken', price: 30 },
  ]
}];

export const MENU_ITEMS: MenuItem[] = [
  // --- MOMO ---
  { id: 'm1', name: 'Steamed Momo', description: 'Classic steamed dumplings.', price: 70, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS },
  { id: 'm2', name: 'Fried Momo', description: 'Crispy deep-fried dumplings.', price: 90, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS },
  { id: 'm3', name: 'Pan Fried Momo', description: 'Pan-seared for extra texture.', price: 120, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS_SPECIAL },
  { id: 'm4', name: 'In-House Schezwan Momo', description: 'Tossed in spicy signature sauce.', price: 130, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS_SPECIAL },
  { id: 'm5', name: 'Manchurian Momo', description: 'Tossed in tangy manchurian gravy.', price: 130, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS_SPECIAL },
  { id: 'm6', name: 'Chilli Garlic Momo', description: 'Garlic kick with a spicy finish.', price: 130, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS_SPECIAL },
  { id: 'm7', name: 'Sepeen Chilli Momo', description: 'Unique Tibetan spicy flavor.', price: 130, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: MOMO_VARIANTS_SPECIAL },
  { id: 'm8', name: 'Kabiraji Momo', description: 'Traditional breaded egg-wrap style.', price: 150, category: Category.MOMO, image: '', ingredients: [], dietaryTags: ['Non-Veg'], isChefSpecial: true, customizationOptions: [{ id: 'k', title: 'Select Meat', type: 'single', required: true, choices: [{ id: 'chicken', name: 'Chicken', price: 0 }, { id: 'pork', name: 'Pork', price: 20 }] }] },

  // --- CHEESE MOMO ---
  { id: 'cm1', name: 'Steamed Cheese Momo', description: 'Melty cheese filling.', price: 90, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm2', name: 'Fried Cheese Momo', description: 'Crunchy cheese joy.', price: 110, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm3', name: 'Pan Fried Cheese Momo', description: 'Seared cheese dumplings.', price: 140, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm4', name: 'In-House Schezwan Cheese Momo', description: 'Spicy cheese delight.', price: 150, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm5', name: 'Manchurian Cheese Momo', description: 'Cheese momos in manchurian sauce.', price: 150, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm6', name: 'Chilli Garlic Cheese Momo', description: 'Garlic cheese fusion.', price: 150, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },
  { id: 'cm7', name: 'Sepeen Chilli Cheese Momo', description: 'Spicy Tibetan cheese momo.', price: 150, category: Category.CHEESE_MOMO, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHEESE_MOMO_VARIANTS },

  // --- PASTA ---
  { id: 'pst1', name: 'White Sauce Pasta', description: 'Creamy and rich.', price: 129, category: Category.PASTA, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: PASTA_VARIANTS },
  { id: 'pst2', name: 'Red Sauce Pasta', description: 'Tangy and spicy tomato base.', price: 129, category: Category.PASTA, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: PASTA_VARIANTS },
  { id: 'pst3', name: 'Mixed Sauce Pasta', description: 'The best of both worlds.', price: 129, category: Category.PASTA, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: PASTA_VARIANTS },

  // --- SIDES (VEG) ---
  { id: 'sv1', name: 'French Fries', description: 'Classic salted fries.', price: 99, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv2', name: 'Chilli Paneer', description: 'Cottage cheese in spicy sauce.', price: 179, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv3', name: 'Veg Manchurian', description: 'Veg balls in tangy gravy.', price: 169, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv4', name: 'Chilli Baby Corn', description: 'Crispy baby corn in chilli.', price: 179, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv5', name: 'Crispy Baby Corn', description: 'Deep fried crunchy baby corn.', price: 189, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv6', name: 'Mushroom Manchurian (Garlic)', description: 'Mushrooms in garlic manchurian.', price: 189, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv7', name: 'Mushroom Manchurian (Schezwan)', description: 'Mushrooms in spicy schezwan.', price: 199, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv8', name: 'Mixed Vegetable Gravy', description: 'Assorted veggies in chinese gravy.', price: 199, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv9', name: 'Chilli Potato', description: 'Spicy potato stir fry.', price: 120, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv10', name: 'Honey Chilli Potato', description: 'Sweet and spicy glazed potatoes.', price: 130, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'sv11', name: 'Crispy Chilli Mushroom', description: 'Crunchy mushroom in chilli.', price: 169, category: Category.SIDES_VEG, image: '', ingredients: [], dietaryTags: ['Veg'] },

  // --- NOODLES ---
  { id: 'nd1', name: 'Plain Hakka Noodles', description: 'Classic wok-tossed.', price: 120, category: Category.NOODLES, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },
  { id: 'nd2', name: 'Chilli Garlic Noodles', description: 'Spicy garlic flavor.', price: 130, category: Category.NOODLES, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },
  { id: 'nd3', name: 'Schezwan Noodles', description: 'Fiery schezwan toss.', price: 140, category: Category.NOODLES, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },
  { id: 'nd4', name: 'Butter Garlic Noodles', description: 'Buttery smooth garlic noodles.', price: 140, category: Category.NOODLES, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },
  { id: 'nd5', name: 'Gravy Noodles', description: 'Topped with cantonese gravy.', price: 150, category: Category.NOODLES, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },

  // --- RICE ---
  { id: 'rc1', name: 'Plain Fried Rice', description: 'Classic tossed rice.', price: 130, category: Category.RICE, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },
  { id: 'rc2', name: 'Chilli Garlic Fried Rice', description: 'Spicy and garlicky.', price: 140, category: Category.RICE, image: '', ingredients: [], dietaryTags: ['Veg', 'Non-Veg'], customizationOptions: CHINESE_VARIANTS },

  // --- COMBOS ---
  { id: 'cb1', name: 'Veg Fried Rice Combo', description: 'Veg Fried Rice + 4 pcs Chilli Paneer + 2 pcs Veg Fried Momos', price: 240, category: Category.COMBO, image: '', ingredients: [], dietaryTags: ['Veg'] },
  { id: 'cb2', name: 'Chicken Rice Combo', description: 'Chicken Fried Rice + Chilli Chicken + 2 pcs Chicken Momos', price: 240, category: Category.COMBO, image: '', ingredients: [], dietaryTags: ['Non-Veg'] }
];