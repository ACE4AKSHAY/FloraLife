import React, { useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { AppTab, Plant, Species } from './types';
import { storageService } from './services/storageService';
import { syncAllReminderSchedules } from './services/nativeReminderService';
import HomeView from './views/Home';
import MyPlantsView from './views/MyPlants';
import ScanView from './views/Scan';
import GuidesView from './views/Guides';
import ShopView from './views/Shop';
import PlantDetailView from './views/PlantDetail';
import PlantLibraryView from './views/PlantLibrary';
import { Home, Leaf, Scan, BookOpen, ShoppingBag } from 'lucide-react';

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

  const activeTabRef = useRef(activeTab);
  const selectedPlantIdRef = useRef(selectedPlantId);
  const showLibraryRef = useRef(showLibrary);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    selectedPlantIdRef.current = selectedPlantId;
  }, [selectedPlantId]);

  useEffect(() => {
    showLibraryRef.current = showLibrary;
  }, [showLibrary]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const refreshData = async () => {
    const storedPlants = storageService.getPlants();
    const syncedPlants = await syncAllReminderSchedules(storedPlants);

    if (JSON.stringify(storedPlants) !== JSON.stringify(syncedPlants)) {
      storageService.savePlants(syncedPlants);
    }

    setPlants(syncedPlants);
    setLibrary(storageService.getLibrary());
  };

  const goHome = () => {
    setSelectedPlantId(null);
    setShowLibrary(false);
    setActiveTab(AppTab.HOME);
  };

  const closeDetail = () => {
    setSelectedPlantId(null);
    void refreshData();
  };

  useEffect(() => {
    void refreshData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('flora_life_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    let isMounted = true;
    let backButtonHandle: { remove: () => Promise<void> } | undefined;
    let appStateHandle: { remove: () => Promise<void> } | undefined;

    const registerNativeListeners = async () => {
      try {
        await CapApp.toggleBackButtonHandler({ enabled: true });

        backButtonHandle = await CapApp.addListener('backButton', async () => {
          if (selectedPlantIdRef.current) {
            closeDetail();
            return;
          }

          if (showLibraryRef.current) {
            setShowLibrary(false);
            return;
          }

          if (activeTabRef.current !== AppTab.HOME) {
            goHome();
            return;
          }

          await CapApp.exitApp();
        });

        appStateHandle = await CapApp.addListener('appStateChange', async ({ isActive }) => {
          if (!isMounted || !isActive) {
            return;
          }

          await refreshData();
        });
      } catch (error) {
        console.warn('Native App listeners unavailable:', error);
      }
    };

    void registerNativeListeners();

    return () => {
      isMounted = false;
      void backButtonHandle?.remove();
      void appStateHandle?.remove();
    };
  }, []);

  const navigateToDetail = (id: string) => {
    setSelectedPlantId(id);
  };

  const renderContent = () => {
    if (selectedPlantId) {
      const plant = plants.find(currentPlant => currentPlant.id === selectedPlantId);
      const species = library.find(currentSpecies => currentSpecies.id === plant?.speciesId);

      if (plant && species) {
        return <PlantDetailView plant={plant} species={species} onBack={closeDetail} onUpdate={() => void refreshData()} />;
      }
    }

    if (showLibrary) {
      return (
        <PlantLibraryView
          onBack={() => setShowLibrary(false)}
          onAdd={() => {
            setShowLibrary(false);
            void refreshData();
            setActiveTab(AppTab.MY_PLANTS);
          }}
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
            onBackHome={goHome}
            onAdd={() => setShowLibrary(true)}
            onSelectPlant={navigateToDetail}
          />
        );
      case AppTab.SCAN:
        return <ScanView onBackHome={goHome} />;
      case AppTab.GUIDES:
        return <GuidesView onBackHome={goHome} />;
      case AppTab.SHOP:
        return <ShopView onBackHome={goHome} />;
      default:
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
    }
  };

  const TabButton = ({ tab, icon: Icon, label }: { tab: AppTab; icon: any; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setSelectedPlantId(null);
        setShowLibrary(false);
      }}
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
    <div className="flex flex-col min-h-screen pt-[env(safe-area-inset-top)] bg-[#fdfdfb] dark:bg-[#121211] text-stone-800 dark:text-stone-100 transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-28 pt-3">{renderContent()}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1e1c] border-t border-stone-100 dark:border-stone-800 flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom)] shadow-lg max-w-[480px] mx-auto z-50 transition-colors duration-300">
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
