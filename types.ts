
export type GrowthStage = 'Seed' | 'Germination' | 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest';

export interface StageInfo {
  stage: string;
  days: string;
  instruction: string;
  careInstructions?: string[];
  tips?: string[];
  warning?: string;
  emoji?: string;
}

export interface Species {
  id: string;
  name: string;
  emoji: string;
  scientificName: string;
  category: 'Home' | 'Agriculture';
  difficulty: 'easy' | 'medium' | 'hard';
  durationDays: number;
  description: string;
  stages: StageInfo[];
  imageUrl: string;
}

export interface PlantPhoto {
  id: string;
  url: string; // base64 data
  timestamp: number;
  note?: string;
}

export interface Plant {
  id: string;
  speciesId: string;
  customName: string;
  location?: string;
  plantedAt: number;
  harvested: boolean;
  careLogs: CareLog[];
  reminders: Reminder[];
  photos: PlantPhoto[]; // Changed from string[]
}

export interface CareLog {
  id: string;
  type: 'Water' | 'Feed' | 'Prune' | 'Photo';
  timestamp: number;
  note?: string;
}

export interface Reminder {
  id: string;
  type: 'Water' | 'Feed' | 'Harvest' | 'Custom';
  title: string;
  dateTime: number;
  completed: boolean;
  notified?: boolean;
  lastAlertTimestamp?: number; // For repeating alerts
}

export interface ScanResult {
  status: 'Healthy' | 'Diseased';
  diseaseName: string;
  confidence: number;
  description: string;
  recommendations: string[];
  imageUrl: string;
  timestamp: number;
  growthStage: string;
  growthStageDescription: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: 'Seeds' | 'Fertilizer' | 'Tools';
  priceSymbol: string;
  amazonUrl: string;
  flipkartUrl: string;
}

export enum AppTab {
  HOME = 'home',
  MY_PLANTS = 'my_plants',
  SCAN = 'scan',
  GUIDES = 'guides',
  SHOP = 'shop'
}
