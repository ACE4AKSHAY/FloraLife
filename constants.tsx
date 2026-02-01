
import { Species, ShopProduct } from './types';

export const INITIAL_SPECIES: Species[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    scientificName: 'Solanum lycopersicum',
    category: 'Agriculture',
    difficulty: 'easy',
    durationDays: 90,
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=150&q=80',
    description: 'A popular fruit vegetable perfect for home gardens. Easy to grow and highly rewarding.',
    stages: [
      { stage: 'Seed Stage', days: '0-0', emoji: '🌰', instruction: 'Plant seeds 1/4 inch deep in seed-starting mix.' },
      { stage: 'Germination', days: '1-10', emoji: '🌱', instruction: 'Seeds sprout and first roots develop.' },
      { stage: 'Seedling Stage', days: '11-30', emoji: '🌿', instruction: 'First true leaves appear and plant establishes.' },
      { stage: 'Vegetative Growth', days: '31-50', emoji: '🪴', instruction: 'Rapid leaf and stem growth phase.' },
      { stage: 'Flowering Stage', days: '51-65', emoji: '🌸', instruction: 'Yellow flowers appear and pollination occurs.' },
      { stage: 'Fruiting Stage', days: '66-85', emoji: '🍅', instruction: 'Fruits develop and ripen on the vine.' },
      { stage: 'Harvest Time', days: '86-90', emoji: '🧺', instruction: 'Fruits are ripe and ready to pick!' }
    ]
  },
  {
    id: 'basil',
    name: 'Basil',
    emoji: '🌿',
    scientificName: 'Ocimum basilicum',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 60,
    imageUrl: 'https://images.unsplash.com/photo-1618375531912-867984d93700?auto=format&fit=crop&w=150&q=80',
    description: 'A fragrant herb used widely in Mediterranean cooking. Loves warmth and sun.',
    stages: [
      { stage: 'Seed Stage', days: '0-0', emoji: '🌰', instruction: 'Sow seeds on surface, lightly cover.' },
      { stage: 'Germination', days: '5-10', emoji: '🌱', instruction: 'Needs light to germinate.' },
      { stage: 'Seedling Stage', days: '11-25', emoji: '🌿', instruction: 'Transplant or thin out.' },
      { stage: 'Vegetative Growth', days: '26-55', emoji: '🪴', instruction: 'Pinch tips for bushier growth.' },
      { stage: 'Harvest', days: '56-60', emoji: '🧺', instruction: 'Harvest individual leaves or entire stems.' }
    ]
  },
  {
    id: 'mint',
    name: 'Mint',
    emoji: '🍃',
    scientificName: 'Mentha',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 90,
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=150&q=80',
    description: 'Invasive but easy-to-grow herb. Great for teas and fresh dishes.',
    stages: [
      { stage: 'Seed Stage', days: '0-0', emoji: '🌰', instruction: 'Best started from cuttings or seeds.' },
      { stage: 'Germination', days: '10-15', emoji: '🌱', instruction: 'Sprouting roots.' },
      { stage: 'Vegetative Growth', days: '16-80', emoji: '🪴', instruction: 'Fast leaf development.' },
      { stage: 'Harvest', days: '81-90', emoji: '🧺', instruction: 'Cut back regularly to promote new growth.' }
    ]
  },
  {
    id: 'snake_plant',
    name: 'Snake Plant',
    emoji: '🌵',
    scientificName: 'Dracaena trifasciata',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=150&q=80',
    description: 'Tough indoor plant that survives low light and neglect.',
    stages: [
      { stage: 'Growth Stage', days: '1-365', emoji: '🌵', instruction: 'Water only when soil is completely dry.' }
    ]
  },
  {
    id: 'peace_lily',
    name: 'Peace Lily',
    emoji: '🌺',
    scientificName: 'Spathiphyllum',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=150&q=80',
    description: 'Beautiful indoor plant known for its air-purifying qualities and elegant white blooms.',
    stages: [
      { stage: 'Seed Stage', days: '0-0', emoji: '🌰', instruction: 'Start from seeds or division.' },
      { stage: 'Vegetative', days: '1-300', emoji: '🌿', instruction: 'Provide indirect light and high humidity.' },
      { stage: 'Flowering', days: '301-365', emoji: '🌺', instruction: 'Elegant white spathes appear.' }
    ]
  }
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  { id: 'tomato-seeds', name: 'Tomato Seeds - Hybrid', description: 'High-yielding hybrid tomato seeds for home gardens', category: 'Seeds', priceSymbol: '₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' },
  { id: 'basil-seeds', name: 'Italian Basil Seeds', description: 'Aromatic Italian basil for cooking', category: 'Seeds', priceSymbol: '₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' },
  { id: 'npk-fert', name: 'NPK 20-20-20 Fertilizer', description: 'Balanced fertilizer for all growth stages', category: 'Fertilizer', priceSymbol: '₹₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' },
  { id: 'vermicompost', name: 'Organic Vermicompost', description: 'Rich organic compost for healthy soil', category: 'Fertilizer', priceSymbol: '₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' },
  { id: 'watering-can', name: 'Garden Watering Can 5L', description: 'Long spout for precise watering', category: 'Tools', priceSymbol: '₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' },
  { id: 'pruning-shears', name: 'Pruning Shears', description: 'Sharp bypass pruners for clean cuts', category: 'Tools', priceSymbol: '₹₹', amazonUrl: 'https://amazon.com', flipkartUrl: 'https://flipkart.com' }
];
