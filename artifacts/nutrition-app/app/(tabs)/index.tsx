import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DAILY_WATER_ML = 2500;

interface QuickCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  route: string;
}

const QUICK_CARDS: QuickCard[] = [
  { id: "bmi", icon: "body-outline", title: "مؤشر كتلة الجسم", subtitle: "احسب وزنك المثالي", color: "#3B82F6", route: "/bmi" },
  { id: "req", icon: "nutrition-outline", title: "احتياجاتك اليومية", subtitle: "سعرات وبروتين وماء", color: "#10B981", route: "/daily-requirements" },
  { id: "burn", icon: "flame-outline", title: "حرق السعرات", subtitle: "بالرياضة والنشاط", color: "#EF4444", route: "/calorie-burn" },
  { id: "disease", icon: "medkit-outline", title: "دليل التغذية الطبية", subtitle: "سكري، ضغط، قلب وأكثر", color: "#8B5CF6", route: "/disease-nutrition" },
];

const ACTIVITY_CARDS = [
  { label: "راحة تامة", cal: 1600, icon: "bed-outline" as const, color: "#6B7280" },
  { label: "عمل مكتبي", cal: 1900, icon: "desktop-outline" as const, color: "#3B82F6" },
  { label: "مشي يومي", cal: 2100, icon: "walk-outline" as const, color: "#10B981" },
  { label: "رياضة متوسطة", cal: 2400, icon: "barbell-outline" as const, color: "#F59E0B" },
  { label: "رياضة شديدة", cal: 2800, icon: "fitness-outline" as const, color: "#EF4444" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { waterIntake, addWater, calculatorItems } = useApp();
  const waterPct = Math.min((waterIntake / DAILY_WATER_ML) * 100, 100);

  const handleAddWater = async (ml: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addWater(ml);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>مرحباً</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>الحاسبة الغذائية الذكية</Text>
        </View>
        <Pressable
          onPress={() => router.push("/daily-requirements")}
          style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="person-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Water tracker */}
      <View style={[styles.waterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.waterHeader}>
          <Feather name="droplet" size={18} color="#60A5FA" />
          <Text style={[styles.waterTitle, { color: colors.foreground }]}>شرب الماء اليوم</Text>
          <Text style={[styles.waterAmount, { color: "#60A5FA" }]}>{waterIntake} / {DAILY_WATER_ML} مل</Text>
        </View>
        <View style={[styles.waterTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.waterFill, { width: `${waterPct}%`, backgroundColor: "#60A5FA" }]} />
        </View>
        <View style={styles.waterBtns}>
          {[200, 250, 330, 500].map(ml => (
            <Pressable key={ml} onPress={() => handleAddWater(ml)} style={[styles.waterBtn, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <Text style={[styles.waterBtnText, { color: "#1D4ED8" }]}>+{ml}مل</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Calculator shortcut if items exist */}
      {calculatorItems.length > 0 && (
        <Pressable
          onPress={() => router.push("/calculator")}
          style={[styles.calcBanner, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="calculator" size={18} color="#fff" />
          <Text style={[styles.calcBannerText, { color: "#fff" }]}>لديك {calculatorItems.length} عنصر في الحاسبة</Text>
          <Ionicons name="chevron-back" size={16} color="#fff" />
        </Pressable>
      )}

      {/* Quick tools */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الأدوات السريعة</Text>
      <View style={styles.quickGrid}>
        {QUICK_CARDS.map(card => (
          <Pressable
            key={card.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(card.route as any); }}
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickIcon, { backgroundColor: card.color + "20" }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={[styles.quickTitle, { color: colors.foreground }]}>{card.title}</Text>
            <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      {/* Activity Calories Panel */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>السعرات حسب النشاط</Text>
      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>تقديري لشخص 70 كغ و170 سم بالغ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityList}>
        {ACTIVITY_CARDS.map(card => (
          <View key={card.label} style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.activityIcon, { backgroundColor: card.color + "20" }]}>
              <Ionicons name={card.icon} size={22} color={card.color} />
            </View>
            <Text style={[styles.activityCal, { color: card.color }]}>{card.cal}</Text>
            <Text style={[styles.activityCalUnit, { color: colors.mutedForeground }]}>كالوري</Text>
            <Text style={[styles.activityLabel, { color: colors.foreground }]}>{card.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Nutrition tips */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>نصيحة اليوم</Text>
      <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="bulb-outline" size={22} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.foreground }]}>
          تناول 5 حصص من الخضروات والفواكه يومياً لتحصل على جميع الفيتامينات والمعادن الأساسية التي يحتاجها جسمك.
        </Text>
      </View>

      {/* Macros info cards */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>توزيع الماكرو الموصى به</Text>
      <View style={styles.macroRow}>
        {[
          { label: "كربوهيدرات", pct: "50-60%", color: "#F59E0B", desc: "المصدر الرئيسي للطاقة" },
          { label: "بروتين", pct: "20-30%", color: "#3B82F6", desc: "لبناء العضلات" },
          { label: "دهون", pct: "20-30%", color: "#8B5CF6", desc: "للهرمونات والفيتامينات" },
        ].map(m => (
          <View key={m.label} style={[styles.macroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right" },
  appName: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right" },
  headerBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  waterCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  waterHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  waterTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  waterAmount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  waterTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  waterFill: { height: "100%", borderRadius: 5 },
  waterBtns: { flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" },
  waterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  waterBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  calcBanner: { marginHorizontal: 16, marginBottom: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, gap: 8 },
  calcBannerText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "right" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right", marginHorizontal: 20, marginTop: 20, marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginHorizontal: 20, marginBottom: 12 },
  quickGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, marginTop: 12 },
  quickCard: { width: "46%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  quickSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  activityList: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  activityCard: { width: 110, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  activityIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activityCal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  activityCalUnit: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -6 },
  activityLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  tipCard: { marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: "row-reverse", gap: 12, alignItems: "flex-start" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
  macroRow: { flexDirection: "row-reverse", gap: 10, paddingHorizontal: 16, marginTop: 12 },
  macroCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  macroPct: { fontSize: 16, fontFamily: "Inter_700Bold" },
  macroLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  macroDesc: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
});
