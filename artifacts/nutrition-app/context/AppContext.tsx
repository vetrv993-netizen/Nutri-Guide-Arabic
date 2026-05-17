import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FoodItem } from "@/data/foodDatabase";

export interface CalculatorItem {
  id: string;
  food: FoodItem;
  grams: number;
}

export interface SavedMeal {
  id: string;
  name: string;
  date: string;
  items: CalculatorItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "maintain" | "gain";
}

interface AppContextType {
  calculatorItems: CalculatorItem[];
  addToCalculator: (food: FoodItem, grams: number) => void;
  removeFromCalculator: (id: string) => void;
  updateGrams: (id: string, grams: number) => void;
  clearCalculator: () => void;
  savedMeals: SavedMeal[];
  saveMeal: (name: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  favoriteFoods: string[];
  toggleFavorite: (foodId: string) => Promise<void>;
  isFavorite: (foodId: string) => boolean;
  userProfile: UserProfile | null;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  waterIntake: number;
  addWater: (ml: number) => Promise<void>;
  resetWater: () => Promise<void>;
  getNutritionTotals: () => NutritionTotals;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  saturated_fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  cholesterol: number;
  vitamin_a: number;
  vitamin_b12: number;
  vitamin_c: number;
  vitamin_d: number;
  vitamin_e: number;
}

const defaultTotals: NutritionTotals = {
  calories: 0, protein: 0, carbohydrates: 0, fat: 0, saturated_fat: 0,
  fiber: 0, sugar: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0,
  magnesium: 0, cholesterol: 0, vitamin_a: 0, vitamin_b12: 0, vitamin_c: 0,
  vitamin_d: 0, vitamin_e: 0,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [calculatorItems, setCalculatorItems] = useState<CalculatorItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mealsJson, favsJson, profileJson, waterJson] = await Promise.all([
        AsyncStorage.getItem("savedMeals"),
        AsyncStorage.getItem("favoriteFoods"),
        AsyncStorage.getItem("userProfile"),
        AsyncStorage.getItem("waterIntake"),
      ]);
      if (mealsJson) setSavedMeals(JSON.parse(mealsJson));
      if (favsJson) setFavoriteFoods(JSON.parse(favsJson));
      if (profileJson) setUserProfile(JSON.parse(profileJson));
      if (waterJson) {
        const { date, ml } = JSON.parse(waterJson);
        const today = new Date().toDateString();
        if (date === today) setWaterIntake(ml);
        else { setWaterIntake(0); await AsyncStorage.setItem("waterIntake", JSON.stringify({ date: today, ml: 0 })); }
      }
    } catch {}
  };

  const addToCalculator = useCallback((food: FoodItem, grams: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    setCalculatorItems(prev => [...prev, { id, food, grams }]);
  }, []);

  const removeFromCalculator = useCallback((id: string) => {
    setCalculatorItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateGrams = useCallback((id: string, grams: number) => {
    setCalculatorItems(prev => prev.map(item => item.id === id ? { ...item, grams } : item));
  }, []);

  const clearCalculator = useCallback(() => setCalculatorItems([]), []);

  const getNutritionTotals = useCallback((): NutritionTotals => {
    return calculatorItems.reduce((totals, item) => {
      const factor = item.grams / 100;
      return {
        calories: totals.calories + item.food.calories * factor,
        protein: totals.protein + item.food.protein * factor,
        carbohydrates: totals.carbohydrates + item.food.carbohydrates * factor,
        fat: totals.fat + item.food.fat * factor,
        saturated_fat: totals.saturated_fat + item.food.saturated_fat * factor,
        fiber: totals.fiber + item.food.fiber * factor,
        sugar: totals.sugar + item.food.sugar * factor,
        sodium: totals.sodium + item.food.sodium * factor,
        potassium: totals.potassium + item.food.potassium * factor,
        calcium: totals.calcium + item.food.calcium * factor,
        iron: totals.iron + item.food.iron * factor,
        magnesium: totals.magnesium + item.food.magnesium * factor,
        cholesterol: totals.cholesterol + item.food.cholesterol * factor,
        vitamin_a: totals.vitamin_a + item.food.vitamin_a * factor,
        vitamin_b12: totals.vitamin_b12 + item.food.vitamin_b12 * factor,
        vitamin_c: totals.vitamin_c + item.food.vitamin_c * factor,
        vitamin_d: totals.vitamin_d + item.food.vitamin_d * factor,
        vitamin_e: totals.vitamin_e + item.food.vitamin_e * factor,
      };
    }, { ...defaultTotals });
  }, [calculatorItems]);

  const saveMeal = useCallback(async (name: string) => {
    const totals = calculatorItems.reduce((t, item) => {
      const f = item.grams / 100;
      return { cal: t.cal + item.food.calories * f, prot: t.prot + item.food.protein * f, carbs: t.carbs + item.food.carbohydrates * f, fat: t.fat + item.food.fat * f };
    }, { cal: 0, prot: 0, carbs: 0, fat: 0 });
    const meal: SavedMeal = {
      id: Date.now().toString(),
      name,
      date: new Date().toLocaleDateString("ar-SA"),
      items: [...calculatorItems],
      totalCalories: Math.round(totals.cal),
      totalProtein: Math.round(totals.prot * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
    };
    const updated = [meal, ...savedMeals];
    setSavedMeals(updated);
    await AsyncStorage.setItem("savedMeals", JSON.stringify(updated));
  }, [calculatorItems, savedMeals]);

  const deleteMeal = useCallback(async (id: string) => {
    const updated = savedMeals.filter(m => m.id !== id);
    setSavedMeals(updated);
    await AsyncStorage.setItem("savedMeals", JSON.stringify(updated));
  }, [savedMeals]);

  const toggleFavorite = useCallback(async (foodId: string) => {
    const updated = favoriteFoods.includes(foodId)
      ? favoriteFoods.filter(id => id !== foodId)
      : [...favoriteFoods, foodId];
    setFavoriteFoods(updated);
    await AsyncStorage.setItem("favoriteFoods", JSON.stringify(updated));
  }, [favoriteFoods]);

  const isFavorite = useCallback((foodId: string) => favoriteFoods.includes(foodId), [favoriteFoods]);

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    setUserProfile(profile);
    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
  }, []);

  const addWater = useCallback(async (ml: number) => {
    const newTotal = waterIntake + ml;
    setWaterIntake(newTotal);
    const today = new Date().toDateString();
    await AsyncStorage.setItem("waterIntake", JSON.stringify({ date: today, ml: newTotal }));
  }, [waterIntake]);

  const resetWater = useCallback(async () => {
    setWaterIntake(0);
    const today = new Date().toDateString();
    await AsyncStorage.setItem("waterIntake", JSON.stringify({ date: today, ml: 0 }));
  }, []);

  return (
    <AppContext.Provider value={{
      calculatorItems, addToCalculator, removeFromCalculator, updateGrams, clearCalculator,
      savedMeals, saveMeal, deleteMeal,
      favoriteFoods, toggleFavorite, isFavorite,
      userProfile, saveUserProfile,
      waterIntake, addWater, resetWater,
      getNutritionTotals,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
