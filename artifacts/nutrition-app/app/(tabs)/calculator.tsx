import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NutritionBar } from "@/components/NutritionBar";
import { SearchFoodModal } from "@/components/SearchFoodModal";
import { CalculatorItem, useApp } from "@/context/AppContext";
import { FoodItem } from "@/data/foodDatabase";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

const DAILY_TARGETS = {
  calories: 2000, protein: 50, carbohydrates: 275, fat: 78,
  saturated_fat: 20, fiber: 28, sugar: 50, sodium: 2300,
  potassium: 4700, calcium: 1000, iron: 18, magnesium: 400,
  cholesterol: 300, vitamin_a: 900, vitamin_b12: 2.4, vitamin_c: 90,
  vitamin_d: 15, vitamin_e: 15,
};

export default function CalculatorScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { calculatorItems, addToCalculator, removeFromCalculator, updateGrams, clearCalculator, saveMeal, getNutritionTotals } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "nutrition">("list");
  const totals = getNutritionTotals();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleSelectFood = (food: FoodItem, grams: number) => {
    addToCalculator(food, grams);
    setShowSearch(false);
  };

  const handleSaveMeal = async () => {
    if (!mealName.trim()) return;
    await saveMeal(mealName.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSaveModal(false);
    setMealName("");
    Alert.alert(t.calculator.saved, t.calculator.savedMsg);
  };

  const handleClear = () => {
    Alert.alert(t.calculator.clearAll, t.calculator.clearConfirm, [
      { text: t.calculator.cancel, style: "cancel" },
      { text: t.calculator.clear, style: "destructive", onPress: () => { clearCalculator(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
    ]);
  };

  const CaloriesCircle = () => {
    const pct = Math.min((totals.calories / DAILY_TARGETS.calories) * 100, 100);
    return (
      <View style={[styles.caloriesCircle, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}>
        <Text style={[styles.calValue, { color: colors.primary }]}>{Math.round(totals.calories)}</Text>
        <Text style={[styles.calLabel, { color: colors.mutedForeground }]}>{t.calculator.kcal}</Text>
        <Text style={[styles.calPct, { color: colors.mutedForeground }]}>{Math.round(pct)}% {t.calculator.ofDailyLimit}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t.calculator.title}</Text>
        <View style={styles.headerActions}>
          {calculatorItems.length > 0 && (
            <>
              <Pressable onPress={handleClear} style={[styles.headerBtn, { backgroundColor: colors.destructive + "15" }]}>
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </Pressable>
              <Pressable onPress={() => setShowSaveModal(true)} style={[styles.headerBtn, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
              </Pressable>
            </>
          )}
          <Pressable onPress={() => setShowSearch(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {calculatorItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.calculator.empty}</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.calculator.emptyText}</Text>
          <Pressable onPress={() => setShowSearch(true)} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={[styles.emptyBtnText, { color: "#fff" }]}>{t.calculator.addFood}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setActiveTab("nutrition")} style={[styles.tab, activeTab === "nutrition" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: activeTab === "nutrition" ? colors.primary : colors.mutedForeground }]}>{t.calculator.nutritionTab}</Text>
            </Pressable>
            <Pressable onPress={() => setActiveTab("list")} style={[styles.tab, activeTab === "list" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: activeTab === "list" ? colors.primary : colors.mutedForeground }]}>{t.calculator.foodListTab} ({calculatorItems.length})</Text>
            </Pressable>
          </View>

          {activeTab === "list" ? (
            <FlatList
              data={calculatorItems}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
              ListHeaderComponent={
                <View style={styles.macroSummary}>
                  <CaloriesCircle />
                  <View style={styles.macroRow}>
                    {[
                      { label: t.calculator.protein, value: totals.protein, unit: t.calculator.g, color: "#3B82F6" },
                      { label: t.calculator.carbs, value: totals.carbohydrates, unit: t.calculator.g, color: "#F59E0B" },
                      { label: t.calculator.fat, value: totals.fat, unit: t.calculator.g, color: "#8B5CF6" },
                      { label: t.calculator.fiber, value: totals.fiber, unit: t.calculator.g, color: "#10B981" },
                    ].map(m => (
                      <View key={m.label} style={[styles.macroItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.macroValue, { color: m.color }]}>{m.value.toFixed(1)}</Text>
                        <Text style={[styles.macroUnit, { color: colors.mutedForeground }]}>{m.unit}</Text>
                        <Text style={[styles.macroLabel, { color: colors.foreground }]}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <CalculatorItemRow
                  item={item}
                  onRemove={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeFromCalculator(item.id); }}
                  onUpdateGrams={(g) => updateGrams(item.id, g)}
                  colors={colors}
                  kcalLabel={t.calculator.kcal}
                  gLabel={t.calculator.g}
                />
              )}
            />
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 + insets.bottom }}>
              <View style={[styles.nutritionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <NutritionBar label={t.nutrients.calories} value={Math.round(totals.calories)} unit={t.nutrients.kcal} dailyTarget={DAILY_TARGETS.calories} color={colors.primary} />
                <NutritionBar label={t.nutrients.protein} value={totals.protein} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.protein} color="#3B82F6" />
                <NutritionBar label={t.nutrients.carbohydrates} value={totals.carbohydrates} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.carbohydrates} color="#F59E0B" />
                <NutritionBar label={t.nutrients.fat} value={totals.fat} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.fat} color="#8B5CF6" />
                <NutritionBar label={t.nutrients.saturated_fat} value={totals.saturated_fat} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.saturated_fat} color="#EC4899" />
                <NutritionBar label={t.nutrients.fiber} value={totals.fiber} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.fiber} color="#10B981" />
                <NutritionBar label={t.nutrients.sugar} value={totals.sugar} unit={t.nutrients.g} dailyTarget={DAILY_TARGETS.sugar} color="#F97316" />
                <NutritionBar label={t.nutrients.sodium} value={Math.round(totals.sodium)} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.sodium} color="#06B6D4" />
                <NutritionBar label={t.nutrients.potassium} value={Math.round(totals.potassium)} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.potassium} color="#84CC16" />
                <NutritionBar label={t.nutrients.calcium} value={Math.round(totals.calcium)} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.calcium} color="#A78BFA" />
                <NutritionBar label={t.nutrients.iron} value={totals.iron} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.iron} color="#F87171" />
                <NutritionBar label={t.nutrients.cholesterol} value={Math.round(totals.cholesterol)} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.cholesterol} color="#F43F5E" />
                <NutritionBar label={t.nutrients.vitamin_c} value={totals.vitamin_c} unit={t.nutrients.mg} dailyTarget={DAILY_TARGETS.vitamin_c} color="#FBBF24" />
                <NutritionBar label={t.nutrients.vitamin_d} value={totals.vitamin_d} unit={t.nutrients.mcg} dailyTarget={DAILY_TARGETS.vitamin_d} color="#FCD34D" />
              </View>
            </ScrollView>
          )}
        </>
      )}

      <SearchFoodModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectFood={handleSelectFood}
      />

      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.saveModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.saveTitle, { color: colors.foreground }]}>{t.calculator.saveMeal}</Text>
            <TextInput
              style={[styles.saveInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder={t.calculator.mealName}
              placeholderTextColor={colors.mutedForeground}
              value={mealName}
              onChangeText={setMealName}
              textAlign="right"
              autoFocus
            />
            <View style={styles.saveActions}>
              <Pressable onPress={() => setShowSaveModal(false)} style={[styles.saveBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.saveBtnText, { color: colors.foreground }]}>{t.calculator.cancel}</Text>
              </Pressable>
              <Pressable onPress={handleSaveMeal} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.saveBtnText, { color: "#fff" }]}>{t.calculator.save}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CalculatorItemRow({ item, onRemove, onUpdateGrams, colors, kcalLabel, gLabel }: { item: CalculatorItem; onRemove: () => void; onUpdateGrams: (g: number) => void; colors: any; kcalLabel: string; gLabel: string }) {
  const [editing, setEditing] = useState(false);
  const [tempGrams, setTempGrams] = useState(item.grams.toString());
  const cal = (item.food.calories * item.grams / 100).toFixed(0);

  const handleGramsBlur = () => {
    const g = parseFloat(tempGrams) || 100;
    onUpdateGrams(g);
    setEditing(false);
  };

  return (
    <View style={[styles.foodRow, { borderBottomColor: colors.border }]}>
      <View style={styles.foodInfo}>
        <Text style={[styles.foodName, { color: colors.foreground }]}>{item.food.arabic_name}</Text>
        <Text style={[styles.foodCal, { color: colors.primary }]}>{cal} {kcalLabel}</Text>
      </View>
      <View style={styles.foodControls}>
        <Pressable onPress={onRemove} style={[styles.removeBtn, { backgroundColor: colors.destructive + "15" }]}>
          <Ionicons name="close" size={14} color={colors.destructive} />
        </Pressable>
        <Pressable onPress={() => { setEditing(true); setTempGrams(item.grams.toString()); }}>
          {editing ? (
            <TextInput
              style={[styles.gramsInput, { backgroundColor: colors.muted, color: colors.foreground }]}
              value={tempGrams}
              onChangeText={setTempGrams}
              onBlur={handleGramsBlur}
              keyboardType="numeric"
              textAlign="center"
              autoFocus
            />
          ) : (
            <View style={[styles.gramsDisplay, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.gramsText, { color: colors.foreground }]}>{item.grams}{gLabel}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "right" },
  headerActions: { flexDirection: "row-reverse", gap: 8, alignItems: "center" },
  headerBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  tabs: { flexDirection: "row-reverse", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  macroSummary: { padding: 16, gap: 12 },
  caloriesCircle: { alignSelf: "center", alignItems: "center", justifyContent: "center", width: 150, height: 150, borderRadius: 75, borderWidth: 3, gap: 4 },
  calValue: { fontSize: 36, fontFamily: "Inter_700Bold" },
  calLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  calPct: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 4 },
  macroRow: { flexDirection: "row-reverse", gap: 8 },
  macroItem: { flex: 1, alignItems: "center", padding: 10, borderRadius: 12, borderWidth: 1, gap: 2 },
  macroValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  macroUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  macroLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  foodRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  foodInfo: { flex: 1, gap: 3 },
  foodName: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "right" },
  foodCal: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  foodControls: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  gramsInput: { width: 70, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, fontSize: 14, fontFamily: "Inter_500Medium" },
  gramsDisplay: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  gramsText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  nutritionCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 4, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: "#00000080", alignItems: "center", justifyContent: "center" },
  saveModal: { width: "85%", padding: 24, borderRadius: 20, gap: 16 },
  saveTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  saveInput: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1 },
  saveActions: { flexDirection: "row-reverse", gap: 12 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
