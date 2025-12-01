export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Entry {
  id: string;
  timestamp: string; // ISO string
  imageUrl?: string;
  name: string;
  nutrition: Nutrition;
  items?: FoodItem[]; // List of detected food items
}

export interface AppData {
  settings: {
    dailyGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    userStats?: {
      age: number;
      height: number; // cm
      weight: number; // kg
      gender: 'male' | 'female';
      activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    };
  };
  entries: Entry[];
}
