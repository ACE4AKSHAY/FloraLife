
import React, { useState } from 'react';
// Removed non-existent 'Tool' member from lucide-react imports
import { Search, ExternalLink, Filter, ShoppingBag, Leaf, Droplets } from 'lucide-react';
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
    <div className="p-5 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Shop</h1>
        <p className="text-sm text-stone-400">Recommended products</p>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full bg-stone-100 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Seeds', 'Fertilizer', 'Tools'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all font-bold text-sm ${
              activeCategory === cat 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-stone-100 text-stone-500'
            }`}
          >
            <CategoryIcon cat={cat} />
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-stone-100 p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 bg-stone-50 rounded-2xl flex items-center justify-center">
                <CategoryIcon cat={product.category} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-800">{product.name} {product.priceSymbol}</h3>
                </div>
                <p className="text-xs text-stone-400 mt-1">{product.description}</p>
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-stone-50 w-fit rounded-full text-[10px] font-bold text-stone-400 uppercase">
                  <CategoryIcon cat={product.category} /> {product.category}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-stone-50">
              <a 
                href={product.amazonUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white border border-stone-100 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                <ExternalLink size={14} /> Amazon
              </a>
              <a 
                href={product.flipkartUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white border border-stone-100 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
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
