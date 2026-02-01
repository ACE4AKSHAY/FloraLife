
import React, { useState, useEffect } from 'react';
import { AppTab, Plant, Species } from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import HomeView from './views/Home';
import MyPlantsView from './views/MyPlants';
import ScanView from './views/Scan';
import GuidesView from './views/Guides';
import ShopView from './views/Shop';
import PlantDetailView from './views/PlantDetail';
import PlantLibraryView from './views/PlantLibrary';
import { Home, Leaf, Scan, BookOpen, ShoppingBag, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [library, setLibrary] = useState<Species[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('flora_life_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    setPlants(storageService.getPlants());
    setLibrary(storageService.getLibrary());
    
    // Request notification permissions on mount
    notificationService.requestPermission();

    // Set up reminder polling every 30 seconds
    const interval = setInterval(() => {
      checkReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('flora_life_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const refreshData = () => {
    setPlants(storageService.getPlants());
    setLibrary(storageService.getLibrary());
  };

  const checkReminders = () => {
    const currentPlants = storageService.getPlants();
    const now = Date.now();
    let updatedAny = false;

    const newPlants = currentPlants.map(plant => {
      let plantUpdated = false;
      const newReminders = plant.reminders.map(rem => {
        if (!rem.completed && !rem.notified && rem.dateTime <= now) {
          // Trigger notification
          notificationService.sendNotification(
            `Care Alert: ${plant.customName}`,
            `It's time for: ${rem.title}`
          );
          plantUpdated = true;
          updatedAny = true;
          return { ...rem, notified: true };
        }
        return rem;
      });

      if (plantUpdated) {
        return { ...plant, reminders: newReminders };
      }
      return plant;
    });

    if (updatedAny) {
      storageService.savePlants(newPlants);
      setPlants(newPlants);
    }
  };

  const navigateToDetail = (id: string) => {
    setSelectedPlantId(id);
  };

  const closeDetail = () => {
    setSelectedPlantId(null);
    refreshData();
  };

  const renderContent = () => {
    if (selectedPlantId) {
      const plant = plants.find(p => p.id === selectedPlantId);
      const species = library.find(s => s.id === (plant?.speciesId));
      if (plant && species) {
        return <PlantDetailView plant={plant} species={species} onBack={closeDetail} onUpdate={refreshData} />;
      }
    }

    if (showLibrary) {
      return (
        <PlantLibraryView 
          onBack={() => setShowLibrary(false)} 
          onAdd={() => { setShowLibrary(false); refreshData(); setActiveTab(AppTab.MY_PLANTS); }}
        />
      );
    }

    switch (activeTab) {
      case AppTab.HOME:
        return (
          <HomeView 
            plants={plants} 
            onAddPlant={() => setShowLibrary(true)} 
            onScan={() => setActiveTab(AppTab.SCAN)}
            onNavigateGuide={() => setActiveTab(AppTab.GUIDES)}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        );
      case AppTab.MY_PLANTS:
        return (
          <MyPlantsView 
            plants={plants} 
            library={library} 
            onAdd={() => setShowLibrary(true)} 
            onSelectPlant={navigateToDetail}
          />
        );
      case AppTab.SCAN:
        return <ScanView />;
      case AppTab.GUIDES:
        return <GuidesView library={library} />;
      case AppTab.SHOP:
        return <ShopView />;
      default:
        return <HomeView plants={plants} onAddPlant={() => setShowLibrary(true)} onScan={() => setActiveTab(AppTab.SCAN)} onNavigateGuide={() => setActiveTab(AppTab.GUIDES)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    }
  };

  const TabButton = ({ tab, icon: Icon, label }: { tab: AppTab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setSelectedPlantId(null); setShowLibrary(false); }}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        activeTab === tab && !selectedPlantId && !showLibrary 
          ? 'text-emerald-700 dark:text-emerald-400' 
          : 'text-stone-400 dark:text-stone-500'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === tab && !selectedPlantId && !showLibrary ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-[#fdfdfb] dark:bg-[#121211] text-stone-800 dark:text-stone-100 transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1e1c] border-t border-stone-100 dark:border-stone-800 flex justify-around items-center px-4 safe-area-bottom shadow-lg max-w-[480px] mx-auto z-50 transition-colors duration-300">
        <TabButton tab={AppTab.HOME} icon={Home} label="Home" />
        <TabButton tab={AppTab.MY_PLANTS} icon={Leaf} label="My Plants" />
        <TabButton tab={AppTab.SCAN} icon={Scan} label="Scan" />
        <TabButton tab={AppTab.GUIDES} icon={BookOpen} label="Guides" />
        <TabButton tab={AppTab.SHOP} icon={ShoppingBag} label="Shop" />
      </nav>
    </div>
  );
};

export default App;
