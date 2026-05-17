import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { FOOD_DATABASE } from "@/data/foodDatabase";
import { useColors } from "@/hooks/useColors";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteFoods, toggleFavorite } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const foods = FOOD_DATABASE.filter(f => favoriteFoods.includes(f.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>الأطعمة المفضلة</Text>
      </View>
      <FlatList
        data={foods}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد مفضلات</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>اضغط على قلب أي طعام في صفحة البحث لإضافته</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/food-detail", params: { id: item.id } })}
            style={[styles.foodRow, { borderBottomColor: colors.border }]}
          >
            <Pressable onPress={async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); await toggleFavorite(item.id); }} style={styles.heartBtn}>
              <Ionicons name="heart" size={22} color={colors.destructive} />
            </Pressable>
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: colors.foreground }]}>{item.arabic_name}</Text>
              <Text style={[styles.foodSub, { color: colors.mutedForeground }]}>{item.english_name} · {item.category_arabic}</Text>
            </View>
            <View style={styles.calInfo}>
              <Text style={[styles.calValue, { color: colors.primary }]}>{item.calories}</Text>
              <Text style={[styles.calUnit, { color: colors.mutedForeground }]}>كالوري/100غ</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1, textAlign: "right" },
  empty: { paddingTop: 80, alignItems: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  foodRow: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  heartBtn: { padding: 4 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  foodSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  calInfo: { alignItems: "center" },
  calValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  calUnit: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
