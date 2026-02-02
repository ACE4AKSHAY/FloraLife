
import React, { useState } from 'react';
import { Species } from '../types';
import { Search, ChevronDown, ChevronUp, BookOpen, ClipboardList, Lightbulb, AlertTriangle } from 'lucide-react';
import { INITIAL_SPECIES } from '../constants';

const GuidesView: React.FC = () => {
  // Always use INITIAL_SPECIES for the static guides tab
  const [selectedSpecies, setSelectedSpecies] = useState<Species>(INITIAL_SPECIES[0]);
  const [expandedStage, setExpandedStage] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredLibrary = INITIAL_SPECIES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStage = (index: number) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fdfdfb] dark:bg-[#121211] pb-20 transition-colors duration-300">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">Growing Guides</h1>
        <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">Original static library guides</p>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search original plants..." 
            className="w-full bg-[#f4f4f4] dark:bg-stone-900 py-4 pl-12 pr-4 rounded-2xl focus:outline-none text-sm dark:text-stone-100 placeholder:text-stone-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Filter List */}
      <div className="flex gap-2.5 overflow-x-auto px-6 mb-6 scrollbar-hide">
        {filteredLibrary.map(s => (
          <button 
            key={s.id}
            onClick={() => setSelectedSpecies(s)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all font-black text-xs uppercase tracking-tight ${
              selectedSpecies.id === s.id
              ? 'bg-[#559a73] text-white shadow-lg' 
              : 'bg-[#f4f7f5] dark:bg-stone-900 text-stone-400 dark:text-stone-600'
            }`}
          >
            <span className="text-lg">{s.emoji}</span>
            {s.name}
          </button>
        ))}
      </div>

      {/* Main Plant Info Card */}
      <div className="px-6 mb-6">
        <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[40px] shadow-sm space-y-4 transition-colors">
          <div className="flex gap-5">
            <span className="text-5xl">{selectedSpecies.emoji}</span>
            <div>
              <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight">{selectedSpecies.name}</h2>
              <p className="text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest">{selectedSpecies.durationDays} days duration</p>
            </div>
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-[13px] leading-relaxed font-medium">
            {selectedSpecies.description}
          </p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-[#8b7e74] text-white text-[10px] font-black rounded-full uppercase tracking-widest">{selectedSpecies.category}</span>
            <span className={`px-4 py-1.5 text-white text-[10px] font-black rounded-full uppercase tracking-widest ${
              selectedSpecies.difficulty === 'easy' ? 'bg-[#559a73]' : 
              selectedSpecies.difficulty === 'medium' ? 'bg-amber-600' : 'bg-red-600'
            }`}>{selectedSpecies.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Complete Growing Guide List */}
      <div className="px-6 pb-10">
        <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[40px] shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-8 text-[#559a73] font-black uppercase tracking-widest text-[11px]">
            <BookOpen size={20} />
            <span>Complete Growing Guide</span>
          </div>

          <div className="space-y-4">
            {selectedSpecies.stages.map((stage, idx) => (
              <div key={idx} className="border-b border-stone-50 dark:border-stone-900 last:border-0 pb-4">
                <button 
                  onClick={() => toggleStage(idx)}
                  className="w-full flex items-center justify-between py-1 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{stage.emoji || '🌱'}</span>
                    <div>
                      <h4 className="font-black text-stone-800 dark:text-stone-100 text-sm">{stage.stage}</h4>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-tight">Days {stage.days}</p>
                    </div>
                  </div>
                  {expandedStage === idx ? <ChevronUp size={20} className="text-stone-300" /> : <ChevronDown size={20} className="text-stone-300" />}
                </button>
                
                {expandedStage === idx && (
                  <div className="mt-5 pl-12 pr-2 space-y-6">
                    <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                      {stage.instruction}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesView;
