import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { CATEGORIES, FoodItem, FOOD_DATABASE, searchFoods } from "@/data/foodDatabase";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

export default function SearchScreen() {
  const colors = useColors();
  const t = useTranslation();
  const { language } = useTheme();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useApp();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const results = query.trim() || selectedCategory !== "all"
    ? searchFoods(query, selectedCategory)
    : FOOD_DATABASE.slice(0, 50);

  const handleToggleFav = async (food: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite(food.id);
  };

  const getCategoryLabel = (key: string) => {
    const catKey = key as keyof typeof t.categories;
    return t.categories[catKey] ?? key;
  };

  const getFoodName = (item: FoodItem) =>
    language === "en" ? item.english_name : item.arabic_name;

  const getFoodCategory = (item: FoodItem) =>
    language === "en" ? item.category : item.category_arabic;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t.search.title}</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={t.search.placeholder}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            textAlign="right"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCategory(item.key); }}
              style={[styles.catChip, { backgroundColor: selectedCategory === item.key ? colors.primary : colors.muted, borderColor: selectedCategory === item.key ? colors.primary : colors.border }]}
            >
              <Text style={[styles.catText, { color: selectedCategory === item.key ? colors.primaryForeground : colors.foreground }]}>
                {getCategoryLabel(item.key)}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <Text style={[styles.count, { color: colors.mutedForeground }]}>{results.length} {t.search.foods}</Text>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/food-detail", params: { id: item.id } })}
            style={[styles.foodRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.foodLeft}>
              <Text style={[styles.foodName, { color: colors.foreground }]}>{getFoodName(item)}</Text>
              <Text style={[styles.foodSubtitle, { color: colors.mutedForeground }]}>
                {language === "en" ? item.arabic_name : item.english_name} · {getFoodCategory(item)}
              </Text>
              <View style={styles.macroRow}>
                <MacroBadge label={t.search.c} value={item.carbohydrates} color={colors.warning} unit={t.search.g} />
                <MacroBadge label={t.search.p} value={item.protein} color="#3B82F6" unit={t.search.g} />
                <MacroBadge label={t.search.f} value={item.fat} color="#8B5CF6" unit={t.search.g} />
              </View>
            </View>
            <View style={styles.foodRight}>
              <Pressable onPress={() => handleToggleFav(item)} style={styles.favBtn}>
                <Ionicons
                  name={isFavorite(item.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite(item.id) ? colors.destructive : colors.mutedForeground}
                />
              </Pressable>
              <Text style={[styles.calValue, { color: colors.primary }]}>{item.calories}</Text>
              <Text style={[styles.calUnit, { color: colors.mutedForeground }]}>{t.search.kcal}</Text>
              <Text style={[styles.calPer, { color: colors.mutedForeground }]}>{t.search.perHundredG}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.search.noResults}</Text>
          </View>
        }
      />
    </View>
  );
}

function MacroBadge({ label, value, color, unit }: { label: string; value: number; color: string; unit: string }) {
  return (
    <View style={[styles.macroBadge, { backgroundColor: color + "15" }]}>
      <Text style={[styles.macroBadgeText, { color }]}>{label}: {value.toFixed(1)}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8, gap: 12 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "right" },
  searchBox: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  catList: { gap: 8, paddingRight: 0 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", paddingHorizontal: 16, paddingBottom: 8 },
  foodRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  foodLeft: { flex: 1, gap: 4 },
  foodName: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  foodSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  macroRow: { flexDirection: "row-reverse", gap: 6, flexWrap: "wrap" },
  macroBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  macroBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  foodRight: { alignItems: "center", gap: 2, minWidth: 70 },
  favBtn: { padding: 4 },
  calValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  calUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  calPer: { fontSize: 10, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
