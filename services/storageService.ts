
import { Plant, Species } from "../types";
import { INITIAL_SPECIES } from "../constants";

const STORAGE_KEY_PLANTS = 'flora_life_plants';
const STORAGE_KEY_LIBRARY = 'flora_life_library';

export const storageService = {
  getPlants: (): Plant[] => {
    const data = localStorage.getItem(STORAGE_KEY_PLANTS);
    return data ? JSON.parse(data) : [];
  },
  savePlants: (plants: Plant[]) => {
    localStorage.setItem(STORAGE_KEY_PLANTS, JSON.stringify(plants));
  },
  getLibrary: (): Species[] => {
    const data = localStorage.getItem(STORAGE_KEY_LIBRARY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(INITIAL_SPECIES));
      return INITIAL_SPECIES;
    }
    return JSON.parse(data);
  },
  saveLibrary: (library: Species[]) => {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(library));
  },
  addPlant: (plant: Plant) => {
    const plants = storageService.getPlants();
    plants.push(plant);
    storageService.savePlants(plants);
  },
  updatePlant: (updatedPlant: Plant) => {
    const plants = storageService.getPlants();
    const index = plants.findIndex(p => p.id === updatedPlant.id);
    if (index !== -1) {
      plants[index] = updatedPlant;
      storageService.savePlants(plants);
    }
  },
  deletePlant: (id: string) => {
    const plants = storageService.getPlants().filter(p => p.id !== id);
    storageService.savePlants(plants);
  }
};
