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

const BMI_RANGES = [
  { color: "#3B82F6", min: 0, max: 16 },
  { color: "#60A5FA", min: 16, max: 18.5 },
  { color: "#22C55E", min: 18.5, max: 25 },
  { color: "#F59E0B", min: 25, max: 30 },
  { color: "#F97316", min: 30, max: 35 },
  { color: "#EF4444", min: 35, max: 40 },
  { color: "#DC2626", min: 40, max: 999 },
];

export default function BMIScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [result, setResult] = useState<{
    bmi: number;
    categoryIndex: number;
    idealMin: number;
    idealMax: number;
  } | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return;
    const bmi = w / (h * h);
    const idealMin = Math.round(18.5 * h * h * 10) / 10;
    const idealMax = Math.round(24.9 * h * h * 10) / 10;
    const idx = BMI_RANGES.findIndex(r => bmi >= r.min && bmi < r.max);
    setResult({ bmi: Math.round(bmi * 10) / 10, categoryIndex: idx >= 0 ? idx : 2, idealMin, idealMax });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const BMIScale = ({ bmi }: { bmi: number }) => {
    const pct = Math.min(Math.max(((bmi - 10) / 40) * 100, 0), 100);
    return (
      <View style={styles.scale}>
        <View style={styles.scaleBar}>
          {BMI_RANGES.map((r, i) => (
            <View key={i} style={[styles.scaleSegment, { backgroundColor: r.color }]} />
          ))}
          <View style={[styles.scaleIndicator, { left: `${pct}%` as any }]} />
        </View>
        <View style={styles.scaleLabels}>
          {["16", "18.5", "25", "30", "40+"].map(l => (
            <Text key={l} style={[styles.scaleLabel, { color: colors.mutedForeground }]}>{l}</Text>
          ))}
        </View>
      </View>
    );
  };

  const cat = result ? t.bmi.categories[result.categoryIndex] : null;
  const catColor = result ? BMI_RANGES[result.categoryIndex].color : "#22C55E";

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
        <Text style={[styles.title, { color: colors.foreground }]}>{t.bmi.title}</Text>
      </View>

      {/* Gender */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.foreground }]}>{t.bmi.gender}</Text>
        <View style={styles.genderRow}>
          <Pressable onPress={() => setGender("female")} style={[styles.genderBtn, { backgroundColor: gender === "female" ? "#EC4899" : colors.muted, flex: 1 }]}>
            <Ionicons name="woman" size={20} color={gender === "female" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.genderText, { color: gender === "female" ? "#fff" : colors.foreground }]}>{t.common.female}</Text>
          </Pressable>
          <Pressable onPress={() => setGender("male")} style={[styles.genderBtn, { backgroundColor: gender === "male" ? "#3B82F6" : colors.muted, flex: 1 }]}>
            <Ionicons name="man" size={20} color={gender === "male" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.genderText, { color: gender === "male" ? "#fff" : colors.foreground }]}>{t.common.male}</Text>
          </Pressable>
        </View>
      </View>

      {/* Inputs */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 16 }]}>
        <InputField label={t.bmi.weight} value={weight} onChangeText={setWeight} placeholder={t.bmi.weightPlaceholder} unit={t.bmi.weightUnit} colors={colors} />
        <InputField label={t.bmi.height} value={height} onChangeText={setHeight} placeholder={t.bmi.heightPlaceholder} unit={t.bmi.heightUnit} colors={colors} />
        <InputField label={t.bmi.age} value={age} onChangeText={setAge} placeholder={t.bmi.agePlaceholder} unit={t.bmi.ageUnit} colors={colors} />
      </View>

      <Pressable onPress={calculate} style={[styles.calcBtn, { backgroundColor: colors.primary }]}>
        <Ionicons name="calculator" size={20} color="#fff" />
        <Text style={[styles.calcBtnText, { color: "#fff" }]}>{t.bmi.calculate}</Text>
      </Pressable>

      {result && cat && (
        <View style={styles.results}>
          <View style={[styles.resultCard, { backgroundColor: catColor + "15", borderColor: catColor }]}>
            <Text style={[styles.bmiValue, { color: catColor }]}>{result.bmi}</Text>
            <Text style={[styles.bmiLabel, { color: colors.foreground }]}>{t.bmi.bmiIndex}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
              <Text style={styles.categoryText}>{cat.label}</Text>
            </View>
          </View>

          <BMIScale bmi={result.bmi} />

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.descText, { color: colors.foreground }]}>{cat.description}</Text>
          </View>

          <View style={[styles.idealCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.idealTitle, { color: colors.foreground }]}>{t.bmi.idealWeight}</Text>
            <Text style={[styles.idealRange, { color: colors.primary }]}>{result.idealMin} - {result.idealMax} {t.bmi.kg}</Text>
            <Text style={[styles.idealNote, { color: colors.mutedForeground }]}>{t.bmi.basedOn}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 8 }]}>
            <Text style={[styles.label, { color: colors.foreground }]}>{t.bmi.bmiRef}</Text>
            {BMI_RANGES.map((r, i) => (
              <View key={i} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: r.color }]} />
                <Text style={[styles.catLabel, { color: colors.foreground }]}>{t.bmi.categories[i].label}</Text>
                <Text style={[styles.catRange, { color: colors.mutedForeground }]}>
                  {r.max === 999 ? `${r.min}+` : `${r.min} - ${r.max}`}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.warningCard, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={[styles.warningText, { color: "#92400E" }]}>{t.bmi.bmiNote}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function InputField({ label, value, onChangeText, placeholder, unit, colors }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "right", color: colors.foreground }}>{label}</Text>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.muted, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 }}>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginLeft: 4 }}>{unit}</Text>
        <TextInput
          style={{ flex: 1, paddingVertical: 12, fontSize: 16, fontFamily: "Inter_500Medium", textAlign: "right", color: colors.foreground }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "right", flex: 1 },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  genderRow: { flexDirection: "row-reverse", gap: 10 },
  genderBtn: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  genderText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  calcBtn: { marginHorizontal: 16, paddingVertical: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  calcBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  results: { gap: 12, paddingHorizontal: 16 },
  resultCard: { alignItems: "center", padding: 28, borderRadius: 20, borderWidth: 2, gap: 8 },
  bmiValue: { fontSize: 64, fontFamily: "Inter_700Bold" },
  bmiLabel: { fontSize: 16, fontFamily: "Inter_400Regular" },
  categoryBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  categoryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  scale: { gap: 6 },
  scaleBar: { height: 16, borderRadius: 8, overflow: "visible", flexDirection: "row", position: "relative" },
  scaleSegment: { flex: 1 },
  scaleIndicator: { position: "absolute", top: -4, width: 4, height: 24, backgroundColor: "#111", borderRadius: 2 },
  scaleLabels: { flexDirection: "row-reverse", justifyContent: "space-between" },
  scaleLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22, flex: 1 },
  idealCard: { padding: 20, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 6 },
  idealTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  idealRange: { fontSize: 28, fontFamily: "Inter_700Bold" },
  idealNote: { fontSize: 12, fontFamily: "Inter_400Regular" },
  catRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right" },
  catRange: { fontSize: 12, fontFamily: "Inter_400Regular" },
  warningCard: { padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 10, alignItems: "flex-start", marginBottom: 20 },
  warningText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
});
