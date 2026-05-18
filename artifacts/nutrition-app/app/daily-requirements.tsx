import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

interface DailyNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  fiber: number;
  bmr: number;
  tdee: number;
}

function calculateNeeds(age: number, weight: number, height: number, gender: string, activityMultiplier: number, goalAdjust: number): DailyNeeds {
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const tdee = bmr * activityMultiplier;
  const calories = Math.round(tdee + goalAdjust);
  const protein = Math.round(weight * 1.6);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  const water = Math.round(weight * 33);
  const fiber = gender === "male" ? 38 : 25;
  return { calories, protein, carbs, fat, water, fiber, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

export default function DailyRequirementsScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { saveUserProfile, userProfile } = useApp();
  const [age, setAge] = useState(userProfile?.age?.toString() || "");
  const [weight, setWeight] = useState(userProfile?.weight?.toString() || "");
  const [height, setHeight] = useState(userProfile?.height?.toString() || "");
  const [gender, setGender] = useState<"male" | "female">(userProfile?.gender || "male");
  const [activityLevel, setActivityLevel] = useState(userProfile?.activityLevel || "moderate");
  const [goal, setGoal] = useState(userProfile?.goal || "maintain");
  const [result, setResult] = useState<DailyNeeds | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const activityKeys = Object.keys(ACTIVITY_MULTIPLIERS);
  const goalKeys = Object.keys(GOAL_ADJUSTMENTS);

  const getActivityLabel = (key: string) => {
    const k = key as keyof typeof t.dailyReq.activityLevels;
    return t.dailyReq.activityLevels[k] ?? key;
  };

  const getGoalLabel = (key: string) => {
    const k = key as keyof typeof t.dailyReq.goals;
    return t.dailyReq.goals[k] ?? key;
  };

  const calculate = async () => {
    const a = parseInt(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!a || !w || !h) return;
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
    const adjust = GOAL_ADJUSTMENTS[goal] ?? 0;
    const needs = calculateNeeds(a, w, h, gender, multiplier, adjust);
    setResult(needs);
    await saveUserProfile({ age: a, weight: w, height: h, gender, activityLevel: activityLevel as any, goal: goal as any });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const waterCups = result
    ? t.dailyReq.waterCups.replace("{n}", String(Math.round(result.water / 250)))
    : "";

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
        <Text style={[styles.title, { color: colors.foreground }]}>{t.dailyReq.title}</Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{t.dailyReq.formula}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t.dailyReq.gender}</Text>
        <View style={styles.genderRow}>
          {(["female", "male"] as const).map(g => (
            <Pressable key={g} onPress={() => setGender(g)} style={[styles.genderBtn, { backgroundColor: gender === g ? colors.primary : colors.muted, flex: 1 }]}>
              <Ionicons name={g === "male" ? "man" : "woman"} size={18} color={gender === g ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.genderText, { color: gender === g ? "#fff" : colors.foreground }]}>
                {g === "male" ? t.common.male : t.common.female}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputsGrid}>
          <InputF label={t.dailyReq.age} value={age} onChange={setAge} unit={t.dailyReq.ageUnit} colors={colors} />
          <InputF label={t.dailyReq.weight} value={weight} onChange={setWeight} unit={t.dailyReq.weightUnit} colors={colors} />
          <InputF label={t.dailyReq.height} value={height} onChange={setHeight} unit={t.dailyReq.heightUnit} colors={colors} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t.dailyReq.activityLevel}</Text>
        {activityKeys.map(key => (
          <Pressable key={key} onPress={() => setActivityLevel(key)} style={[styles.optionRow, { borderColor: activityLevel === key ? colors.primary : colors.border, backgroundColor: activityLevel === key ? colors.primary + "10" : colors.muted }]}>
            <View style={[styles.radio, { borderColor: activityLevel === key ? colors.primary : colors.border }]}>
              {activityLevel === key && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.optionText, { color: colors.foreground }]}>{getActivityLabel(key)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t.dailyReq.goal}</Text>
        <View style={styles.goalRow}>
          {goalKeys.map(key => (
            <Pressable key={key} onPress={() => setGoal(key)} style={[styles.goalBtn, { backgroundColor: goal === key ? colors.primary : colors.muted, borderColor: goal === key ? colors.primary : colors.border }]}>
              <Text style={[styles.goalText, { color: goal === key ? "#fff" : colors.foreground }]}>{getGoalLabel(key)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={calculate} style={[styles.calcBtn, { backgroundColor: colors.primary }]}>
        <Ionicons name="calculator" size={20} color="#fff" />
        <Text style={styles.calcBtnText}>{t.dailyReq.calculate}</Text>
      </Pressable>

      {result && (
        <View style={styles.results}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metaRow}>
              <View style={[styles.metaItem, { backgroundColor: "#3B82F620" }]}>
                <Text style={[styles.metaValue, { color: "#3B82F6" }]}>{result.bmr}</Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{t.dailyReq.bmrLabel}</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.metaValue, { color: colors.primary }]}>{result.tdee}</Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{t.dailyReq.tdeeLabel}</Text>
              </View>
              <View style={[styles.metaItem, { backgroundColor: "#F59E0B20" }]}>
                <Text style={[styles.metaValue, { color: "#F59E0B" }]}>{result.calories}</Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{t.dailyReq.dailyGoal}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t.dailyReq.macroDist}</Text>
            <NutritionBar label={t.nutrients.calories} value={result.calories} unit={t.nutrients.kcal} dailyTarget={result.calories} color={colors.primary} />
            <NutritionBar label={t.nutrients.protein} value={result.protein} unit={t.nutrients.g} dailyTarget={result.protein} color="#3B82F6" />
            <NutritionBar label={t.nutrients.carbohydrates} value={result.carbs} unit={t.nutrients.g} dailyTarget={result.carbs} color="#F59E0B" />
            <NutritionBar label={t.nutrients.fat} value={result.fat} unit={t.nutrients.g} dailyTarget={result.fat} color="#8B5CF6" />
            <NutritionBar label={t.nutrients.fiber} value={result.fiber} unit={t.nutrients.g} dailyTarget={result.fiber} color="#10B981" />
          </View>

          <View style={[styles.waterCard, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
            <Ionicons name="water" size={32} color="#3B82F6" />
            <View>
              <Text style={[styles.waterValue, { color: "#1D4ED8" }]}>{result.water} {t.dailyReq.waterVal}</Text>
              <Text style={[styles.waterLabel, { color: "#3B82F6" }]}>{waterCups}</Text>
            </View>
          </View>

          <View style={[styles.noteCard, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
            <Ionicons name="warning-outline" size={16} color="#D97706" />
            <Text style={[styles.noteText, { color: "#92400E" }]}>{t.dailyReq.note}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function InputF({ label, value, onChange, unit, colors }: any) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right", color: colors.foreground }}>{label}</Text>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.muted, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10 }}>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginLeft: 4 }}>{unit}</Text>
        <TextInput
          style={{ flex: 1, paddingVertical: 10, fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "right", color: colors.foreground }}
          value={value} onChangeText={onChange} keyboardType="numeric"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1, textAlign: "right" },
  infoCard: { marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 8, alignItems: "center" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  genderRow: { flexDirection: "row-reverse", gap: 10 },
  genderBtn: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 10 },
  genderText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputsGrid: { gap: 10 },
  optionRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right" },
  goalRow: { gap: 8 },
  goalBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  goalText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  calcBtn: { marginHorizontal: 16, paddingVertical: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  calcBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  results: { gap: 12, paddingHorizontal: 16 },
  metaRow: { flexDirection: "row-reverse", gap: 8 },
  metaItem: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, gap: 4 },
  metaValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  metaLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  waterCard: { padding: 20, borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", alignItems: "center", gap: 16 },
  waterValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  waterLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  noteCard: { padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 10, alignItems: "flex-start", marginBottom: 20 },
  noteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
});
