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
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

interface ExerciseDef {
  id: string;
  met: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  catKey: string;
}

const EXERCISE_DEFS: ExerciseDef[] = [
  { id: "walking", met: 3.5, icon: "walk-outline", color: "#10B981", catKey: "aerobic" },
  { id: "walking_fast", met: 5, icon: "walk-outline", color: "#22C55E", catKey: "aerobic" },
  { id: "running_slow", met: 7, icon: "walk-outline", color: "#F59E0B", catKey: "aerobic" },
  { id: "running", met: 11.5, icon: "walk-outline", color: "#EF4444", catKey: "aerobic" },
  { id: "cycling", met: 8, icon: "bicycle-outline", color: "#3B82F6", catKey: "aerobic" },
  { id: "swimming", met: 8, icon: "water-outline", color: "#06B6D4", catKey: "aerobic" },
  { id: "gym", met: 5, icon: "barbell-outline", color: "#8B5CF6", catKey: "strength" },
  { id: "football", met: 10, icon: "football-outline", color: "#F97316", catKey: "sports" },
  { id: "basketball", met: 8, icon: "basketball-outline", color: "#FB923C", catKey: "sports" },
  { id: "yoga", met: 3, icon: "body-outline", color: "#A78BFA", catKey: "stretch" },
  { id: "jumping_rope", met: 12, icon: "pulse-outline", color: "#EC4899", catKey: "aerobic" },
  { id: "stairs", met: 8, icon: "arrow-up-outline", color: "#F59E0B", catKey: "daily" },
  { id: "household", met: 3.5, icon: "home-outline", color: "#6B7280", catKey: "daily" },
  { id: "shopping", met: 2.5, icon: "bag-outline", color: "#84CC16", catKey: "daily" },
  { id: "dancing", met: 6.5, icon: "musical-notes-outline", color: "#F43F5E", catKey: "entertainment" },
];

export default function CalorieBurnScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("30");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const getExName = (id: string) => {
    const key = id as keyof typeof t.caloriesBurn.exercises;
    return t.caloriesBurn.exercises[key] ?? id;
  };

  const getCatName = (key: string) => {
    const k = key as keyof typeof t.caloriesBurn.categories;
    return t.caloriesBurn.categories[k] ?? key;
  };

  const calculateBurn = (met: number) => {
    const w = parseFloat(weight) || 70;
    const d = parseFloat(duration) || 30;
    return Math.round(met * w * (d / 60));
  };

  const uniqueCats = [...new Set(EXERCISE_DEFS.map(e => e.catKey))];
  const selectedEx = EXERCISE_DEFS.find(e => e.id === selectedId) ?? null;

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
        <Text style={[styles.title, { color: colors.foreground }]}>{t.caloriesBurn.title}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{t.caloriesBurn.calcData}</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputItem}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{t.caloriesBurn.weightLabel}</Text>
            <TextInput
              style={[styles.inputField, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="70"
              placeholderTextColor={colors.mutedForeground}
              textAlign="center"
            />
          </View>
          <View style={styles.inputItem}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{t.caloriesBurn.durationLabel}</Text>
            <TextInput
              style={[styles.inputField, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={colors.mutedForeground}
              textAlign="center"
            />
          </View>
        </View>
      </View>

      {uniqueCats.map(cat => (
        <View key={cat}>
          <Text style={[styles.catTitle, { color: colors.foreground }]}>{getCatName(cat)}</Text>
          <View style={styles.exerciseGrid}>
            {EXERCISE_DEFS.filter(e => e.catKey === cat).map(ex => {
              const burned = calculateBurn(ex.met);
              const isSelected = selectedId === ex.id;
              return (
                <Pressable
                  key={ex.id}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedId(isSelected ? null : ex.id); }}
                  style={[styles.exerciseCard, { backgroundColor: isSelected ? ex.color + "20" : colors.card, borderColor: isSelected ? ex.color : colors.border, borderWidth: isSelected ? 2 : 1 }]}
                >
                  <Ionicons name={ex.icon} size={26} color={ex.color} />
                  <Text style={[styles.exName, { color: colors.foreground }]}>{getExName(ex.id)}</Text>
                  <View style={[styles.burnBadge, { backgroundColor: ex.color + "20" }]}>
                    <Ionicons name="flame" size={12} color={ex.color} />
                    <Text style={[styles.burnText, { color: ex.color }]}>{burned} {t.caloriesBurn.kcalPerDuration}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      {selectedEx && (
        <View style={[styles.detailCard, { backgroundColor: selectedEx.color + "15", borderColor: selectedEx.color }]}>
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>{getExName(selectedEx.id)}</Text>
          <View style={styles.detailStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: selectedEx.color }]}>{calculateBurn(selectedEx.met)}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.caloriesBurn.kcalPerDuration}/{duration}min</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: selectedEx.color }]}>{Math.round((selectedEx.met * (parseFloat(weight) || 70)) / 60)}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.caloriesBurn.kcalPerMin}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: selectedEx.color }]}>{Math.round(selectedEx.met * (parseFloat(weight) || 70))}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t.caloriesBurn.kcalPerHour}</Text>
            </View>
          </View>
          <View style={[styles.metInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.metText, { color: colors.mutedForeground }]}>{t.caloriesBurn.metInfo} {selectedEx.met}</Text>
          </View>
        </View>
      )}

      <View style={[styles.formulaCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Text style={[styles.formulaTitle, { color: colors.foreground }]}>{t.caloriesBurn.howCalc}</Text>
        <Text style={[styles.formulaText, { color: colors.mutedForeground }]}>{t.caloriesBurn.formula}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1, textAlign: "right" },
  card: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  inputRow: { flexDirection: "row-reverse", gap: 12 },
  inputItem: { flex: 1, gap: 6 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  inputField: { paddingVertical: 12, borderRadius: 10, fontSize: 18, fontFamily: "Inter_600SemiBold", borderWidth: 1, textAlign: "center" },
  catTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "right", paddingHorizontal: 16, marginTop: 16, marginBottom: 10 },
  exerciseGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  exerciseCard: { width: "46%", alignItems: "center", padding: 14, borderRadius: 14, gap: 8 },
  exName: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  burnBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  burnText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  detailCard: { marginHorizontal: 16, marginTop: 16, padding: 20, borderRadius: 16, borderWidth: 2, gap: 14 },
  detailTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  detailStats: { flexDirection: "row-reverse", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  metInfo: { padding: 10, borderRadius: 10, alignItems: "center" },
  metText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  formulaCard: { margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  formulaTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  formulaText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
});
