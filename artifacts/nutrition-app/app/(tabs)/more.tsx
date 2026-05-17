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

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "bmi", title: "حاسبة مؤشر كتلة الجسم", subtitle: "احسب BMI والوزن المثالي", icon: "body-outline", color: "#3B82F6", route: "/bmi" },
  { id: "req", title: "الاحتياجات اليومية", subtitle: "سعرات، بروتين، ماء، ألياف", icon: "nutrition-outline", color: "#10B981", route: "/daily-requirements" },
  { id: "burn", title: "حاسبة حرق السعرات", subtitle: "المشي، الجري، السباحة وأكثر", icon: "flame-outline", color: "#EF4444", route: "/calorie-burn" },
  { id: "disease", title: "دليل التغذية الطبية", subtitle: "سكري، ضغط، كلى، قلب", icon: "medkit-outline", color: "#8B5CF6", route: "/disease-nutrition" },
  { id: "saved", title: "وجباتي المحفوظة", subtitle: "وجباتك وحساباتك السابقة", icon: "bookmark-outline", color: "#F59E0B", route: "/saved-meals" },
  { id: "favorites", title: "الأطعمة المفضلة", subtitle: "قائمة أطعمتك المفضلة", icon: "heart-outline", color: "#F43F5E", route: "/favorites" },
];

const HEALTH_FACTS = [
  { icon: "water-outline" as const, text: "اشرب 8 أكواس ماء يومياً على الأقل", color: "#60A5FA" },
  { icon: "leaf-outline" as const, text: "الخضروات والفواكه يجب أن تملأ نصف طبقك", color: "#4ADE80" },
  { icon: "walk-outline" as const, text: "30 دقيقة مشي يومياً تحرق 150 سعرة", color: "#FB923C" },
  { icon: "moon-outline" as const, text: "النوم الكافي (7-9 ساعات) يساعد في إدارة الوزن", color: "#A78BFA" },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>المزيد</Text>

      <View style={styles.menuList}>
        {MENU_ITEMS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(item.route as any); }}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
            </View>
            <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>حقائق صحية سريعة</Text>
      <View style={styles.factsGrid}>
        {HEALTH_FACTS.map((fact, i) => (
          <View key={i} style={[styles.factCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={fact.icon} size={24} color={fact.color} />
            <Text style={[styles.factText, { color: colors.foreground }]}>{fact.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.aboutCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Text style={[styles.aboutTitle, { color: colors.foreground }]}>الحاسبة الغذائية الذكية</Text>
        <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
          تطبيق عربي شامل للتغذية والصحة. جميع البيانات للأغراض التعليمية فقط. استشر طبيبك أو أخصائي التغذية للحصول على نصائح شخصية.
        </Text>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>الإصدار 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "right", paddingHorizontal: 20, marginBottom: 16 },
  menuList: { paddingHorizontal: 16, gap: 10 },
  menuItem: { flexDirection: "row-reverse", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  menuIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right", marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  factsGrid: { paddingHorizontal: 16, gap: 10 },
  factCard: { flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  factText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  aboutCard: { margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, gap: 8, marginTop: 24 },
  aboutTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  aboutText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
