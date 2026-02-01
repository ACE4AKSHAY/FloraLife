
import React, { useState } from 'react';
import { Plant, AppTab } from '../types';
import { Plus, Scan, ChevronRight, Leaf, BookOpen, Calendar, CheckCircle2, Droplets, Moon, Sun } from 'lucide-react';
import { INITIAL_SPECIES } from '../constants';

const FloraLifeLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center shrink-0`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#88C442" />
      <path d="M50 15C50 15 25 35 25 60C25 73.8071 36.1929 85 50 85C63.8071 85 75 73.8071 75 60C75 35 50 15 50 15Z" fill="white" fillOpacity="0.2" />
      <path d="M38.8681 72.8436C29.6231 64.9189 25.1384 53.0563 26.6976 40.5284C27.027 37.8821 30.1557 36.6508 32.1465 38.4019C38.9912 44.4259 44.383 51.5283 48.0163 59.5447C51.6496 67.5611 53.4475 76.3193 53.3039 85.1169C53.2952 85.6515 52.8532 86.0792 52.3184 86.0722C47.2588 86.0064 42.6687 81.3533 38.8681 72.8436Z" fill="white" />
      <path d="M66.4568 22.3848C56.1215 24.1824 46.5491 29.5375 38.8681 37.8436C31.1872 46.1497 25.6669 57.0874 23.0116 69.1989C22.8688 69.8504 23.4651 70.4042 24.1166 70.2241C34.7865 67.2736 44.4608 61.3409 52.0163 53.5447C59.5719 45.7485 64.6953 35.7923 66.7118 24.6469C66.8344 23.9741 66.2482 23.4208 65.5753 23.5434" fill="white" />
    </svg>
  </div>
);

interface HomeViewProps {
  plants: Plant[];
  onAddPlant: () => void;
  onScan: () => void;
  onNavigateGuide: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ plants, onAddPlant, onScan, onNavigateGuide, isDarkMode, toggleDarkMode }) => {
  const activeCount = plants.filter(p => !p.harvested).length;
  const harvestedCount = plants.filter(p => p.harvested).length;
  const remindersCount = plants.reduce((acc, p) => acc + p.reminders.filter(r => !r.completed).length, 0);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Home' | 'Agriculture'>('All');

  const filteredLibrary = INITIAL_SPECIES.filter(s => activeFilter === 'All' || s.category === activeFilter);

  return (
    <div className="p-5 flex flex-col gap-6 bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FloraLifeLogo className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight leading-none">FloraLife</h1>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-1">Your complete growing companion</p>
          </div>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-3 bg-white dark:bg-[#1e1e1c] rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="bg-[#e7f3ef] dark:bg-[#1a2d26] text-[#559a73] dark:text-[#7ab895] p-4 rounded-2xl flex items-center gap-3 border border-[#d6e9e2] dark:border-[#243d34]">
        <Droplets size={20} className="shrink-0" />
        <p className="text-xs font-bold">Don't forget to water your plants today!</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: activeCount, icon: Leaf },
          { label: 'Reminders', value: remindersCount, icon: Calendar },
          { label: 'Harvested', value: harvestedCount, icon: CheckCircle2 }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm relative overflow-hidden transition-colors">
            <stat.icon size={14} className="absolute top-2 right-2 text-stone-200 dark:text-stone-700" />
            <span className="text-2xl font-black text-stone-800 dark:text-stone-100">{stat.value}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onAddPlant}
          className="flex-1 bg-[#559a73] dark:bg-[#437a5b] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-md active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Plant
        </button>
        <button 
          onClick={onScan}
          className="flex-1 bg-[#8b7e74] dark:bg-[#6b5f56] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-md active:scale-95 transition-all"
        >
          <Scan size={20} /> Scan Plant
        </button>
      </div>

      <section className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-5 rounded-[32px] shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-stone-800 dark:text-stone-100">Plant Library</h2>
          <button onClick={onAddPlant} className="text-stone-400 dark:text-stone-500 text-xs font-bold flex items-center gap-1">
            See All <ChevronRight size={14} />
          </button>
        </div>

        {/* Library Filters */}
        <div className="flex gap-1 bg-stone-50 dark:bg-stone-900 p-1 rounded-2xl mb-6">
          {['All', 'Home', 'Agriculture'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${
                activeFilter === f 
                  ? 'bg-white dark:bg-[#2a2a28] text-stone-800 dark:text-stone-100 shadow-sm' 
                  : 'text-stone-400 dark:text-stone-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {filteredLibrary.map((species) => (
            <div key={species.id} className="min-w-[60px] flex flex-col items-center gap-3 cursor-pointer" onClick={onAddPlant}>
              <span className="text-3xl">{species.emoji}</span>
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-tight">{species.name.slice(0, 5)}...</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[32px] shadow-sm transition-colors">
        <h2 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-5">Complete Plant Care</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onNavigateGuide} className="bg-[#f4f7f5] dark:bg-[#1a2d26] p-5 rounded-2xl flex flex-col gap-3 text-left">
            <div className="bg-white dark:bg-[#2a2a28] p-2 w-fit rounded-lg shadow-sm">
              <BookOpen size={20} className="text-[#559a73] dark:text-[#7ab895]" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-800 dark:text-stone-100 leading-tight">Growing Guides</p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">Step-by-step</p>
            </div>
          </button>
          <button onClick={onNavigateGuide} className="bg-[#f4f7f5] dark:bg-[#1a2d26] p-5 rounded-2xl flex flex-col gap-3 text-left">
            <div className="bg-white dark:bg-[#2a2a28] p-2 w-fit rounded-lg shadow-sm">
              <Leaf size={20} className="text-[#559a73] dark:text-[#7ab895]" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-800 dark:text-stone-100 leading-tight">Fertilizer Guide</p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">NPK & schedules</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
