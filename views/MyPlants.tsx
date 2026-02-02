
import React from 'react';
import { Plant, Species } from '../types';
import { Plus, Leaf, Camera, Droplets } from 'lucide-react';

interface MyPlantsViewProps {
  plants: Plant[];
  library: Species[];
  onAdd: () => void;
  onSelectPlant: (id: string) => void;
}

const MyPlantsView: React.FC<MyPlantsViewProps> = ({ plants, library, onAdd, onSelectPlant }) => {
  const activePlants = plants.filter(p => !p.harvested);
  const harvestedPlants = plants.filter(p => p.harvested);

  const getGrowthStats = (plant: Plant) => {
    const species = library.find(s => s.id === plant.speciesId);
    if (!species) return { dayCount: 0, progress: 0, currentStage: 'Seed' };
    const dayCount = Math.floor((Date.now() - plant.plantedAt) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.round((dayCount / species.durationDays) * 100));
    
    // Simple logic to find current stage icon/name
    const currentStageInfo = species.stages.find((st, i) => {
      const nextSt = species.stages[i+1];
      const startDay = parseInt(st.days.split('-')[0]);
      const endDay = nextSt ? parseInt(nextSt.days.split('-')[0]) : 999;
      return dayCount >= startDay && dayCount < endDay;
    });

    return { 
      dayCount, 
      progress, 
      currentStage: currentStageInfo?.stage || 'Growing',
      emoji: currentStageInfo?.emoji || '🌱'
    };
  };

  return (
    <div className="p-5 flex flex-col gap-6 bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">My Plants</h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">{activePlants.length} active, {harvestedPlants.length} harvested</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-[#559a73] dark:bg-[#437a5b] text-white py-2 px-5 rounded-xl flex items-center gap-1.5 font-bold shadow-md active:scale-95 transition-all text-sm"
        >
          <Plus size={18} /> Add
        </button>
      </header>

      {plants.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1e1e1c] border border-dashed border-stone-100 dark:border-stone-800 rounded-[40px] mt-10 transition-colors">
          <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-full mb-6">
            <Leaf size={48} className="text-stone-200 dark:text-stone-700" />
          </div>
          <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-2">No plants yet</h2>
          <p className="text-stone-400 dark:text-stone-500 text-center text-xs mb-8 px-10 font-medium">Start your plant journey by adding your first plant!</p>
          <button 
            onClick={onAdd}
            className="bg-[#559a73] dark:bg-[#437a5b] text-white py-4 px-8 rounded-2xl flex items-center gap-2 font-bold shadow-lg"
          >
            <Plus size={20} /> Browse Plant Library
          </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex items-center gap-2 text-[#559a73] dark:text-[#7ab895] font-bold">
             <Leaf size={16} /> <span className="text-xs uppercase tracking-widest">Active Plants ({activePlants.length})</span>
           </div>
          <div className="grid gap-4">
            {activePlants.map(plant => {
              const species = library.find(s => s.id === plant.speciesId);
              const { dayCount, progress, currentStage, emoji } = getGrowthStats(plant);
              if (!species) return null;

              return (
                <div 
                  key={plant.id} 
                  onClick={() => onSelectPlant(plant.id)}
                  className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-5 rounded-[32px] shadow-sm flex flex-col gap-5 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{species.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
                            {plant.customName} 
                            <span className="px-2.5 py-1 bg-[#8b7e74] dark:bg-[#5c534d] text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                              <span className="text-xs">{emoji}</span> {currentStage}
                            </span>
                          </h3>
                          <p className="text-[11px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-tight">{species.name}</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-tighter">
                        Day {dayCount} <span className="text-stone-200 dark:text-stone-700 mx-1">•</span> Planted {dayCount === 0 ? 'today' : `${dayCount}d ago`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight text-stone-400 dark:text-stone-500 px-1">
                      <span>Growth Progress</span>
                      <span className="text-stone-800 dark:text-stone-100">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-50 dark:bg-stone-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#8b7e74] dark:bg-[#5c534d] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-1 px-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase">
                      <Camera size={14} className="opacity-50" /> {plant.photos.length} photos
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase">
                      <Droplets size={14} className="opacity-50" /> {plant.careLogs.filter(l => l.type === 'Water').length} waterings
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlantsView;
