import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NutritionBar } from "@/components/NutritionBar";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { FOOD_DATABASE } from "@/data/foodDatabase";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

const DAILY_TARGETS = {
  calories: 2000, protein: 50, carbohydrates: 275, fat: 78,
  saturated_fat: 20, fiber: 28, sugar: 50, sodium: 2300,
  potassium: 4700, calcium: 1000, iron: 18, magnesium: 400,
  cholesterol: 300, vitamin_a: 900, vitamin_b12: 2.4, vitamin_c: 90,
  vitamin_d: 15, vitamin_e: 15,
};

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const t = useTranslation();
  const { language } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToCalculator, isFavorite, toggleFavorite } = useApp();
  const [grams, setGrams] = useState("100");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const food = FOOD_DATABASE.find(f => f.id === id);
  if (!food) return null;

  const factor = parseFloat(grams || "0") / 100;
  const scaled = {
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbohydrates: food.carbohydrates * factor,
    fat: food.fat * factor,
    saturated_fat: food.saturated_fat * factor,
    fiber: food.fiber * factor,
    sugar: food.sugar * factor,
    sodium: food.sodium * factor,
    potassium: food.potassium * factor,
    calcium: food.calcium * factor,
    iron: food.iron * factor,
    magnesium: food.magnesium * factor,
    cholesterol: food.cholesterol * factor,
    vitamin_a: food.vitamin_a * factor,
    vitamin_b12: food.vitamin_b12 * factor,
    vitamin_c: food.vitamin_c * factor,
    vitamin_d: food.vitamin_d * factor,
    vitamin_e: food.vitamin_e * factor,
  };

  const foodName = language === "en" ? food.english_name : food.arabic_name;
  const foodCategory = language === "en" ? food.category : food.category_arabic;

  const handleAddToCalc = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCalculator(food, parseFloat(grams) || 100);
    router.push("/calculator" as any);
  };

  const calNote = t.foodDetail.calNote
    .replace("{g}", grams || "100")
    .replace("{name}", foodName);

  const quickGrams = ["50", "100", "150", "200", "250"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <Pressable onPress={async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await toggleFavorite(food.id); }} style={[styles.favBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name={isFavorite(food.id) ? "heart" : "heart-outline"} size={20} color={isFavorite(food.id) ? colors.destructive : colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.titleSection}>
        <Text style={[styles.foodName, { color: colors.foreground }]}>{foodName}</Text>
        <Text style={[styles.foodEnName, { color: colors.mutedForeground }]}>
          {language === "en" ? food.arabic_name : food.english_name}
        </Text>
        <View style={[styles.catBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.catText, { color: colors.primary }]}>{foodCategory}</Text>
        </View>
      </View>

      <View style={[styles.gramsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.gramsLabel, { color: colors.foreground }]}>{t.foodDetail.amount}</Text>
        <View style={styles.gramsRow}>
          <Pressable onPress={() => setGrams(String(Math.max(10, parseFloat(grams || "0") - 10)))} style={[styles.stepBtn, { backgroundColor: colors.muted }]}>
            <Ionicons name="remove" size={18} color={colors.foreground} />
          </Pressable>
          <TextInput
            style={[styles.gramsInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={grams}
            onChangeText={setGrams}
            keyboardType="numeric"
            textAlign="center"
          />
          <Text style={[styles.gramsUnit, { color: colors.mutedForeground }]}>{t.foodDetail.gramUnit}</Text>
          <Pressable onPress={() => setGrams(String(parseFloat(grams || "0") + 10))} style={[styles.stepBtn, { backgroundColor: colors.muted }]}>
            <Ionicons name="add" size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.quickGrams}>
          {quickGrams.map(g => (
            <Pressable key={g} onPress={() => setGrams(g)} style={[styles.quickGramBtn, { backgroundColor: grams === g ? colors.primary : colors.muted }]}>
              <Text style={[styles.quickGramText, { color: grams === g ? "#fff" : colors.foreground }]}>{g}{t.foodDetail.g}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.calCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
        <Text style={[styles.calValue, { color: colors.primary }]}>{scaled.calories.toFixed(0)}</Text>
        <Text style={[styles.calLabel, { color: colors.foreground }]}>{t.foodDetail.calLabel}</Text>
        <Text style={[styles.calNote, { color: colors.mutedForeground }]}>{calNote}</Text>
      </View>

      <View style={styles.macroGrid}>
        {[
          { label: t.foodDetail.protein, value: scaled.protein, color: "#3B82F6" },
          { label: t.foodDetail.carbs, value: scaled.carbohydrates, color: "#F59E0B" },
          { label: t.foodDetail.fat, value: scaled.fat, color: "#8B5CF6" },
          { label: t.foodDetail.fiber, value: scaled.fiber, color: "#10B981" },
        ].map(m => (
          <View key={m.label} style={[styles.macroItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.macroValue, { color: m.color }]}>{m.value.toFixed(1)}</Text>
            <Text style={[styles.macroUnit, { color: colors.mutedForeground }]}>{t.foodDetail.g}</Text>
            <Text style={[styles.macroLabel, { color: colors.foreground }]}>{m.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.nutritionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.nutritionTitle, { color: colors.foreground }]}>{t.foodDetail.fullNutrition}</Text>
        <NutritionBar label={t.nutrients.calories} value={scaled.calories} unit={t.nutrients.kcal} dailyTarget={DAILY_TARGETS.calories} />
        <NutritionBar label={t.nutrients.protein} value={scaled.protein} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.protein} color="#3B82F6" />
        <NutritionBar label={t.nutrients.carbohydrates} value={scaled.carbohydrates} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.carbohydrates} color="#F59E0B" />
        <NutritionBar label={t.nutrients.fat} value={scaled.fat} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.fat} color="#8B5CF6" />
        <NutritionBar label={t.nutrients.saturated_fat} value={scaled.saturated_fat} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.saturated_fat} color="#EC4899" />
        <NutritionBar label={t.nutrients.fiber} value={scaled.fiber} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.fiber} color="#10B981" />
        <NutritionBar label={t.nutrients.sugar} value={scaled.sugar} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.sugar} color="#F97316" />
        <NutritionBar label={t.nutrients.sodium} value={scaled.sodium} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.sodium} color="#06B6D4" />
        <NutritionBar label={t.nutrients.potassium} value={scaled.potassium} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.potassium} color="#84CC16" />
        <NutritionBar label={t.nutrients.calcium} value={scaled.calcium} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.calcium} color="#A78BFA" />
        <NutritionBar label={t.nutrients.iron} value={scaled.iron} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.iron} color="#F87171" />
        <NutritionBar label={t.nutrients.magnesium} value={scaled.magnesium} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.magnesium} color="#34D399" />
        <NutritionBar label={t.nutrients.cholesterol} value={scaled.cholesterol} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.cholesterol} color="#F43F5E" />
        <NutritionBar label={t.nutrients.vitamin_a} value={scaled.vitamin_a} unit={t.nutrients.mcg} dailyTarget={DAILY_TARGETS.vitamin_a} color="#FCD34D" />
        <NutritionBar label={t.nutrients.vitamin_b12} value={scaled.vitamin_b12} unit={t.nutrients.mcg} dailyTarget={DAILY_TARGETS.vitamin_b12} color="#93C5FD" />
        <NutritionBar label={t.nutrients.vitamin_c} value={scaled.vitamin_c} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.vitamin_c} color="#FBBF24" />
        <NutritionBar label={t.nutrients.vitamin_d} value={scaled.vitamin_d} unit={t.nutrients.mcg} dailyTarget={DAILY_TARGETS.vitamin_d} color="#FDE68A" />
        <NutritionBar label={t.nutrients.vitamin_e} value={scaled.vitamin_e} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.vitamin_e} color="#6EE7B7" />
      </View>

      <Pressable onPress={handleAddToCalc} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={[styles.addBtnText, { color: "#fff" }]}>{t.foodDetail.addToCalc}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  favBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titleSection: { alignItems: "center", paddingHorizontal: 20, gap: 6, marginBottom: 16 },
  foodName: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  foodEnName: { fontSize: 16, fontFamily: "Inter_400Regular", textAlign: "center" },
  catBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  catText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  gramsCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  gramsLabel: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center" },
  gramsRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 10 },
  stepBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gramsInput: { width: 80, paddingVertical: 10, borderRadius: 10, fontSize: 18, fontFamily: "Inter_700Bold", borderWidth: 1 },
  gramsUnit: { fontSize: 14, fontFamily: "Inter_400Regular" },
  quickGrams: { flexDirection: "row-reverse", gap: 8, justifyContent: "center" },
  quickGramBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  quickGramText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  calCard: { marginHorizontal: 16, marginBottom: 12, padding: 20, borderRadius: 16, borderWidth: 2, alignItems: "center", gap: 4 },
  calValue: { fontSize: 52, fontFamily: "Inter_700Bold" },
  calLabel: { fontSize: 16, fontFamily: "Inter_400Regular" },
  calNote: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  macroGrid: { flexDirection: "row-reverse", gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  macroItem: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, gap: 2 },
  macroValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  macroUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  macroLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  nutritionCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, gap: 2 },
  nutritionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right", marginBottom: 8 },
  addBtn: { marginHorizontal: 16, paddingVertical: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  addBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
