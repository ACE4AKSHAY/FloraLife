import React from 'react';
import { Plant, PlantListFilter, Species } from '../types';
import { Calendar, Camera, ChevronLeft, Droplets, Leaf, Plus } from 'lucide-react';
import { countActiveReminders } from '../services/nativeReminderService';

interface MyPlantsViewProps {
  plants: Plant[];
  library: Species[];
  onBackHome: () => void;
  onAdd: () => void;
  onSelectPlant: (id: string) => void;
  selectedFilter: PlantListFilter;
  onSelectFilter: (filter: PlantListFilter) => void;
}

type PlantSection = {
  key: string;
  title: string;
  subtitle: string;
  plants: Plant[];
  emptyMessage: string;
};

const FILTER_OPTIONS: Array<{ value: PlantListFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'harvested', label: 'Harvested' },
];

const MyPlantsView: React.FC<MyPlantsViewProps> = ({
  plants,
  library,
  onBackHome,
  onAdd,
  onSelectPlant,
  selectedFilter,
  onSelectFilter,
}) => {
  const activePlants = plants.filter(plant => !plant.harvested);
  const harvestedPlants = plants.filter(plant => plant.harvested);
  const reminderPlants = activePlants
    .filter(plant => countActiveReminders(plant.reminders) > 0)
    .sort((firstPlant, secondPlant) => countActiveReminders(secondPlant.reminders) - countActiveReminders(firstPlant.reminders));

  const getGrowthStats = (plant: Plant) => {
    const species = library.find(item => item.id === plant.speciesId);

    if (!species) {
      return { dayCount: 0, progress: 0, currentStage: 'Seed', emoji: '🌱' };
    }

    const dayCount = Math.floor((Date.now() - plant.plantedAt) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.round((dayCount / species.durationDays) * 100));

    const currentStageInfo = species.stages.find((stage, index) => {
      const nextStage = species.stages[index + 1];
      const startDay = parseInt(stage.days.split('-')[0], 10);
      const endDay = nextStage ? parseInt(nextStage.days.split('-')[0], 10) : 999;
      return dayCount >= startDay && dayCount < endDay;
    });

    return {
      dayCount,
      progress,
      currentStage: plant.harvested ? 'Harvested' : currentStageInfo?.stage || 'Growing',
      emoji: plant.harvested ? '✅' : currentStageInfo?.emoji || '🌱',
    };
  };

  const sections: PlantSection[] =
    selectedFilter === 'all'
      ? [
          {
            key: 'active',
            title: `Active Plants (${activePlants.length})`,
            subtitle: 'Plants that are still growing',
            plants: activePlants,
            emptyMessage: 'No active plants yet.',
          },
          {
            key: 'harvested',
            title: `Harvested Archive (${harvestedPlants.length})`,
            subtitle: 'Saved for history and presentation',
            plants: harvestedPlants,
            emptyMessage: 'No harvested plants yet.',
          },
        ]
      : [
          {
            key: selectedFilter,
            title:
              selectedFilter === 'active'
                ? `Active Plants (${activePlants.length})`
                : selectedFilter === 'reminders'
                  ? `Plants With Reminders (${reminderPlants.length})`
                  : `Harvested Archive (${harvestedPlants.length})`,
            subtitle:
              selectedFilter === 'active'
                ? 'Plants that are still growing'
                : selectedFilter === 'reminders'
                  ? 'Plants that currently need attention'
                  : 'Completed plants kept as your archive',
            plants:
              selectedFilter === 'active'
                ? activePlants
                : selectedFilter === 'reminders'
                  ? reminderPlants
                  : harvestedPlants,
            emptyMessage:
              selectedFilter === 'active'
                ? 'No active plants yet.'
                : selectedFilter === 'reminders'
                  ? 'No active reminders right now.'
                  : 'No harvested plants yet.',
          },
        ];

  return (
    <div className="p-5 flex flex-col gap-6 bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBackHome} className="p-2 rounded-2xl bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">My Plants</h1>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
              {activePlants.length} active, {harvestedPlants.length} harvested
            </p>
          </div>
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
          <p className="text-stone-400 dark:text-stone-500 text-center text-xs mb-8 px-10 font-medium">Start your plant journey by adding your first plant.</p>
          <button
            onClick={onAdd}
            className="bg-[#559a73] dark:bg-[#437a5b] text-white py-4 px-8 rounded-2xl flex items-center gap-2 font-bold shadow-lg"
          >
            <Plus size={20} /> Browse Plant Library
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 bg-stone-50 dark:bg-stone-900 p-1.5 rounded-[20px] overflow-x-auto scrollbar-hide">
            {FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => onSelectFilter(option.value)}
                className={`flex-1 min-w-[82px] py-3 text-[11px] font-bold rounded-xl transition-all ${
                  selectedFilter === option.value
                    ? 'bg-white dark:bg-[#1e1e1c] text-stone-800 dark:text-stone-100 shadow-sm'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {sections.map(section => (
            <section key={section.key} className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-2 text-[#559a73] dark:text-[#7ab895] font-bold">
                    <Leaf size={16} />
                    <span className="text-xs uppercase tracking-widest">{section.title}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium mt-1">{section.subtitle}</p>
                </div>
              </div>

              {section.plants.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1e1c] border border-dashed border-stone-100 dark:border-stone-800 rounded-[32px] px-6 py-10 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{section.emptyMessage}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {section.plants.map(plant => {
                    const species = library.find(item => item.id === plant.speciesId);

                    if (!species) {
                      return null;
                    }

                    const { dayCount, progress, currentStage, emoji } = getGrowthStats(plant);
                    const activeReminderCount = countActiveReminders(plant.reminders);

                    return (
                      <div
                        key={plant.id}
                        onClick={() => onSelectPlant(plant.id)}
                        className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-5 rounded-[32px] shadow-sm flex flex-col gap-5 active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{species.emoji}</span>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start gap-2">
                              <h3 className="font-black text-stone-800 dark:text-stone-100">{plant.customName}</h3>
                              <span className="px-2.5 py-1 bg-[#8b7e74] dark:bg-[#5c534d] text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                                <span className="text-xs">{emoji}</span> {currentStage}
                              </span>
                              {activeReminderCount > 0 && (
                                <span className="px-2.5 py-1 bg-[#559a73]/10 text-[#559a73] dark:bg-[#559a73]/20 dark:text-[#7ab895] text-[9px] font-bold rounded-full flex items-center gap-1">
                                  <Calendar size={10} /> {activeReminderCount} reminder{activeReminderCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-tight">{species.name}</p>
                            <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-tighter">
                              Day {dayCount} - {plant.harvested ? 'saved in archive' : dayCount === 0 ? 'planted today' : `planted ${dayCount}d ago`}
                            </p>
                          </div>
                        </div>

                        {!plant.harvested && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight text-stone-400 dark:text-stone-500 px-1">
                              <span>Growth Progress</span>
                              <span className="text-stone-800 dark:text-stone-100">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-stone-50 dark:bg-stone-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#8b7e74] dark:bg-[#5c534d] rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 pt-1 px-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase">
                            <Camera size={14} className="opacity-50" /> {plant.photos.length} photos
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase">
                            <Droplets size={14} className="opacity-50" /> {plant.careLogs.filter(log => log.type === 'Water').length} waterings
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase">
                            <Calendar size={14} className="opacity-50" /> {activeReminderCount} active reminders
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlantsView;
