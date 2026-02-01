
import React, { useState } from 'react';
import { Species } from '../types';
import { Search, ChevronDown, ChevronUp, BookOpen, ClipboardList, Lightbulb, AlertTriangle } from 'lucide-react';

interface GuidesViewProps {
  library: Species[];
}

const GuidesView: React.FC<GuidesViewProps> = ({ library }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>(library[0]);
  const [expandedStage, setExpandedStage] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredLibrary = library.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStage = (index: number) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fdfdfb] pb-20">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-stone-800">Growing Guides</h1>
        <p className="text-sm text-stone-400">Step-by-step instructions</p>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search plants..." 
            className="w-full bg-[#f4f4f4] py-3.5 pl-11 pr-4 rounded-2xl focus:outline-none text-sm placeholder:text-stone-400"
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-bold text-sm ${
              selectedSpecies.id === s.id
              ? 'bg-[#559a73] text-white shadow-md' 
              : 'bg-[#f4f7f5] text-[#555] border border-transparent'
            }`}
          >
            <span className="text-lg">{s.emoji}</span>
            {s.name}
          </button>
        ))}
      </div>

      {/* Main Plant Info Card */}
      <div className="px-6 mb-6">
        <div className="bg-white border border-stone-100 p-6 rounded-[32px] shadow-sm space-y-4">
          <div className="flex gap-5">
            <span className="text-5xl">{selectedSpecies.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-stone-800">{selectedSpecies.name}</h2>
              <p className="text-xs text-stone-400 mb-2">{selectedSpecies.durationDays} days from seed to harvest</p>
            </div>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            {selectedSpecies.description}
          </p>
          <div className="flex gap-2">
            <span className="px-3.5 py-1.5 bg-[#8b7e74] text-white text-[11px] font-bold rounded-full">{selectedSpecies.category}</span>
            <span className={`px-3.5 py-1.5 text-white text-[11px] font-bold rounded-full ${
              selectedSpecies.difficulty === 'easy' ? 'bg-[#559a73]' : 
              selectedSpecies.difficulty === 'medium' ? 'bg-amber-600' : 'bg-red-600'
            }`}>{selectedSpecies.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Complete Growing Guide List */}
      <div className="px-6">
        <div className="bg-white border border-stone-100 p-6 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-[#559a73] font-bold">
            <BookOpen size={20} />
            <span className="text-sm tracking-tight">Complete Growing Guide</span>
          </div>

          <div className="space-y-4">
            {selectedSpecies.stages.map((stage, idx) => (
              <div key={idx} className="border-b border-stone-50 last:border-0 pb-4">
                <button 
                  onClick={() => toggleStage(idx)}
                  className="w-full flex items-center justify-between py-1 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{stage.emoji || '🌱'}</span>
                    <div>
                      <h4 className="font-bold text-stone-800 text-[15px]">{stage.stage}</h4>
                      <p className="text-[11px] text-stone-400 font-medium">Days {stage.days}</p>
                    </div>
                  </div>
                  {expandedStage === idx ? <ChevronUp size={20} className="text-stone-300" /> : <ChevronDown size={20} className="text-stone-300" />}
                </button>
                
                {expandedStage === idx && (
                  <div className="mt-5 pl-12 pr-2 space-y-6">
                    <p className="text-[13px] text-stone-600 leading-relaxed font-medium">
                      {stage.instruction}
                    </p>

                    {/* Care Instructions Section */}
                    {stage.careInstructions && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#b08b5c] font-bold">
                          <ClipboardList size={16} />
                          <span className="text-[12px] uppercase tracking-wide">Care Instructions</span>
                        </div>
                        <div className="space-y-3">
                          {stage.careInstructions.map((ci, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-5 h-5 rounded-full bg-[#559a73] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-[13px] text-stone-600 leading-tight">{ci}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tips Section */}
                    {stage.tips && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-500 font-bold">
                          <Lightbulb size={16} />
                          <span className="text-[12px] uppercase tracking-wide">Tips</span>
                        </div>
                        <ul className="space-y-2">
                          {stage.tips.map((tip, i) => (
                            <li key={i} className="flex gap-2 text-[13px] text-stone-600 leading-tight">
                              <span className="text-stone-400">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings Section */}
                    {stage.warning && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-1">
                        <div className="flex items-center gap-2 text-red-500 font-bold">
                          <AlertTriangle size={16} />
                          <span className="text-[12px] uppercase tracking-wide">Warnings</span>
                        </div>
                        <p className="text-[13px] text-stone-600 leading-relaxed">
                          {stage.warning}
                        </p>
                      </div>
                    )}
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
