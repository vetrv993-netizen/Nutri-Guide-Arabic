import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useEffect as useRAnimatedEffect } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

const DAILY_WATER_ML = 2500;

const DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  sugar: 50,
  sodium: 2300,
  fiber: 28,
};

function MiniProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const colors = useColors();
  const pct = Math.min(value / max, 1);
  const progress = useSharedValue(0);

  useRAnimatedEffect(() => {
    progress.value = withTiming(pct, { duration: 900 });
  }, [pct]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
      <Animated.View style={[styles.miniFill, animStyle, { backgroundColor: color }]} />
    </View>
  );
}

function NutrientCard({
  label,
  value,
  unit,
  max,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}) {
  const colors = useColors();
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <View style={[styles.nutrientCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.nutrientDot, { backgroundColor: color + "25" }]}>
        <View style={[styles.nutrientDotInner, { backgroundColor: color }]} />
      </View>
      <View style={styles.nutrientInfo}>
        <View style={styles.nutrientTop}>
          <Text style={[styles.nutrientPct, { color }]}>{pct}%</Text>
          <Text style={[styles.nutrientLabel, { color: colors.foreground }]}>{label}</Text>
        </View>
        <MiniProgressBar value={value} max={max} color={color} />
        <Text style={[styles.nutrientValue, { color: colors.mutedForeground }]}>
          {value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}{unit}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { waterIntake, addWater, calculatorItems, savedMeals, getNutritionTotals } = useApp();

  const waterPct = Math.min((waterIntake / DAILY_WATER_ML) * 100, 100);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const todayStr = new Date().toLocaleDateString("ar-SA");
  const todaySavedMeals = savedMeals.filter(m => m.date === todayStr);

  const savedTotals = todaySavedMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calcTotals = getNutritionTotals();
  const hasTodayData = todaySavedMeals.length > 0 || calculatorItems.length > 0;

  const displayCalories = savedTotals.calories + Math.round(calcTotals.calories);
  const displayProtein = savedTotals.protein + calcTotals.protein;
  const displayCarbs = savedTotals.carbs + calcTotals.carbohydrates;
  const displayFat = savedTotals.fat + calcTotals.fat;

  const calPct = Math.min(Math.round((displayCalories / DAILY_GOALS.calories) * 100), 100);

  const handleAddWater = async (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addWater(ml);
  };

  const QUICK_CARDS = [
    { id: "bmi", icon: "body-outline" as const, title: t.home.bmi, subtitle: t.home.bmiSub, color: "#3B82F6", route: "/bmi" },
    { id: "req", icon: "nutrition-outline" as const, title: t.home.dailyReq, subtitle: t.home.dailyReqSub, color: "#22C55E", route: "/daily-requirements" },
    { id: "burn", icon: "flame-outline" as const, title: t.home.caloriesBurn, subtitle: t.home.caloriesBurnSub, color: "#EF4444", route: "/calorie-burn" },
    { id: "disease", icon: "medkit-outline" as const, title: t.home.medicalGuide, subtitle: t.home.medicalGuideSub, color: "#8B5CF6", route: "/disease-nutrition" },
  ];

  const ACTIVITY_CARDS = [
    { label: t.home.rest, cal: 1600, icon: "bed-outline" as const, color: "#6B7280" },
    { label: t.home.desk, cal: 1900, icon: "desktop-outline" as const, color: "#3B82F6" },
    { label: t.home.walk, cal: 2100, icon: "walk-outline" as const, color: "#22C55E" },
    { label: t.home.moderate, cal: 2400, icon: "barbell-outline" as const, color: "#F59E0B" },
    { label: t.home.intense, cal: 2800, icon: "fitness-outline" as const, color: "#EF4444" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 16,
        paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom),
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/settings")}
          style={[styles.headerBtn, { backgroundColor: colors.muted }]}
        >
          <Ionicons name="settings-outline" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{t.home.greeting}</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>{t.home.appName}</Text>
        </View>
        <View style={[styles.headerIconCircle, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons name="leaf" size={22} color={colors.primary} />
        </View>
      </View>

      {/* Daily Nutrition Dashboard */}
      <View style={[styles.dashCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.dashHeader}>
          <Text style={[styles.dashDate, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </Text>
          <Text style={[styles.dashTitle, { color: colors.foreground }]}>{t.home.todayNutrition}</Text>
        </View>

        {hasTodayData ? (
          <>
            {/* Calorie Circle */}
            <View style={styles.calorieSection}>
              <View style={[styles.calorieCircle, { borderColor: colors.primary + "40", backgroundColor: colors.secondary }]}>
                <Text style={[styles.calorieValue, { color: colors.primary }]}>{displayCalories}</Text>
                <Text style={[styles.calorieUnit, { color: colors.mutedForeground }]}>{t.home.kcal}</Text>
                <Text style={[styles.caloriePct, { color: colors.primary }]}>{calPct}%</Text>
              </View>
              <View style={styles.calorieStats}>
                <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{DAILY_GOALS.calories}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.home.dailyGoal}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>{displayCalories}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.home.consumed}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.statValue, { color: Math.max(0, DAILY_GOALS.calories - displayCalories) > 0 ? "#22C55E" : "#EF4444" }]}>
                    {Math.max(0, DAILY_GOALS.calories - displayCalories)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.home.remaining}</Text>
                </View>
              </View>
            </View>

            {/* Macro Grid */}
            <View style={styles.nutrientGrid}>
              <NutrientCard label={t.home.protein} value={displayProtein} unit={t.home.g} max={DAILY_GOALS.protein} color="#3B82F6" />
              <NutrientCard label={t.home.carbs} value={displayCarbs} unit={t.home.g} max={DAILY_GOALS.carbs} color="#F59E0B" />
              <NutrientCard label={t.home.fat} value={displayFat} unit={t.home.g} max={DAILY_GOALS.fat} color="#8B5CF6" />
              <NutrientCard label={t.home.sugar} value={calcTotals.sugar} unit={t.home.g} max={DAILY_GOALS.sugar} color="#EC4899" />
              <NutrientCard label={t.home.fiber} value={calcTotals.fiber} unit={t.home.g} max={DAILY_GOALS.fiber} color="#10B981" />
              <NutrientCard label={t.home.sodium} value={Math.round(calcTotals.sodium)} unit={t.home.mg} max={DAILY_GOALS.sodium} color="#06B6D4" />
            </View>
          </>
        ) : (
          <View style={styles.dashEmpty}>
            <Ionicons name="restaurant-outline" size={44} color={colors.mutedForeground} />
            <Text style={[styles.dashEmptyTitle, { color: colors.foreground }]}>{t.home.noMealsYet}</Text>
            <Text style={[styles.dashEmptyText, { color: colors.mutedForeground }]}>{t.home.addFromCalculator}</Text>
            <Pressable
              onPress={() => router.push("/calculator")}
              style={[styles.dashEmptyBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="calculator" size={16} color="#fff" />
              <Text style={styles.dashEmptyBtnText}>{t.home.goToCalc}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Calculator shortcut if items exist */}
      {calculatorItems.length > 0 && (
        <Pressable
          onPress={() => router.push("/calculator")}
          style={[styles.calcBanner, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="chevron-back" size={16} color="#fff" />
          <Text style={styles.calcBannerText}>
            {calculatorItems.length} {t.home.itemsInCalc}
          </Text>
          <Ionicons name="calculator" size={18} color="#fff" />
        </Pressable>
      )}

      {/* Water tracker */}
      <View style={[styles.waterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.waterHeader}>
          <Text style={[styles.waterAmount, { color: "#60A5FA" }]}>
            {waterIntake} / {DAILY_WATER_ML} {t.home.ml}
          </Text>
          <Text style={[styles.waterTitle, { color: colors.foreground }]}>{t.home.waterToday}</Text>
          <Feather name="droplet" size={18} color="#60A5FA" />
        </View>
        <View style={[styles.waterTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.waterFill, { width: `${waterPct}%`, backgroundColor: "#60A5FA" }]} />
        </View>
        <View style={styles.waterBtns}>
          {[200, 250, 330, 500].map((ml) => (
            <Pressable
              key={ml}
              onPress={() => handleAddWater(ml)}
              style={[styles.waterBtn, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}
            >
              <Text style={[styles.waterBtnText, { color: "#1D4ED8" }]}>
                +{ml}{t.home.ml}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick tools */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.quickTools}</Text>
      <View style={styles.quickGrid}>
        {QUICK_CARDS.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(card.route as any);
            }}
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: card.color + "18" }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={[styles.quickTitle, { color: colors.foreground }]}>{card.title}</Text>
            <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      {/* Activity Calories Panel */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.activityCalories}</Text>
      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{t.home.activityNote}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activityList}
      >
        {ACTIVITY_CARDS.map((card) => (
          <View
            key={card.label}
            style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.activityIcon, { backgroundColor: card.color + "18" }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
            </View>
            <Text style={[styles.activityCal, { color: card.color }]}>{card.cal}</Text>
            <Text style={[styles.activityCalUnit, { color: colors.mutedForeground }]}>{t.home.kcal}</Text>
            <Text style={[styles.activityLabel, { color: colors.foreground }]}>{card.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Tip of the day */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.tipOfDay}</Text>
      <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="bulb-outline" size={22} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.foreground }]}>{t.home.tipText}</Text>
      </View>

      {/* Macro distribution */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.macroDistribution}</Text>
      <View style={styles.macroRow}>
        {[
          { label: t.home.carbohydrates, pct: "50-60%", color: "#F59E0B", desc: t.home.mainEnergy },
          { label: t.home.protein, pct: "20-30%", color: "#3B82F6", desc: t.home.muscleBuilding },
          { label: t.home.fats, pct: "20-30%", color: "#8B5CF6", desc: t.home.hormones },
        ].map((m) => (
          <View
            key={m.label}
            style={[styles.macroCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.macroIconDot, { backgroundColor: m.color + "20" }]}>
              <View style={[styles.macroInnerDot, { backgroundColor: m.color }]} />
            </View>
            <Text style={[styles.macroPct, { color: m.color }]}>{m.pct}</Text>
            <Text style={[styles.macroLabel, { color: colors.foreground }]}>{m.label}</Text>
            <Text style={[styles.macroDesc, { color: colors.mutedForeground }]}>{m.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  appName: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "right" },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dashCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  dashHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  dashTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right" },
  dashDate: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginBottom: 2 },
  calorieSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  calorieCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  calorieValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  calorieUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  caloriePct: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  calorieStats: { flex: 1, gap: 8 },
  statBox: { borderRadius: 10, padding: 8, alignItems: "center" },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  nutrientGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  nutrientCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
  },
  nutrientDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientDotInner: { width: 10, height: 10, borderRadius: 5 },
  nutrientInfo: { flex: 1, gap: 4 },
  nutrientTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  nutrientLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "right" },
  nutrientPct: { fontSize: 12, fontFamily: "Inter_700Bold" },
  miniTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: 2 },
  nutrientValue: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  dashEmpty: { alignItems: "center", padding: 28, gap: 10 },
  dashEmptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dashEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  dashEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  dashEmptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  calcBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
  },
  calcBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textAlign: "right",
    marginHorizontal: 8,
  },
  waterCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  waterHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  waterTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  waterAmount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  waterTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  waterFill: { height: "100%", borderRadius: 5 },
  waterBtns: { flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" },
  waterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  waterBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  quickCard: {
    width: "46%",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  quickSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  activityList: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  activityCard: {
    width: 110,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  activityCalUnit: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -4 },
  activityLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  tipCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
  macroRow: {
    flexDirection: "row-reverse",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  macroCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  macroIconDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  macroInnerDot: { width: 12, height: 12, borderRadius: 6 },
  macroPct: { fontSize: 15, fontFamily: "Inter_700Bold" },
  macroLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  macroDesc: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
});
