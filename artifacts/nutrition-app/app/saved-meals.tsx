import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SavedMeal, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SavedMealsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedMeals, deleteMeal } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleDelete = (meal: SavedMeal) => {
    Alert.alert("حذف الوجبة", `هل تريد حذف "${meal.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف", style: "destructive", onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteMeal(meal.id);
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>الوجبات المحفوظة</Text>
      </View>

      <FlatList
        data={savedMeals}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom, gap: 10 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد وجبات محفوظة</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>أضف وجبات من حاسبة التغذية وادخرها هنا</Text>
            <Pressable onPress={() => router.push("/calculator" as any)} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.emptyBtnText, { color: "#fff" }]}>الذهاب للحاسبة</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable onPress={() => setExpanded(expanded === item.id ? null : item.id)} style={styles.mealHeader}>
              <Ionicons name={expanded === item.id ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              <View style={styles.mealMeta}>
                <Text style={[styles.mealName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.mealDate, { color: colors.mutedForeground }]}>{item.date} · {item.items.length} عنصر</Text>
              </View>
              <View style={[styles.calBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.calBadgeText, { color: colors.primary }]}>{item.totalCalories}</Text>
                <Text style={[styles.calBadgeUnit, { color: colors.mutedForeground }]}>كالوري</Text>
              </View>
            </Pressable>

            {/* Macros */}
            <View style={styles.macroRow}>
              <MacroBadge label="ب" value={item.totalProtein} unit="غ" color="#3B82F6" />
              <MacroBadge label="ك" value={item.totalCarbs} unit="غ" color="#F59E0B" />
              <MacroBadge label="د" value={item.totalFat} unit="غ" color="#8B5CF6" />
            </View>

            {/* Items list (expanded) */}
            {expanded === item.id && (
              <View style={[styles.expandedItems, { borderTopColor: colors.border }]}>
                {item.items.map((ci, idx) => (
                  <View key={idx} style={styles.foodItemRow}>
                    <Text style={[styles.foodItemCal, { color: colors.primary }]}>{((ci.food.calories * ci.grams) / 100).toFixed(0)} كالوري</Text>
                    <Text style={[styles.foodItemGrams, { color: colors.mutedForeground }]}>{ci.grams}غ</Text>
                    <Text style={[styles.foodItemName, { color: colors.foreground }]}>{ci.food.arabic_name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={[styles.mealActions, { borderTopColor: colors.border }]}>
              <Pressable onPress={() => handleDelete(item)} style={[styles.actionBtn, { backgroundColor: colors.destructive + "15" }]}>
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                <Text style={[styles.actionText, { color: colors.destructive }]}>حذف</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function MacroBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.macroBadge, { backgroundColor: color + "15" }]}>
      <Text style={[styles.macroBadgeText, { color }]}>{label}: {value}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "right", flex: 1 },
  empty: { paddingTop: 80, alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", color: "#6B7280" },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  mealCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  mealHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 10, padding: 14 },
  mealMeta: { flex: 1 },
  mealName: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  mealDate: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  calBadge: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  calBadgeText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  calBadgeUnit: { fontSize: 10, fontFamily: "Inter_400Regular" },
  macroRow: { flexDirection: "row-reverse", gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  macroBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  macroBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  expandedItems: { borderTopWidth: 1, padding: 14, gap: 8 },
  foodItemRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  foodItemName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  foodItemGrams: { fontSize: 12, fontFamily: "Inter_400Regular" },
  foodItemCal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  mealActions: { flexDirection: "row-reverse", borderTopWidth: 1, padding: 10, gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
