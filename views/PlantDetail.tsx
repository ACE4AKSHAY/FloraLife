import React, { useEffect, useRef, useState } from 'react';
import { Plant, PlantPhoto, Reminder, ReminderIntervalHours, ReminderScheduleType, Species } from '../types';
import {
  BellOff,
  BellRing,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock,
  Droplets,
  Image as ImageIcon,
  Leaf,
  MessageSquare,
  Plus,
  Scissors,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import {
  buildOneTimeReminderTimestamp,
  buildRepeatingReminderTimestamp,
  cancelReminderSchedule,
  formatReminderModeChip,
  formatReminderScheduleLabel,
  isReminderActive,
  isRepeatingReminder,
  normalizeReminder,
  requestReminderPermissions,
  syncReminderSchedule,
} from '../services/nativeReminderService';

interface PlantDetailViewProps {
  plant: Plant;
  species: Species;
  onBack: () => void;
  onUpdate: () => void;
}

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateOnly = (timestamp: number) => {
  const date = new Date(timestamp);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTimeOnly = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatDateTime = (timestamp: number) => `${formatDateOnly(timestamp)}, ${formatTimeOnly(timestamp)}`;

const PlantDetailView: React.FC<PlantDetailViewProps> = ({ plant, species, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'Photos' | 'Lifecycle' | 'Care Log' | 'Reminders'>('Photos');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    title: string;
    type: Reminder['type'];
    scheduleType: ReminderScheduleType;
    date: string;
    time: string;
    intervalHours: ReminderIntervalHours;
  }>({
    title: '',
    type: 'Water',
    scheduleType: 'once',
    date: getTodayInputValue(),
    time: '08:00',
    intervalHours: 6,
  });
  const [newPhotoNote, setNewPhotoNote] = useState('');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timerId = window.setInterval(() => setClockNow(Date.now()), 30000);
    return () => window.clearInterval(timerId);
  }, []);

  const dayCount = Math.floor((Date.now() - plant.plantedAt) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.round((dayCount / species.durationDays) * 100));

  const currentStageInfo = species.stages.find((stage, index) => {
    const nextStage = species.stages[index + 1];
    const startDay = parseInt(stage.days.split('-')[0], 10);
    const endDay = nextStage ? parseInt(nextStage.days.split('-')[0], 10) : 999;
    return dayCount >= startDay && dayCount < endDay;
  });

  const estimatedHarvestDate = new Date(plant.plantedAt + species.durationDays * 24 * 60 * 60 * 1000);
  const estimatedHarvest = formatDateOnly(estimatedHarvestDate.getTime());

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const resetReminderDraft = () => {
    setNewReminder({
      title: '',
      type: 'Water',
      scheduleType: 'once',
      date: getTodayInputValue(),
      time: '08:00',
      intervalHours: 6,
    });
  };

  const closeReminderModal = () => {
    setShowAddReminder(false);
    resetReminderDraft();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plant?')) {
      return;
    }

    for (const reminder of plant.reminders) {
      await cancelReminderSchedule(reminder.id);
    }

    storageService.deletePlant(plant.id);
    onBack();
  };

  const logCare = (type: 'Water' | 'Feed' | 'Prune' | 'Photo') => {
    if (type === 'Photo') {
      setShowAddPhoto(true);
      return;
    }

    const updatedPlant: Plant = {
      ...plant,
      careLogs: [{ id: Date.now().toString(), type, timestamp: Date.now() }, ...plant.careLogs],
    };

    storageService.updatePlant(updatedPlant);
    onUpdate();
    showToast(`${type} logged!`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = () => {
    if (!tempPhoto) {
      return;
    }

    const newPhoto: PlantPhoto = {
      id: Date.now().toString(),
      url: tempPhoto,
      timestamp: Date.now(),
      note: newPhotoNote,
    };

    const updatedPlant: Plant = {
      ...plant,
      photos: [newPhoto, ...plant.photos],
      careLogs: [{ id: `photo-log-${Date.now()}`, type: 'Photo', timestamp: Date.now() }, ...plant.careLogs],
    };

    storageService.updatePlant(updatedPlant);
    onUpdate();
    setShowAddPhoto(false);
    setTempPhoto(null);
    setNewPhotoNote('');
    showToast('Photo added to journal!');
  };

  const persistReminderList = async (updatedReminders: Reminder[], successMessage: string) => {
    const updatedPlant: Plant = {
      ...plant,
      reminders: updatedReminders,
    };

    storageService.updatePlant(updatedPlant);
    onUpdate();
    showToast(successMessage);
  };

  const toggleReminder = async (reminder: Reminder) => {
    const normalizedReminder = normalizeReminder(reminder);

    if (isRepeatingReminder(normalizedReminder)) {
      if (normalizedReminder.enabled === false) {
        const permissions = await requestReminderPermissions();

        if (!permissions.displayGranted) {
          showToast('Allow notifications first to resume this reminder.');
          return;
        }

        const resumedReminder: Reminder = {
          ...normalizedReminder,
          enabled: true,
          completed: false,
        };

        await syncReminderSchedule(plant.customName, resumedReminder);
        await persistReminderList(
          plant.reminders.map(currentReminder =>
            currentReminder.id === reminder.id ? resumedReminder : currentReminder,
          ),
          'Reminder resumed.',
        );
        return;
      }

      const pausedReminder: Reminder = {
        ...normalizedReminder,
        enabled: false,
      };

      await cancelReminderSchedule(pausedReminder.id);
      await persistReminderList(
        plant.reminders.map(currentReminder =>
          currentReminder.id === reminder.id ? pausedReminder : currentReminder,
        ),
        'Reminder paused.',
      );
      return;
    }

    if (!normalizedReminder.completed) {
      const completedReminder: Reminder = {
        ...normalizedReminder,
        completed: true,
        enabled: false,
      };

      await cancelReminderSchedule(completedReminder.id);
      await persistReminderList(
        plant.reminders.map(currentReminder =>
          currentReminder.id === reminder.id ? completedReminder : currentReminder,
        ),
        'Reminder marked done.',
      );
      return;
    }

    if (normalizedReminder.dateTime <= Date.now()) {
      showToast('This reminder time already passed. Create a new reminder instead.');
      return;
    }

    const permissions = await requestReminderPermissions();

    if (!permissions.displayGranted) {
      showToast('Allow notifications first to reactivate this reminder.');
      return;
    }

    const reopenedReminder: Reminder = {
      ...normalizedReminder,
      completed: false,
      enabled: true,
    };

    await syncReminderSchedule(plant.customName, reopenedReminder);
    await persistReminderList(
      plant.reminders.map(currentReminder =>
        currentReminder.id === reminder.id ? reopenedReminder : currentReminder,
      ),
      'Reminder reactivated.',
    );
  };

  const deleteReminder = async (reminderId: string) => {
    await cancelReminderSchedule(reminderId);
    await persistReminderList(
      plant.reminders.filter(reminder => reminder.id !== reminderId),
      'Reminder deleted.',
    );
  };

  const handleSaveReminder = async () => {
    setIsSavingReminder(true);

    try {
      const permissions = await requestReminderPermissions();

      if (!permissions.displayGranted) {
        showToast('Allow notifications to save native reminders.');
        return;
      }

      const title = newReminder.title.trim() || `${newReminder.type} ${plant.customName}`;

      const dateTime =
        newReminder.scheduleType === 'once'
          ? buildOneTimeReminderTimestamp(newReminder.date, newReminder.time)
          : buildRepeatingReminderTimestamp(newReminder.time, newReminder.scheduleType, newReminder.intervalHours);

      if (Number.isNaN(dateTime)) {
        showToast('Choose a valid date and time.');
        return;
      }

      if (newReminder.scheduleType === 'once' && dateTime <= Date.now()) {
        showToast('Choose a future date and time for one-time reminders.');
        return;
      }

      if (newReminder.scheduleType === 'interval' && (newReminder.intervalHours < 1 || newReminder.intervalHours > 24)) {
        showToast('Repeat hours must be between 1 and 24.');
        return;
      }

      const reminder: Reminder = {
        id: Date.now().toString(),
        type: newReminder.type,
        title,
        dateTime,
        completed: false,
        scheduleType: newReminder.scheduleType,
        intervalHours: newReminder.scheduleType === 'interval' ? newReminder.intervalHours : undefined,
        enabled: true,
      };

      const syncedReminder = await syncReminderSchedule(plant.customName, reminder);
      const updatedPlant: Plant = {
        ...plant,
        reminders: [...plant.reminders, syncedReminder],
      };

      storageService.updatePlant(updatedPlant);
      onUpdate();
      closeReminderModal();
      showToast('Reminder saved.');
    } finally {
      setIsSavingReminder(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfdfb] dark:bg-[#121211] transition-colors duration-300">
      <header className="p-5 flex items-center justify-between sticky top-0 bg-[#fdfdfb]/80 dark:bg-[#121211]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-stone-400 dark:text-stone-500">
            <ChevronLeft size={28} />
          </button>
          <div>
            <h1 className="text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight">{plant.customName}</h1>
            <p className="text-[11px] text-stone-300 dark:text-stone-600 font-bold uppercase tracking-tight">
              {species.scientificName}
            </p>
          </div>
        </div>
        <button onClick={() => void handleDelete()} className="text-red-300 dark:text-red-900 hover:text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      <div className="p-5 space-y-6">
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
              <p className="text-stone-400 dark:text-stone-500 text-[11px] font-medium">
                Planted {dayCount === 0 ? 'today' : `${dayCount} days ago`}
              </p>
              <div className="w-full h-2.5 bg-stone-50 dark:bg-stone-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8b7e74] dark:bg-[#5c534d] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-[10px] font-black text-stone-800 dark:text-stone-100">{progress}%</p>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3 bg-[#f4f7f5] dark:bg-[#1a2d26] p-4 rounded-2xl border border-[#559a73]/10 dark:border-[#7ab895]/10">
            <Calendar size={18} className="text-[#559a73] dark:text-[#7ab895]" />
            <span className="text-xs font-bold text-[#559a73] dark:text-[#7ab895]">Estimated harvest: {estimatedHarvest}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Droplets, label: 'Water', type: 'Water', color: 'text-blue-400' },
            { icon: Leaf, label: 'Feed', type: 'Feed', color: 'text-emerald-400' },
            { icon: Scissors, label: 'Prune', type: 'Prune', color: 'text-stone-400' },
            { icon: Camera, label: 'Photo', type: 'Photo', color: 'text-stone-400' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => logCare(action.type as 'Water' | 'Feed' | 'Prune' | 'Photo')}
              className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 py-4 rounded-2xl flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <action.icon size={22} className={action.color} strokeWidth={1.5} />
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex bg-[#8b7e74]/10 dark:bg-[#5c534d]/20 p-1.5 rounded-[20px]">
          {['Photos', 'Lifecycle', 'Care Log', 'Reminders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'Photos' | 'Lifecycle' | 'Care Log' | 'Reminders')}
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

        <div className="bg-white dark:bg-[#1e1e1c] border border-stone-100 dark:border-stone-800 p-6 rounded-[40px] shadow-sm min-h-[300px] transition-colors">
          {activeTab === 'Photos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Photo Journal ({plant.photos.length})</h3>
                </div>
                <button onClick={() => setShowAddPhoto(true)} className="p-2 bg-stone-50 dark:bg-stone-900 rounded-xl text-[#559a73]">
                  <Plus size={20} />
                </button>
              </div>

              {plant.photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-stone-50 dark:bg-stone-900 rounded-2xl flex items-center justify-center border border-stone-100 dark:border-stone-800">
                    <ImageIcon size={32} className="text-stone-200 dark:text-stone-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">No photos yet</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">Document your plant&apos;s growth journey!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {plant.photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        className="w-full aspect-square object-cover rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800"
                        alt="Plant progress"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 backdrop-blur-sm rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white font-bold leading-tight line-clamp-2">{photo.note || 'No note'}</p>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 dark:bg-stone-900/90 rounded-full text-[8px] font-black text-stone-600 dark:text-stone-300 shadow-sm uppercase">
                        {formatDateOnly(photo.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Lifecycle' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 px-2">
                <span className="text-xl">🪴</span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">Growth Stages</h3>
              </div>
              <div className="space-y-10 relative pl-10">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-100 dark:bg-stone-800" />
                {species.stages.map((stage, index) => {
                  const isPassed = parseInt(stage.days.split('-')[0], 10) <= dayCount;
                  return (
                    <div key={stage.stage + index} className="relative">
                      <div
                        className={`absolute -left-[35px] w-7 h-7 rounded-full border-4 border-white dark:border-[#1e1e1c] shadow-md flex items-center justify-center z-10 transition-colors ${
                          isPassed ? 'bg-[#559a73] dark:bg-[#437a5b]' : 'bg-stone-200 dark:bg-stone-800'
                        }`}
                      >
                        <span className={`text-xs ${!isPassed ? 'opacity-30' : ''}`}>{stage.emoji}</span>
                      </div>
                      <div className={`space-y-0.5 ${!isPassed ? 'opacity-30' : ''}`}>
                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                          {stage.stage}
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold ml-2">Days {stage.days}</span>
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">{stage.instruction}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Care Log' && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 px-2">Care History</h3>
              {plant.careLogs.length === 0 ? (
                <p className="text-center text-stone-400 dark:text-stone-500 py-10 text-xs font-bold uppercase tracking-widest">
                  No activities logged yet
                </p>
              ) : (
                <div className="space-y-3">
                  {plant.careLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100/50 dark:border-stone-800/50 transition-colors"
                    >
                      <div className={`p-2 rounded-xl bg-white dark:bg-[#1e1e1c] shadow-sm ${log.type === 'Water' ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {log.type === 'Water' && <Droplets size={18} />}
                        {log.type === 'Feed' && <Leaf size={18} />}
                        {log.type === 'Prune' && <Scissors size={18} />}
                        {log.type === 'Photo' && <Camera size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-stone-800 dark:text-stone-100">{log.type}</p>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
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
                  {plant.reminders.map(reminder => {
                    const normalizedReminder = normalizeReminder(reminder);
                    const repeating = isRepeatingReminder(normalizedReminder);
                    const active = isReminderActive(normalizedReminder);
                    const overdue =
                      normalizedReminder.scheduleType === 'once' &&
                      active &&
                      normalizedReminder.dateTime < clockNow;

                    return (
                      <div
                        key={normalizedReminder.id}
                        className={`p-4 rounded-2xl border transition-colors ${
                          overdue
                            ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30'
                            : active
                              ? 'border-emerald-100 bg-stone-50 dark:bg-stone-900 dark:border-emerald-900/20'
                              : 'border-stone-100 bg-stone-50 dark:bg-stone-900 dark:border-stone-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => void toggleReminder(normalizedReminder)}
                            className={`p-2 rounded-xl bg-white dark:bg-[#1e1e1c] shadow-sm transition-colors ${
                              repeating
                                ? active
                                  ? 'text-emerald-500'
                                  : 'text-amber-500'
                                : normalizedReminder.completed
                                  ? 'text-emerald-500'
                                  : 'text-stone-300 dark:text-stone-700'
                            }`}
                          >
                            {repeating ? active ? <BellRing size={18} /> : <BellOff size={18} /> : normalizedReminder.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>

                          <div className={`flex-1 space-y-2 ${!active && !overdue ? 'opacity-60' : ''}`}>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1e1e1c] text-[9px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
                                {normalizedReminder.type}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-[#559a73]/10 text-[9px] font-black uppercase tracking-widest text-[#559a73] dark:bg-[#559a73]/20 dark:text-[#7ab895]">
                                {formatReminderModeChip(normalizedReminder)}
                              </span>
                              {overdue && (
                                <span className="px-2.5 py-1 rounded-full bg-red-100 text-[9px] font-black uppercase tracking-widest text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                  Overdue
                                </span>
                              )}
                              {!overdue && !active && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-[9px] font-black uppercase tracking-widest text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                  {repeating ? 'Paused' : 'Completed'}
                                </span>
                              )}
                            </div>

                            <div>
                              <p className={`text-sm font-black ${overdue ? 'text-red-600 dark:text-red-400' : 'text-stone-800 dark:text-stone-100'}`}>
                                {normalizedReminder.title}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">
                                <Clock size={10} className="inline mr-1" /> {formatReminderScheduleLabel(normalizedReminder)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => void deleteReminder(normalizedReminder.id)}
                            className="p-2 text-stone-300 dark:text-stone-700 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-800 dark:bg-stone-900 text-white px-6 py-4 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-50 min-w-[200px]">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {showAddPhoto && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1c] w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200 transition-colors overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">Add Progress Photo</h2>
              <button
                onClick={() => {
                  setShowAddPhoto(false);
                  setTempPhoto(null);
                }}
                className="text-stone-400 dark:text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4">
                {tempPhoto ? (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img src={tempPhoto} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={() => setTempPhoto(null)} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square bg-stone-50 dark:bg-stone-900 rounded-2xl border-2 border-dashed border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-[#559a73] hover:border-[#559a73] transition-all"
                  >
                    <Upload size={40} />
                    <span className="text-sm font-bold">Upload Photo</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                  Remarks / Note
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-stone-300" size={16} />
                  <textarea
                    placeholder="e.g., First true leaves emerged today!"
                    className="w-full bg-stone-50 dark:bg-stone-900 p-4 pl-12 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 dark:placeholder-stone-600 transition-colors min-h-[100px]"
                    value={newPhotoNote}
                    onChange={event => setNewPhotoNote(event.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={!tempPhoto}
                onClick={savePhoto}
                className="w-full bg-[#559a73] dark:bg-[#437a5b] disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-lg"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddReminder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1c] w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200 transition-colors overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">New Reminder</h2>
              <button onClick={closeReminderModal} className="text-stone-400 dark:text-stone-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                  Type
                </label>
                <select
                  className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 transition-colors"
                  value={newReminder.type}
                  onChange={event =>
                    setNewReminder(currentReminder => ({
                      ...currentReminder,
                      type: event.target.value as Reminder['type'],
                    }))
                  }
                >
                  <option value="Water">Water</option>
                  <option value="Feed">Feed</option>
                  <option value="Harvest">Harvest</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder={`e.g., ${newReminder.type} ${plant.customName}`}
                  className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 dark:placeholder-stone-600 transition-colors"
                  value={newReminder.title}
                  onChange={event =>
                    setNewReminder(currentReminder => ({
                      ...currentReminder,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                  Repeat
                </label>
                <select
                  className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 transition-colors"
                  value={newReminder.scheduleType}
                  onChange={event =>
                    setNewReminder(currentReminder => ({
                      ...currentReminder,
                      scheduleType: event.target.value as ReminderScheduleType,
                    }))
                  }
                >
                  <option value="once">One time</option>
                  <option value="daily">Every day</option>
                  <option value="interval">Every few hours</option>
                </select>
              </div>

              {newReminder.scheduleType === 'once' && (
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm dark:text-stone-100 transition-colors"
                    value={newReminder.date}
                    onChange={event =>
                      setNewReminder(currentReminder => ({
                        ...currentReminder,
                        date: event.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {newReminder.scheduleType === 'interval' && (
                <div>
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                    Every
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={24}
                      step={1}
                      inputMode="numeric"
                      className="flex-1 bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm font-bold dark:text-stone-100 transition-colors"
                      value={newReminder.intervalHours}
                      onChange={event =>
                        setNewReminder(currentReminder => ({
                          ...currentReminder,
                          intervalHours: Math.min(24, Math.max(1, Math.round(Number(event.target.value) || 1))) as ReminderIntervalHours,
                        }))
                      }
                    />
                    <span className="px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs font-bold text-stone-500 dark:text-stone-400">
                      hours
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-2 px-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border-none focus:ring-2 focus:ring-[#559a73]/20 text-sm font-bold dark:text-stone-100 transition-colors"
                  value={newReminder.time}
                  onChange={event =>
                    setNewReminder(currentReminder => ({
                      ...currentReminder,
                      time: event.target.value,
                    }))
                  }
                />
              </div>

              {newReminder.scheduleType === 'once' && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 px-1">
                  Keeps reminding every 5 minutes until you mark it done.
                </p>
              )}

              <button
                disabled={isSavingReminder}
                onClick={() => void handleSaveReminder()}
                className="w-full bg-[#559a73] dark:bg-[#437a5b] disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-lg"
              >
                {isSavingReminder ? 'Saving...' : 'Save Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetailView;
