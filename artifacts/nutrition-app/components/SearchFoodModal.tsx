import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES, FoodItem, searchFoods } from "@/data/foodDatabase";
import { useColors } from "@/hooks/useColors";

interface SearchFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem, grams: number) => void;
}

export function SearchFoodModal({ visible, onClose, onSelectFood }: SearchFoodModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");

  const results = searchFoods(query, selectedCategory);

  const handleSelectFood = useCallback((food: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFood(food);
    setGrams("100");
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedFood) return;
    const g = parseFloat(grams) || 100;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectFood(selectedFood, g);
    setSelectedFood(null);
    setQuery("");
    setGrams("100");
    onClose();
  }, [selectedFood, grams, onSelectFood, onClose]);

  const handleClose = () => {
    setSelectedFood(null);
    setQuery("");
    setGrams("100");
    onClose();
  };

  const calcCalories = () => {
    if (!selectedFood) return 0;
    return ((selectedFood.calories * parseFloat(grams || "0")) / 100).toFixed(0);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>البحث عن طعام</Text>
          <View style={{ width: 36 }} />
        </View>

        {selectedFood ? (
          <View style={styles.foodDetail}>
            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailName, { color: colors.foreground }]}>{selectedFood.arabic_name}</Text>
              <Text style={[styles.detailEnName, { color: colors.mutedForeground }]}>{selectedFood.english_name}</Text>

              <View style={styles.gramsRow}>
                <Text style={[styles.gramsLabel, { color: colors.foreground }]}>الكمية (غرام)</Text>
                <TextInput
                  style={[styles.gramsInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  value={grams}
                  onChangeText={setGrams}
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>

              <View style={[styles.previewRow, { backgroundColor: colors.secondary, borderRadius: 10 }]}>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewValue, { color: colors.primary }]}>{calcCalories()}</Text>
                  <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>كالوري</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewValue, { color: colors.info }]}>{((selectedFood.protein * parseFloat(grams || "0")) / 100).toFixed(1)}</Text>
                  <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>بروتين</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewValue, { color: colors.warning }]}>{((selectedFood.carbohydrates * parseFloat(grams || "0")) / 100).toFixed(1)}</Text>
                  <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>كارب</Text>
                </View>
                <View style={styles.previewItem}>
                  <Text style={[styles.previewValue, { color: "#A855F7" }]}>{((selectedFood.fat * parseFloat(grams || "0")) / 100).toFixed(1)}</Text>
                  <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>دهون</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailActions}>
              <Pressable onPress={() => setSelectedFood(null)} style={[styles.btn, { backgroundColor: colors.muted, flex: 1 }]}>
                <Text style={[styles.btnText, { color: colors.foreground }]}>رجوع</Text>
              </Pressable>
              <Pressable onPress={handleAdd} style={[styles.btn, { backgroundColor: colors.primary, flex: 2 }]}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={[styles.btnText, { color: "#fff" }]}>إضافة للحاسبة</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.mutedForeground} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="ابحث عن طعام..."
                placeholderTextColor={colors.mutedForeground}
                value={query}
                onChangeText={setQuery}
                textAlign="right"
                autoFocus
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={item => item.key}
              contentContainerStyle={styles.catList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedCategory(item.key)}
                  style={[styles.catChip, { backgroundColor: selectedCategory === item.key ? colors.primary : colors.muted }]}
                >
                  <Text style={[styles.catText, { color: selectedCategory === item.key ? colors.primaryForeground : colors.foreground }]}>
                    {item.arabic}
                  </Text>
                </Pressable>
              )}
            />

            <FlatList
              data={results}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectFood(item)}
                  style={[styles.foodRow, { borderBottomColor: colors.border }]}
                >
                  <View>
                    <Text style={[styles.foodName, { color: colors.foreground }]}>{item.arabic_name}</Text>
                    <Text style={[styles.foodEnName, { color: colors.mutedForeground }]}>{item.english_name} · {item.category_arabic}</Text>
                  </View>
                  <View style={styles.foodMeta}>
                    <Text style={[styles.foodCal, { color: colors.primary }]}>{item.calories}</Text>
                    <Text style={[styles.foodCalLabel, { color: colors.mutedForeground }]}>كالوري/100غ</Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد نتائج</Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  closeBtn: { padding: 6 },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  searchBox: { flexDirection: "row-reverse", alignItems: "center", margin: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "#f0f0f0" },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  catList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  foodRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  foodName: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "right" },
  foodEnName: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  foodMeta: { alignItems: "center" },
  foodCal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  foodCalLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  foodDetail: { flex: 1, padding: 16, gap: 16 },
  detailCard: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 16 },
  detailName: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  detailEnName: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: -10 },
  gramsRow: { gap: 8 },
  gramsLabel: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "center" },
  gramsInput: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, fontSize: 22, fontFamily: "Inter_700Bold", borderWidth: 1 },
  previewRow: { flexDirection: "row-reverse", justifyContent: "space-around", padding: 16 },
  previewItem: { alignItems: "center", gap: 4 },
  previewValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  previewLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  detailActions: { flexDirection: "row-reverse", gap: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 12 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
