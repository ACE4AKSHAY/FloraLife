
import React, { useState } from 'react';
import { Search, ExternalLink, ShoppingBag, Leaf, Droplets } from 'lucide-react';
import { SHOP_PRODUCTS } from '../constants';

const ShopView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Seeds' | 'Fertilizer' | 'Tools'>('All');
  const [search, setSearch] = useState('');

  const filteredProducts = SHOP_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const CategoryIcon = ({ cat }: { cat: string }) => {
    switch (cat) {
      case 'Seeds': return <Leaf size={16} />;
      case 'Fertilizer': return <Droplets size={16} />;
      case 'Tools': return <ShoppingBag size={16} />;
      default: return null;
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6 bg-[#fdfdfb] dark:bg-[#121211] min-h-full transition-colors duration-300">
      <header>
        <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">Garden Shop</h1>
        <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Expert curated products for your garden</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full bg-[#f4f4f4] dark:bg-stone-900 py-4 pl-12 pr-4 rounded-2xl focus:outline-none text-sm dark:text-stone-100 placeholder:text-stone-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1 bg-[#8b7e74]/10 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
        {['All', 'Seeds', 'Fertilizer', 'Tools'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`flex-1 min-w-[80px] py-3 text-[11px] font-bold rounded-xl transition-all ${
              activeCategory === cat 
              ? 'bg-white dark:bg-[#1e1e1c] text-stone-800 dark:text-stone-100 shadow-sm' 
              : 'text-stone-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 pb-20">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-5 rounded-[32px] shadow-sm space-y-4 transition-colors">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 shrink-0 bg-stone-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center text-stone-400">
                <CategoryIcon cat={product.category} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-stone-800 dark:text-stone-100 leading-tight">{product.name}</h3>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 font-medium leading-relaxed">{product.description}</p>
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-stone-50 dark:bg-stone-900 w-fit rounded-full text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  <CategoryIcon cat={product.category} /> {product.category}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-3 border-t border-stone-50 dark:border-stone-900">
              <a 
                href={product.amazonUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white dark:bg-[#2a2a28] border border-stone-100 dark:border-stone-800 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-widest active:scale-95 transition-all shadow-sm"
              >
                <ExternalLink size={14} /> Amazon
              </a>
              <a 
                href={product.flipkartUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white dark:bg-[#2a2a28] border border-stone-100 dark:border-stone-800 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-widest active:scale-95 transition-all shadow-sm"
              >
                <ExternalLink size={14} /> Flipkart
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopView;
