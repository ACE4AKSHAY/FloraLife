
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
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=300&q=80',
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
    id: 'chili',
    name: 'Chili Pepper',
    emoji: '🌶️',
    scientificName: 'Capsicum annuum',
    category: 'Agriculture',
    difficulty: 'medium',
    durationDays: 100,
    imageUrl: 'https://images.unsplash.com/photo-1590218126049-06618e9447a1?auto=format&fit=crop&w=300&q=80',
    description: 'Vibrant and spicy peppers that love full sun and warm weather.',
    stages: [
      { stage: 'Seed Stage', days: '0-0', emoji: '🌰', instruction: 'Start indoors 8-10 weeks before last frost.' },
      { stage: 'Germination', days: '7-21', emoji: '🌱', instruction: 'Requires consistent warmth (25-30°C).' },
      { stage: 'Seedling', days: '22-45', emoji: '🌿', instruction: 'Move to larger pots when 3-4 leaves appear.' },
      { stage: 'Vegetative', days: '46-70', emoji: '🪴', instruction: 'Sturdy stems develop. Do not overwater.' },
      { stage: 'Flowering', days: '71-85', emoji: '🌼', instruction: 'Small white flowers appear.' },
      { stage: 'Harvest', days: '86-100', emoji: '🌶️', instruction: 'Harvest when fully colored and firm.' }
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
    imageUrl: 'https://images.unsplash.com/photo-1618375531912-867984d93700?auto=format&fit=crop&w=300&q=80',
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
    id: 'aloe',
    name: 'Aloe Vera',
    emoji: '🌵',
    scientificName: 'Aloe barbadensis miller',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=300&q=80',
    description: 'A medicinal succulent known for its healing gel and easy maintenance.',
    stages: [
      { stage: 'Establishment', days: '0-30', emoji: '🪴', instruction: 'Ensure well-draining succulent soil.' },
      { stage: 'Steady Growth', days: '31-300', emoji: '🌿', instruction: 'Bright indirect light and monthly watering.' },
      { stage: 'Maturation', days: '301-365', emoji: '🌵', instruction: 'Pups may appear at the base for propagation.' }
    ]
  },
  {
    id: 'lavender',
    name: 'Lavender',
    emoji: '🪻',
    scientificName: 'Lavandula',
    category: 'Home',
    difficulty: 'medium',
    durationDays: 120,
    imageUrl: 'https://images.unsplash.com/photo-1565011523534-747a8601f10a?auto=format&fit=crop&w=300&q=80',
    description: 'Fragrant purple flowers that thrive in dry soil.',
    stages: [
      { stage: 'Germination', days: '0-28', emoji: '🌱', instruction: 'Can be slow and erratic. Keep moist.' },
      { stage: 'Seedling', days: '29-60', emoji: '🌿', instruction: 'Protect from excess humidity.' },
      { stage: 'Vegetative', days: '61-100', emoji: '🪴', instruction: 'Prune lightly to maintain shape.' },
      { stage: 'Flowering', days: '101-120', emoji: '🪻', instruction: 'Full fragrant blooms ready for drying.' }
    ]
  },
  {
    id: 'spinach',
    name: 'Spinach',
    emoji: '🥬',
    scientificName: 'Spinacia oleracea',
    category: 'Agriculture',
    difficulty: 'easy',
    durationDays: 45,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80',
    description: 'Cool-weather leafy green that is fast-growing and nutrient-dense.',
    stages: [
      { stage: 'Germination', days: '1-7', emoji: '🌱', instruction: 'Watch for rapid sprouting in cool soil.' },
      { stage: 'Seedling', days: '8-20', emoji: '🌿', instruction: 'Thin plants to 4-6 inches apart.' },
      { stage: 'Full Harvest', days: '21-45', emoji: '🧺', instruction: 'Harvest before weather turns hot.' }
    ]
  },
  {
    id: 'snake_plant',
    name: 'Snake Plant',
    emoji: '🐍',
    scientificName: 'Dracaena trifasciata',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=300&q=80',
    description: 'Tough indoor plant that survives low light and neglect.',
    stages: [
      { stage: 'Growth Stage', days: '1-365', emoji: '🐍', instruction: 'Water only when soil is completely dry.' }
    ]
  },
  {
    id: 'mint',
    name: 'Mint',
    emoji: '🍃',
    scientificName: 'Mentha',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 60,
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=300&q=80',
    description: 'Fast-growing aromatic herb. Best grown in pots as it can be invasive.',
    stages: [
      { stage: 'Seedling', days: '1-20', emoji: '🌱', instruction: 'Keep soil moist and provide indirect light.' },
      { stage: 'Expansion', days: '21-50', emoji: '🌿', instruction: 'Watch for runners spreading quickly.' },
      { stage: 'Harvest', days: '51-60', emoji: '🍃', instruction: 'Pinch off leaves for fresh use.' }
    ]
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    scientificName: 'Fragaria × ananassa',
    category: 'Agriculture',
    difficulty: 'medium',
    durationDays: 90,
    imageUrl: 'https://images.unsplash.com/photo-1464960350423-93c6ba20849a?auto=format&fit=crop&w=300&q=80',
    description: 'Sweet red berries that grow best in fertile, well-drained soil.',
    stages: [
      { stage: 'Planting', days: '0-0', emoji: '🪴', instruction: 'Plant crowns with the center bud above soil.' },
      { stage: 'Establishment', days: '1-30', emoji: '🌿', instruction: 'Remove first flowers to encourage roots.' },
      { stage: 'Flowering', days: '31-60', emoji: '🌸', instruction: 'White flowers appear, attract pollinators.' },
      { stage: 'Harvest', days: '61-90', emoji: '🍓', instruction: 'Pick when berries are fully red.' }
    ]
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    scientificName: 'Helianthus annuus',
    category: 'Agriculture',
    difficulty: 'easy',
    durationDays: 80,
    imageUrl: 'https://images.unsplash.com/photo-1597420498492-c55d6f303e92?auto=format&fit=crop&w=300&q=80',
    description: 'Tall, bright yellow flowers that follow the sun.',
    stages: [
      { stage: 'Germination', days: '1-10', emoji: '🌱', instruction: 'Sow directly in sunny spot.' },
      { stage: 'Growth', days: '11-60', emoji: '🌻', instruction: 'Stake if necessary as they grow tall.' },
      { stage: 'Bloom', days: '61-80', emoji: '✨', instruction: 'Flowers fully open, attract bees.' }
    ]
  },
  {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    scientificName: 'Daucus carota subsp. sativus',
    category: 'Agriculture',
    difficulty: 'easy',
    durationDays: 75,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80',
    description: 'Crunchy root vegetable. Needs loose, sandy soil for straight growth.',
    stages: [
      { stage: 'Germination', days: '1-14', emoji: '🌱', instruction: 'Keep soil moist until sprouts appear.' },
      { stage: 'Root Growth', days: '15-60', emoji: '🌿', instruction: 'Thin seedlings to avoid crowding.' },
      { stage: 'Harvest', days: '61-75', emoji: '🥕', instruction: 'Pull up when shoulder of carrot is visible.' }
    ]
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    emoji: '🥒',
    scientificName: 'Cucumis sativus',
    category: 'Agriculture',
    difficulty: 'medium',
    durationDays: 60,
    imageUrl: 'https://images.unsplash.com/photo-1449339854873-750e6913301b?auto=format&fit=crop&w=300&q=80',
    description: 'Hydrating climbing vine. Requires trellis or space to crawl.',
    stages: [
      { stage: 'Seedling', days: '1-15', emoji: '🌱', instruction: 'Very sensitive to frost.' },
      { stage: 'Vining', days: '16-40', emoji: '🌿', instruction: 'Provide support for vertical growth.' },
      { stage: 'Harvest', days: '41-60', emoji: '🥒', instruction: 'Pick frequently to encourage more fruit.' }
    ]
  },
  {
    id: 'peace_lily',
    name: 'Peace Lily',
    emoji: '⚪',
    scientificName: 'Spathiphyllum',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=300&q=80',
    description: 'Elegant white blooms. Excellent air purifier.',
    stages: [
      { stage: 'Growth', days: '1-365', emoji: '🌿', instruction: 'Water when leaves begin to droop slightly.' }
    ]
  },
  {
    id: 'monstera',
    name: 'Monstera',
    emoji: '🪴',
    scientificName: 'Monstera deliciosa',
    category: 'Home',
    difficulty: 'medium',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=300&q=80',
    description: 'Known as the Swiss Cheese plant due to its unique fenestrated leaves.',
    stages: [
      { stage: 'Adolescent', days: '1-180', emoji: '🌿', instruction: 'Loves bright, indirect light.' },
      { stage: 'Fenestration', days: '181-365', emoji: '🪴', instruction: 'Larger leaves begin to split.' }
    ]
  },
  {
    id: 'pothos',
    name: 'Pothos',
    emoji: '🍃',
    scientificName: 'Epipremnum aureum',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1591333139264-474323223011?auto=format&fit=crop&w=300&q=80',
    description: 'Hardiest trailing vine. Perfect for beginners.',
    stages: [
      { stage: 'Trailing', days: '1-365', emoji: '🍃', instruction: 'Easy to propagate from cuttings in water.' }
    ]
  },
  {
    id: 'zz_plant',
    name: 'ZZ Plant',
    emoji: '🌿',
    scientificName: 'Zamioculcas zamiifolia',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?auto=format&fit=crop&w=300&q=80',
    description: 'Waxy green leaves. Thrives in low light conditions.',
    stages: [
      { stage: 'Growth', days: '1-365', emoji: '🌿', instruction: 'Very drought tolerant, do not overwater.' }
    ]
  },
  {
    id: 'marigold',
    name: 'Marigold',
    emoji: '🌼',
    scientificName: 'Tagetes',
    category: 'Agriculture',
    difficulty: 'easy',
    durationDays: 60,
    imageUrl: 'https://images.unsplash.com/photo-1588613254901-5743033f78e4?auto=format&fit=crop&w=300&q=80',
    description: 'Cheerful flowers that act as natural pest deterrents.',
    stages: [
      { stage: 'Bloom', days: '1-60', emoji: '🌼', instruction: 'Deadhead spent flowers to keep blooming.' }
    ]
  },
  {
    id: 'lemon_tree',
    name: 'Lemon Tree',
    emoji: '🍋',
    scientificName: 'Citrus × limon',
    category: 'Agriculture',
    difficulty: 'hard',
    durationDays: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=300&q=80',
    description: 'Citrus tree that produces sour yellow fruit. Needs lots of sun.',
    stages: [
      { stage: 'Sapling', days: '1-365', emoji: '🌱', instruction: 'Protect from freezing temperatures.' },
      { stage: 'Flowering', days: '366-700', emoji: '🌸', instruction: 'Fragrant white blossoms.' },
      { stage: 'Fruiting', days: '701-1000', emoji: '🍋', instruction: 'Fruit takes months to ripen.' }
    ]
  },
  {
    id: 'orchid',
    name: 'Orchid',
    emoji: '🌸',
    scientificName: 'Orchidaceae',
    category: 'Home',
    difficulty: 'hard',
    durationDays: 365,
    imageUrl: 'https://images.unsplash.com/photo-1597072631870-e62871161729?auto=format&fit=crop&w=300&q=80',
    description: 'Stunning tropical flowers. Requires specific humidity and medium.',
    stages: [
      { stage: 'Bloom Period', days: '1-365', emoji: '🌸', instruction: 'Use specialized orchid bark or moss.' }
    ]
  },
  {
    id: 'rosemary',
    name: 'Rosemary',
    emoji: '🌿',
    scientificName: 'Salvia rosmarinus',
    category: 'Home',
    difficulty: 'medium',
    durationDays: 180,
    imageUrl: 'https://images.unsplash.com/photo-1515546904379-62a15b83b99b?auto=format&fit=crop&w=300&q=80',
    description: 'Woody, perennial herb with fragrant, evergreen, needle-like leaves.',
    stages: [
      { stage: 'Growth', days: '1-180', emoji: '🌿', instruction: 'Ensure good air circulation around plant.' }
    ]
  }
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  { 
    id: 'tomato-seeds', 
    name: 'Tomato Seeds - Hybrid', 
    description: 'High-yielding hybrid tomato seeds for home gardens', 
    category: 'Seeds', 
    priceSymbol: '₹', 
    amazonUrl: 'https://www.amazon.in/s?k=hybrid+tomato+seeds', 
    flipkartUrl: 'https://www.flipkart.com/search?q=hybrid+tomato+seeds' 
  },
  { 
    id: 'basil-seeds', 
    name: 'Italian Basil Seeds', 
    description: 'Aromatic Italian basil for cooking', 
    category: 'Seeds', 
    priceSymbol: '₹', 
    amazonUrl: 'https://www.amazon.in/s?k=italian+basil+seeds', 
    flipkartUrl: 'https://www.flipkart.com/search?q=italian+basil+seeds' 
  },
  { 
    id: 'npk-fert', 
    name: 'NPK 19-19-19 Fertilizer', 
    description: 'Water soluble fertilizer for balanced growth', 
    category: 'Fertilizer', 
    priceSymbol: '₹₹', 
    amazonUrl: 'https://www.amazon.in/s?k=NPK+19-19-19+fertilizer', 
    flipkartUrl: 'https://www.flipkart.com/search?q=NPK+19-19-19+fertilizer' 
  },
  { 
    id: 'vermicompost', 
    name: 'Organic Vermicompost', 
    description: 'Rich organic manure for all plants', 
    category: 'Fertilizer', 
    priceSymbol: '₹', 
    amazonUrl: 'https://www.amazon.in/s?k=organic+vermicompost+5kg', 
    flipkartUrl: 'https://www.flipkart.com/search?q=organic+vermicompost+5kg' 
  },
  { 
    id: 'watering-can', 
    name: 'Plant Watering Can', 
    description: '5 Litre garden watering can with nozzle', 
    category: 'Tools', 
    priceSymbol: '₹', 
    amazonUrl: 'https://www.amazon.in/s?k=garden+watering+can', 
    flipkartUrl: 'https://www.flipkart.com/search?q=garden+watering+can' 
  },
  { 
    id: 'pruning-shears', 
    name: 'Garden Pruning Shears', 
    description: 'High carbon steel bypass pruners', 
    category: 'Tools', 
    priceSymbol: '₹₹', 
    amazonUrl: 'https://www.amazon.in/s?k=garden+pruning+shears', 
    flipkartUrl: 'https://www.flipkart.com/search?q=garden+pruning+shears' 
  },
  { 
    id: 'pot-mix', 
    name: 'Premium Potting Mix', 
    description: 'Soil-less organic potting soil with coco peat', 
    category: 'Fertilizer', 
    priceSymbol: '₹₹', 
    amazonUrl: 'https://www.amazon.in/s?k=potting+mix+for+plants', 
    flipkartUrl: 'https://www.flipkart.com/search?q=potting+mix+for+plants' 
  },
  { 
    id: 'sprayer', 
    name: 'Hand Pressure Sprayer', 
    description: '2L garden pressure sprayer for foliar feeding', 
    category: 'Tools', 
    priceSymbol: '₹', 
    amazonUrl: 'https://www.amazon.in/s?k=garden+pressure+sprayer+2l', 
    flipkartUrl: 'https://www.flipkart.com/search?q=garden+pressure+sprayer+2l' 
  }
];
