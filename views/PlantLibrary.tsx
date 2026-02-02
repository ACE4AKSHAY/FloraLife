
import React, { useState, useEffect } from 'react';
import { Species, Plant, StageInfo } from '../types';
import { storageService } from '../services/storageService';
import { ChevronLeft, Search, Plus, Calendar, X, Droplets, Info, Sparkles, Sprout, Edit3, Save } from 'lucide-react';
import { INITIAL_SPECIES } from '../constants';

interface PlantLibraryViewProps {
  onBack: () => void;
  onAdd: () => void;
}

const PlantLibraryView: React.FC<PlantLibraryViewProps> = ({ onBack, onAdd }) => {
  const [library, setLibrary] = useState<Species[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Home' | 'Agriculture'>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Custom Species creation state
  const [newSpecies, setNewSpecies] = useState<Partial<Species>>({
    name: '',
    emoji: '🌱',
    scientificName: '',
    category: 'Home',
    difficulty: 'easy',
    durationDays: 30,
    description: '',
    stages: [{ stage: 'Growth', days: '1-30', emoji: '🌿', instruction: 'Basic care' }]
  });

  // Plant tracking states
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState('');

  // Calculator states
  const [harvestStartDate, setHarvestStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [potSize, setPotSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [sunExposure, setSunExposure] = useState<'Low' | 'Moderate' | 'Full'>('Moderate');

  useEffect(() => {
    setLibrary(storageService.getLibrary());
  }, []);

  const filtered = library.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || s.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateSpecies = () => {
    if (!newSpecies.name) return;
    
    const speciesToAdd: Species = {
      id: `custom_${Date.now()}`,
      name: newSpecies.name,
      emoji: newSpecies.emoji || '🌱',
      scientificName: newSpecies.scientificName || 'Unknown',
      category: newSpecies.category as any || 'Home',
      difficulty: newSpecies.difficulty as any || 'easy',
      durationDays: Number(newSpecies.durationDays) || 30,
      description: newSpecies.description || 'Custom plant profile',
      stages: newSpecies.stages as StageInfo[] || [],
      imageUrl: ''
    };

    const updatedLibrary = [...library, speciesToAdd];
    storageService.saveLibrary(updatedLibrary);
    setLibrary(updatedLibrary);
    setShowCreateModal(false);
  };

  const handleStartTracking = () => {
    if (!selectedSpecies) return;

    const newPlant: Plant = {
      id: Math.random().toString(36).substr(2, 9),
      speciesId: selectedSpecies.id,
      customName: nickname || selectedSpecies.name,
      location: location,
      plantedAt: new Date(harvestStartDate).getTime(),
      harvested: false,
      careLogs: [],
      reminders: [],
      photos: []
    };

    storageService.addPlant(newPlant);
    setShowAddModal(false);
    onAdd();
  };

  // Water Calculation Logic
  const calculateWaterNeeds = () => {
    if (!selectedSpecies) return { frequency: '', amount: '' };
    
    let baseFreq = 3; // base frequency in days
    if (selectedSpecies.difficulty === 'hard') baseFreq = 2;
    if (selectedSpecies.name.toLowerCase().includes('snake') || selectedSpecies.name.toLowerCase().includes('succulent')) baseFreq = 10;

    // Adjust for Pot Size
    if (potSize === 'Small') baseFreq -= 1;
    if (potSize === 'Large') baseFreq += 2;

    // Adjust for Sunlight
    if (sunExposure === 'Full') baseFreq -= 1;
    if (sunExposure === 'Low') baseFreq += 3;

    baseFreq = Math.max(1, baseFreq);

    const amount = potSize === 'Small' ? '150-200ml' : potSize === 'Medium' ? '400-500ml' : '1-1.5L';
    
    return {
      frequency: `Every ${baseFreq} ${baseFreq === 1 ? 'day' : 'days'}`,
      amount
    };
  };

  // Harvest Calculation Logic
  const getEstimatedHarvest = () => {
    if (!selectedSpecies) return '';
    const start = new Date(harvestStartDate);
    start.setDate(start.getDate() + selectedSpecies.durationDays);
    return start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (selectedSpecies && !showAddModal) {
    const waterInfo = calculateWaterNeeds();
    return (
      <div className="flex flex-col min-h-screen bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
        <header className="p-5 flex items-center gap-3 border-b border-stone-50 dark:border-stone-800 bg-white dark:bg-[#1e1e1c] sticky top-0 z-30">
          <button onClick={() => setSelectedSpecies(null)} className="p-1 -ml-1 text-stone-400"><ChevronLeft size={28} /></button>
          <div>
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">{selectedSpecies.name}</h1>
            <p className="text-xs text-stone-400 italic">{selectedSpecies.scientificName}</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-8 rounded-[40px] shadow-sm flex flex-col items-center gap-6 relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 dark:bg-stone-900 rounded-full -mr-16 -mt-16 opacity-30"></div>
             <span className="text-7xl mb-2">{selectedSpecies.emoji}</span>
             <div className="text-center">
                <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 mb-1">{selectedSpecies.name}</h2>
                <p className="text-xs italic text-stone-400 mb-4">{selectedSpecies.scientificName}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-1.5 bg-[#8b7e74] text-white text-[11px] font-bold rounded-full">{selectedSpecies.category}</span>
                  <span className={`px-4 py-1.5 text-white text-[11px] font-bold rounded-full ${selectedSpecies.difficulty === 'easy' ? 'bg-[#559a73]' : selectedSpecies.difficulty === 'medium' ? 'bg-amber-600' : 'bg-red-400'}`}>{selectedSpecies.difficulty}</span>
                  <span className="px-4 py-1.5 bg-white dark:bg-[#2a2a28] border border-stone-100 dark:border-stone-800 text-stone-400 text-[11px] font-bold rounded-full flex items-center gap-1.5">
                    <Calendar size={12} /> {selectedSpecies.durationDays} days
                  </span>
                </div>
             </div>
             <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed text-center px-4">
                {selectedSpecies.description}
             </p>
          </div>

          {/* CALCULATORS SECTION */}
          <div className="grid grid-cols-1 gap-6">
            {/* Water Calculator */}
            <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[32px] shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl text-blue-500">
                  <Droplets size={20} />
                </div>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Water Calculator</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Pot Size</span>
                  <div className="flex gap-2 bg-stone-50 dark:bg-stone-900 p-1 rounded-2xl">
                    {['Small', 'Medium', 'Large'].map(size => (
                      <button 
                        key={size}
                        onClick={() => setPotSize(size as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${potSize === size ? 'bg-white dark:bg-[#2a2a28] text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Sun Exposure</span>
                  <div className="flex gap-2 bg-stone-50 dark:bg-stone-900 p-1 rounded-2xl">
                    {['Low', 'Moderate', 'Full'].map(sun => (
                      <button 
                        key={sun}
                        onClick={() => setSunExposure(sun as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${sunExposure === sun ? 'bg-white dark:bg-[#2a2a28] text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-400'}`}
                      >
                        {sun}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Requirement</p>
                    <p className="text-sm font-black text-blue-800 dark:text-blue-400">{waterInfo.frequency}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Amount</p>
                    <p className="text-sm font-black text-blue-800 dark:text-blue-400">{waterInfo.amount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Harvest Calculator */}
            <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[32px] shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl text-amber-500">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Harvest Calculator</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Planned Planting Date</span>
                  <input 
                    type="date" 
                    className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl border-none focus:ring-0 text-sm font-bold text-stone-700 dark:text-stone-200"
                    value={harvestStartDate}
                    onChange={(e) => setHarvestStartDate(e.target.value)}
                  />
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-center gap-4">
                  <div className="bg-white dark:bg-[#2a2a28] p-3 rounded-2xl shadow-sm text-amber-500">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Ready to harvest around</p>
                    <p className="text-base font-black text-amber-900 dark:text-amber-400">{getEstimatedHarvest()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setNickname(`My ${selectedSpecies.name}`);
              setShowAddModal(true);
            }}
            className="w-full bg-[#559a73] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} /> Start Growing {selectedSpecies.name}
          </button>

          {/* Growth Stages List */}
          <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[32px] shadow-sm">
            <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-8">Growth Stages</h3>
            <div className="space-y-10 relative pl-8">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-100 dark:bg-stone-800"></div>
              {selectedSpecies.stages.map((st, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[32px] w-8 h-8 rounded-full border-4 border-white dark:border-[#1e1e1c] shadow-md flex items-center justify-center z-10 ${i === 0 ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-800 opacity-60'}`}>
                    <span className="text-sm">{st.emoji}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${i === 0 ? 'text-[#559a73]' : 'text-stone-800 dark:text-stone-200 opacity-50'}`}>{st.stage} <span className="text-[10px] text-stone-400 font-medium ml-2">Days {st.days}</span></h4>
                    <p className={`text-xs leading-relaxed ${i === 0 ? 'text-stone-600 dark:text-stone-400' : 'text-stone-400 dark:text-stone-600 opacity-50'}`}>{st.instruction}</p>
                    {i === 0 && <span className="inline-block mt-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-400 text-[10px] font-bold rounded-full">📍 Currently at Day 0</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#fdfdfb] dark:bg-[#121211] pb-10 transition-colors duration-300">
      <header className="p-5 flex items-center justify-between border-b border-stone-50 dark:border-stone-800 bg-white dark:bg-[#1e1e1c]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-stone-400"><ChevronLeft size={28} /></button>
          <div>
            <h1 className="text-xl font-black text-stone-800 dark:text-stone-100">Plant Library</h1>
            <p className="text-xs text-stone-400 font-medium">{library.length} species to explore</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
        >
          <Plus size={16} /> Create
        </button>
      </header>

      <div className="p-5 space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search plants..." 
            className="w-full bg-[#f4f4f4] dark:bg-stone-900 py-4 pl-12 pr-4 rounded-2xl focus:outline-none text-sm placeholder:text-stone-400 dark:text-stone-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 bg-[#8b7e74]/10 p-1 rounded-2xl">
          {['All', 'Home', 'Agriculture'].map((f) => {
            const count = f === 'All' ? library.length : library.filter(s => s.category === f).length;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeFilter === f ? 'bg-white dark:bg-[#2a2a28] text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-400'
                }`}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filtered.map(species => (
            <div 
              key={species.id} 
              onClick={() => setSelectedSpecies(species)}
              className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-5 rounded-[32px] shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="flex gap-5">
                <span className="text-5xl">{species.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-stone-800 dark:text-stone-100 tracking-tight">{species.name} <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">{species.difficulty}</span></h3>
                  </div>
                  <p className="text-[11px] italic text-stone-400 mt-0.5">{species.scientificName}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                      <Calendar size={12} className="text-[#8b7e74]/50" /> {species.durationDays} days
                    </span>
                    <span className="text-stone-200">•</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">{species.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-2 pt-2">
                {species.stages.slice(0, 5).map((st, i) => (
                  <span key={i} className={`text-lg ${i > 0 ? 'opacity-30' : ''}`}>{st.emoji}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1c] w-full max-w-sm rounded-[40px] p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in duration-200 shadow-2xl transition-colors">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-stone-400"><X size={20} /></button>
            <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-8">Create New Species</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-20">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Emoji</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-center text-2xl"
                    value={newSpecies.emoji}
                    onChange={e => setNewSpecies({...newSpecies, emoji: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Common Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Lavender"
                    className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm"
                    value={newSpecies.name}
                    onChange={e => setNewSpecies({...newSpecies, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Scientific Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Lavandula"
                  className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm italic"
                  value={newSpecies.scientificName}
                  onChange={e => setNewSpecies({...newSpecies, scientificName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Category</label>
                  <select 
                    className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm appearance-none"
                    value={newSpecies.category}
                    onChange={e => setNewSpecies({...newSpecies, category: e.target.value as any})}
                  >
                    <option value="Home">Home</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Difficulty</label>
                  <select 
                    className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm appearance-none"
                    value={newSpecies.difficulty}
                    onChange={e => setNewSpecies({...newSpecies, difficulty: e.target.value as any})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Duration (Days)</label>
                <input 
                  type="number" 
                  className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm"
                  value={newSpecies.durationDays}
                  onChange={e => setNewSpecies({...newSpecies, durationDays: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Description</label>
                <textarea 
                  className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl text-sm min-h-[100px]"
                  placeholder="Tell us about this plant..."
                  value={newSpecies.description}
                  onChange={e => setNewSpecies({...newSpecies, description: e.target.value})}
                ></textarea>
              </div>

              <button 
                onClick={handleCreateSpecies}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Save size={20} /> Save to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Garden Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1c] w-full max-w-sm rounded-[40px] p-8 relative animate-in zoom-in duration-200 shadow-2xl transition-colors">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-stone-400"><X size={20} /></button>
            <h2 className="text-xl font-black text-center mb-8 text-stone-800 dark:text-stone-100">Add {selectedSpecies?.name} to Your Garden</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Nickname (optional)</label>
                <input 
                  type="text" 
                  placeholder={`My ${selectedSpecies?.name}`}
                  className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl border border-transparent focus:border-emerald-500/20 focus:outline-none text-sm dark:text-stone-100"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">Location (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Balcony, Kitchen window"
                  className="w-full bg-[#f4f4f4] dark:bg-stone-900 p-4 rounded-2xl border border-transparent focus:border-emerald-500/20 focus:outline-none text-sm dark:text-stone-100"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 flex gap-3">
                <Info size={16} className="text-stone-400 shrink-0" />
                <p className="text-[10px] text-stone-500 leading-tight">Setting the planting date to <b>{new Date(harvestStartDate).toLocaleDateString()}</b> based on your calculator input.</p>
              </div>
              <button 
                onClick={handleStartTracking}
                className="w-full bg-[#559a73] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantLibraryView;
