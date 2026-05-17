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

const DAILY_TARGETS = {
  calories: 2000, protein: 50, carbohydrates: 275, fat: 78,
  saturated_fat: 20, fiber: 28, sugar: 50, sodium: 2300,
  potassium: 4700, calcium: 1000, iron: 18, magnesium: 400,
  cholesterol: 300, vitamin_a: 900, vitamin_b12: 2.4, vitamin_c: 90,
  vitamin_d: 15, vitamin_e: 15,
};

export default function CalculatorScreen() {
  const colors = useColors();
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
    Alert.alert("تم الحفظ", "تم حفظ الوجبة بنجاح");
  };

  const handleClear = () => {
    Alert.alert("مسح الحاسبة", "هل تريد مسح جميع الأطعمة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "مسح", style: "destructive", onPress: () => { clearCalculator(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
    ]);
  };

  const CaloriesCircle = () => {
    const pct = Math.min((totals.calories / DAILY_TARGETS.calories) * 100, 100);
    return (
      <View style={[styles.caloriesCircle, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}>
        <Text style={[styles.calValue, { color: colors.primary }]}>{Math.round(totals.calories)}</Text>
        <Text style={[styles.calLabel, { color: colors.mutedForeground }]}>كالوري</Text>
        <Text style={[styles.calPct, { color: colors.mutedForeground }]}>{Math.round(pct)}% من الحد اليومي</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>الحاسبة الغذائية</Text>
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
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>الحاسبة فارغة</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>اضغط على + لإضافة أطعمة وحساب قيمتها الغذائية</Text>
          <Pressable onPress={() => setShowSearch(true)} style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={[styles.emptyBtnText, { color: "#fff" }]}>أضف طعاماً</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setActiveTab("nutrition")} style={[styles.tab, activeTab === "nutrition" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: activeTab === "nutrition" ? colors.primary : colors.mutedForeground }]}>التفاصيل الغذائية</Text>
            </Pressable>
            <Pressable onPress={() => setActiveTab("list")} style={[styles.tab, activeTab === "list" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
              <Text style={[styles.tabText, { color: activeTab === "list" ? colors.primary : colors.mutedForeground }]}>قائمة الأطعمة ({calculatorItems.length})</Text>
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
                      { label: "بروتين", value: totals.protein, unit: "غ", color: "#3B82F6" },
                      { label: "كارب", value: totals.carbohydrates, unit: "غ", color: "#F59E0B" },
                      { label: "دهون", value: totals.fat, unit: "غ", color: "#8B5CF6" },
                      { label: "ألياف", value: totals.fiber, unit: "غ", color: "#10B981" },
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
                />
              )}
            />
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 + insets.bottom }}>
              <View style={[styles.nutritionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <NutritionBar label="السعرات الحرارية" value={Math.round(totals.calories)} unit="كالوري" dailyTarget={DAILY_TARGETS.calories} color={colors.primary} />
                <NutritionBar label="البروتين" value={totals.protein} unit="غ" dailyTarget={DAILY_TARGETS.protein} color="#3B82F6" />
                <NutritionBar label="الكربوهيدرات" value={totals.carbohydrates} unit="غ" dailyTarget={DAILY_TARGETS.carbohydrates} color="#F59E0B" />
                <NutritionBar label="الدهون" value={totals.fat} unit="غ" dailyTarget={DAILY_TARGETS.fat} color="#8B5CF6" />
                <NutritionBar label="الدهون المشبعة" value={totals.saturated_fat} unit="غ" dailyTarget={DAILY_TARGETS.saturated_fat} color="#EC4899" />
                <NutritionBar label="الألياف" value={totals.fiber} unit="غ" dailyTarget={DAILY_TARGETS.fiber} color="#10B981" />
                <NutritionBar label="السكريات" value={totals.sugar} unit="غ" dailyTarget={DAILY_TARGETS.sugar} color="#F97316" />
                <NutritionBar label="الصوديوم" value={Math.round(totals.sodium)} unit="مغ" dailyTarget={DAILY_TARGETS.sodium} color="#06B6D4" />
                <NutritionBar label="البوتاسيوم" value={Math.round(totals.potassium)} unit="مغ" dailyTarget={DAILY_TARGETS.potassium} color="#84CC16" />
                <NutritionBar label="الكالسيوم" value={Math.round(totals.calcium)} unit="مغ" dailyTarget={DAILY_TARGETS.calcium} color="#A78BFA" />
                <NutritionBar label="الحديد" value={totals.iron} unit="مغ" dailyTarget={DAILY_TARGETS.iron} color="#F87171" />
                <NutritionBar label="الكوليسترول" value={Math.round(totals.cholesterol)} unit="مغ" dailyTarget={DAILY_TARGETS.cholesterol} color="#F43F5E" />
                <NutritionBar label="فيتامين ج" value={totals.vitamin_c} unit="مغ" dailyTarget={DAILY_TARGETS.vitamin_c} color="#FBBF24" />
                <NutritionBar label="فيتامين د" value={totals.vitamin_d} unit="ميكغ" dailyTarget={DAILY_TARGETS.vitamin_d} color="#FCD34D" />
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
            <Text style={[styles.saveTitle, { color: colors.foreground }]}>حفظ الوجبة</Text>
            <TextInput
              style={[styles.saveInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              placeholder="اسم الوجبة..."
              placeholderTextColor={colors.mutedForeground}
              value={mealName}
              onChangeText={setMealName}
              textAlign="right"
              autoFocus
            />
            <View style={styles.saveActions}>
              <Pressable onPress={() => setShowSaveModal(false)} style={[styles.saveBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.saveBtnText, { color: colors.foreground }]}>إلغاء</Text>
              </Pressable>
              <Pressable onPress={handleSaveMeal} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.saveBtnText, { color: "#fff" }]}>حفظ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CalculatorItemRow({ item, onRemove, onUpdateGrams, colors }: { item: CalculatorItem; onRemove: () => void; onUpdateGrams: (g: number) => void; colors: any }) {
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
        <Text style={[styles.foodCal, { color: colors.primary }]}>{cal} كالوري</Text>
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
              <Text style={[styles.gramsText, { color: colors.foreground }]}>{item.grams}غ</Text>
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
  calPct: { fontSize: 11, fontFamily: "Inter_400Regular" },
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
