
import React, { useState } from 'react';
import { Plant, Species, Reminder } from '../types';
import { ChevronLeft, Trash2, Droplets, Leaf, Scissors, Camera, Plus, Calendar, CheckCircle2, Clock, X, Image as ImageIcon, Circle } from 'lucide-react';
import { storageService } from '../services/storageService';

interface PlantDetailViewProps {
  plant: Plant;
  species: Species;
  onBack: () => void;
  onUpdate: () => void;
}

const PlantDetailView: React.FC<PlantDetailViewProps> = ({ plant, species, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'Photos' | 'Lifecycle' | 'Care Log' | 'Reminders'>('Photos');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', type: 'Water' as any, time: '08:00' });
  const [toast, setToast] = useState<string | null>(null);

  const dayCount = Math.floor((Date.now() - plant.plantedAt) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.round((dayCount / species.durationDays) * 100));
  
  const currentStageInfo = species.stages.find((st, i) => {
    const nextSt = species.stages[i+1];
    const startDay = parseInt(st.days.split('-')[0]);
    const endDay = nextSt ? parseInt(nextSt.days.split('-')[0]) : 999;
    return dayCount >= startDay && dayCount < endDay;
  });

  const estimatedHarvestDate = new Date(plant.plantedAt + (species.durationDays * 24 * 60 * 60 * 1000));
  const estimatedHarvest = estimatedHarvestDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this plant?")) {
      storageService.deletePlant(plant.id);
      onBack();
    }
  };

  const logCare = (type: 'Water' | 'Feed' | 'Prune' | 'Photo') => {
    const updatedPlant = { 
      ...plant, 
      careLogs: [{ id: Date.now().toString(), type, timestamp: Date.now() }, ...plant.careLogs]
    };
    storageService.updatePlant(updatedPlant);
    onUpdate();
    showToast(`${type} logged!`);
  };

  const toggleReminder = (reminderId: string) => {
    const updatedReminders = plant.reminders.map(r => 
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    );
    const updatedPlant = { ...plant, reminders: updatedReminders };
    storageService.updatePlant(updatedPlant);
    onUpdate();
  };

  const deleteReminder = (reminderId: string) => {
    const updatedReminders = plant.reminders.filter(r => r.id !== reminderId);
    const updatedPlant = { ...plant, reminders: updatedReminders };
    storageService.updatePlant(updatedPlant);
    onUpdate();
    showToast('Reminder deleted');
  };

  const formatTime24 = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
      <header className="p-5 flex items-center justify-between sticky top-0 bg-[#fdfdfb]/80 dark:bg-[#121211]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-stone-400 dark:text-stone-500"><ChevronLeft size={28} /></button>
          <div>
            <h1 className="text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight">{plant.customName}</h1>
            <p className="text-[11px] text-stone-300 dark:text-stone-600 font-bold uppercase tracking-tight">{species.scientificName}</p>
          </div>
        </div>
        <button onClick={handleDelete} className="text-red-300 dark:text-red-900 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
      </header>

      <div className="p-5 space-y-6">
        {/* Progress Card */}
        <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-7 rounded-[40px] shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center gap-6 relative z-10">
            <span className="text-6xl">{species.emoji}</span>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 mb-1">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#8b7e74] dark:bg-[#5c534d] text-white text-[10px] font-bold rounded-full">
                  <span className="text-sm">{currentStageInfo?.emoji || '🌱'}</span> {currentStageInfo?.stage || 'Growing'}
                </span>
                <span className="px-3 py-1 bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-500 text-[10px] font-bold rounded-full flex items-center gap-1">
                   Day {dayCount}
                </span>
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-[11px] font-medium">Planted {dayCount === 0 ? 'less than a minute ago' : `${dayCount} days ago`}</p>
              <div className="w-full h-2.5 bg-stone-50 dark:bg-stone-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#8b7e74] dark:bg-[#5c534d] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-right text-[10px] font-black text-stone-800 dark:text-stone-100">{progress}%</p>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3 bg-[#f4f7f5] dark:bg-[#1a2d26] p-4 rounded-2xl border border-[#559a73]/10 dark:border-[#7ab895]/10">
            <Calendar size={18} className="text-[#559a73] dark:text-[#7ab895]" />
            <span className="text-xs font-bold text-[#559a73] dark:text-[#7ab895]">Estimated harvest: {estimatedHarvest}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Droplets, label: 'Water', type: 'Water', color: 'text-blue-400' },
            { icon: Leaf, label: 'Feed', type: 'Feed', color: 'text-emerald-400' },
            { icon: Scissors, label: 'Prune', type: 'Prune', color: 'text-stone-400' },
            { icon: Camera, label: 'Photo', type: 'Photo', color: 'text-stone-400' }
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => logCare(action.type as any)}
              className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <action.icon size={22} className={action.color} strokeWidth={1.5} />
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#8b7e74]/10 dark:bg-[#5c534d]/20 p-1.5 rounded-[20px]">
          {['Photos', 'Lifecycle', 'Care Log', 'Reminders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-[#1e1e1c] text-stone-800 dark:text-stone-100 shadow-sm' 
                  : 'text-stone-400 dark:text-stone-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-8 rounded-[40px] shadow-sm min-h-[300px] transition-colors">
          {activeTab === 'Photos' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📸</span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Photo Journal ({plant.photos.length})</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                 <div className="w-16 h-16 bg-stone-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center border border-stone-100 dark:border-stone-800">
                    <ImageIcon size={32} className="text-stone-200 dark:text-stone-700" />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">No photos yet</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">Document your plant's growth journey!</p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Lifecycle' && (
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🪴</span>
                  <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Growth Stages</h3>
                </div>
                <div className="space-y-10 relative pl-10">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-100 dark:bg-stone-800"></div>
                  {species.stages.map((st, i) => {
                    const isPassed = parseInt(st.days.split('-')[0]) <= dayCount;
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[35px] w-7 h-7 rounded-full border-4 border-white dark:border-[#1e1e1c] shadow-md flex items-center justify-center z-10 transition-colors ${isPassed ? 'bg-[#559a73] dark:bg-[#437a5b]' : 'bg-stone-200 dark:bg-stone-800'}`}>
                           <span className={`text-xs ${!isPassed && 'opacity-30'}`}>{st.emoji}</span>
                        </div>
                        <div className={`space-y-0.5 ${!isPassed && 'opacity-30'}`}>
                          <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">{st.stage} <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold ml-2">Days {st.days}</span></h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">{st.instruction}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          )}

          {activeTab === 'Care Log' && (
             <div className="space-y-6">
               <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Care History</h3>
               {plant.careLogs.length === 0 ? (
                 <p className="text-center text-stone-400 dark:text-stone-500 py-10 text-xs font-bold uppercase tracking-widest">No activities logged yet</p>
               ) : (
                 <div className="space-y-3">
                   {plant.careLogs.map(log => (
                     <div key={log.id} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100/50 dark:border-stone-800/50 transition-colors">
                        <div className={`p-2 rounded-xl bg-white dark:bg-[#1e1e1c] shadow-sm ${log.type === 'Water' ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {log.type === 'Water' && <Droplets size={18} />}
                          {log.type === 'Feed' && <Leaf size={18} />}
                          {log.type === 'Prune' && <Scissors size={18} />}
                          {log.type === 'Photo' && <Camera size={18} />}
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-black text-stone-800 dark:text-stone-100">{log.type}</p>
                           <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

          {activeTab === 'Reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Reminders</h3>
                </div>
                <button 
                  onClick={() => setShowAddReminder(true)}
                  className="bg-[#559a73] dark:bg-[#437a5b] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {plant.reminders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-stone-400 dark:text-stone-500 text-xs font-bold uppercase tracking-widest">No reminders set</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plant.reminders.map(rem => (
                    <div key={rem.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100/50 dark:border-stone-800/50 group transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                         <button 
                            onClick={() => toggleReminder(rem.id)}
                            className={`p-2 rounded-xl bg-white dark:bg-[#1e1e1c] shadow-sm transition-colors ${rem.completed ? 'text-emerald-500' : 'text-stone-300 dark:text-stone-700'}`}
                          >
                           {rem.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                         </button>
                         <div className={rem.completed ? 'opacity-40 line-through' : ''}>
                           <p className="text-sm font-black text-stone-800 dark:text-stone-100">{rem.title}</p>
                           <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">
                             <Clock size={10} className="inline mr-1" /> {formatTime24(rem.dateTime)}
                           </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => deleteReminder(rem.id)}
                        className="p-2 text-stone-300 dark:text-stone-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-800 dark:bg-stone-900 text-white px-6 py-4 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-50 min-w-[200px]">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1c] w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200 transition-colors">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">New Reminder</h2>
               <button onClick={() => setShowAddReminder(false)} className="text-stone-400 dark:text-stone-500"><X size={20} /></button>
             </div>
             <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Water Tomato"
                    className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 dark:placeholder-stone-600 transition-colors"
                    value={newReminder.title}
                    onChange={e => setNewReminder(prev => ({...prev, title: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">Time (24h format)</label>
                  <input 
                    type="time" 
                    className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm font-bold dark:text-stone-100 transition-colors"
                    value={newReminder.time}
                    onChange={e => setNewReminder(prev => ({...prev, time: e.target.value}))}
                  />
                </div>
                <button 
                  onClick={() => {
                    const [hours, minutes] = newReminder.time.split(':').map(Number);
                    const now = new Date();
                    now.setHours(hours, minutes, 0, 0);
                    
                    const rem: Reminder = {
                      id: Date.now().toString(),
                      type: 'Water',
                      title: newReminder.title || 'Water',
                      dateTime: now.getTime(),
                      completed: false,
                      notified: false
                    };
                    const updated = {...plant, reminders: [...plant.reminders, rem]};
                    storageService.updatePlant(updated);
                    onUpdate();
                    setShowAddReminder(false);
                    showToast('Reminder added!');
                  }}
                  className="w-full bg-[#559a73] dark:bg-[#437a5b] text-white py-4 rounded-2xl font-bold shadow-lg"
                >
                  Set Reminder
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetailView;
