import { Ionicons, Feather } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const MENU_ITEMS: MenuItem[] = [
    { id: "bmi", title: t.more.bmi, subtitle: t.more.bmiSub, icon: "body-outline", color: "#3B82F6", route: "/bmi" },
    { id: "req", title: t.more.dailyReq, subtitle: t.more.dailyReqSub, icon: "nutrition-outline", color: "#22C55E", route: "/daily-requirements" },
    { id: "burn", title: t.more.caloriesBurn, subtitle: t.more.caloriesBurnSub, icon: "flame-outline", color: "#EF4444", route: "/calorie-burn" },
    { id: "disease", title: t.more.medicalGuide, subtitle: t.more.medicalGuideSub, icon: "medkit-outline", color: "#8B5CF6", route: "/disease-nutrition" },
    { id: "saved", title: t.more.savedMeals, subtitle: t.more.savedMealsSub, icon: "bookmark-outline", color: "#F59E0B", route: "/saved-meals" },
    { id: "favorites", title: t.more.favorites, subtitle: t.more.favoritesSub, icon: "heart-outline", color: "#F43F5E", route: "/favorites" },
    { id: "settings", title: t.more.settings, subtitle: t.more.settingsSub, icon: "settings-outline", color: "#6366F1", route: "/settings" },
  ];

  const HEALTH_FACTS = [
    { icon: "water-outline" as const, text: t.more.fact1, color: "#60A5FA" },
    { icon: "leaf-outline" as const, text: t.more.fact2, color: "#4ADE80" },
    { icon: "walk-outline" as const, text: t.more.fact3, color: "#FB923C" },
    { icon: "moon-outline" as const, text: t.more.fact4, color: "#A78BFA" },
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
      <Text style={[styles.title, { color: colors.foreground }]}>{t.more.title}</Text>

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(item.route as any);
            }}
            style={[
              styles.menuItem,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderBottomLeftRadius: index === MENU_ITEMS.length - 1 ? 16 : 0,
                borderBottomRightRadius: index === MENU_ITEMS.length - 1 ? 16 : 0,
                borderTopLeftRadius: index === 0 ? 16 : 0,
                borderTopRightRadius: index === 0 ? 16 : 0,
                borderBottomWidth: index === MENU_ITEMS.length - 1 ? 1 : 0,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
            </View>
            <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.more.quickFacts}</Text>
      <View style={styles.factsGrid}>
        {HEALTH_FACTS.map((fact, i) => (
          <View
            key={i}
            style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.factIconWrap, { backgroundColor: fact.color + "18" }]}>
              <Ionicons name={fact.icon} size={20} color={fact.color} />
            </View>
            <Text style={[styles.factText, { color: colors.foreground }]}>{fact.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.aboutCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="leaf" size={22} color={colors.primary} />
        <Text style={[styles.aboutTitle, { color: colors.foreground }]}>{t.more.about}</Text>
        <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>{t.more.aboutText}</Text>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>{t.more.version}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  menuList: { paddingHorizontal: 16, gap: 0 },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  factsGrid: { paddingHorizontal: 16, gap: 10 },
  factCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  factIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  factText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 20,
  },
  aboutCard: {
    margin: 16,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginTop: 24,
    alignItems: "center",
  },
  aboutTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  aboutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
