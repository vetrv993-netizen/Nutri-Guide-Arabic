import { Ionicons } from "@expo/vector-icons";
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
import { DISEASE_GUIDES, DiseaseGuide } from "@/data/diseaseData";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

function DiseaseCard({ guide, onPress }: { guide: DiseaseGuide; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.diseaseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
      <View style={styles.diseaseInfo}>
        <Text style={[styles.diseaseName, { color: colors.foreground }]}>{guide.name}</Text>
        <Text style={[styles.diseaseDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{guide.description}</Text>
      </View>
      <View style={[styles.diseaseIcon, { backgroundColor: guide.color + "20" }]}>
        <Ionicons name={guide.icon as any} size={24} color={guide.color} />
      </View>
    </Pressable>
  );
}

function DiseaseDetail({ guide, onBack }: { guide: DiseaseGuide; onBack: () => void }) {
  const colors = useColors();
  const t = useTranslation();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.detailHeader, { backgroundColor: guide.color + "15" }]}>
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <View style={[styles.detailIconCircle, { backgroundColor: guide.color + "30" }]}>
          <Ionicons name={guide.icon as any} size={40} color={guide.color} />
        </View>
        <Text style={[styles.detailTitle, { color: colors.foreground }]}>{guide.name}</Text>
        <Text style={[styles.detailDesc, { color: colors.mutedForeground }]}>{guide.description}</Text>
      </View>

      <View style={styles.detailBody}>
        <View style={[styles.section, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: "#065F46" }]}>{t.diseaseGuide.recommended}</Text>
          </View>
          {guide.recommendedFoods.map((food, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="checkmark" size={14} color="#10B981" />
              <Text style={[styles.listText, { color: "#065F46" }]}>{food}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: "#7F1D1D" }]}>{t.diseaseGuide.avoid}</Text>
          </View>
          {guide.avoidFoods.map((food, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="close" size={14} color="#EF4444" />
              <Text style={[styles.listText, { color: "#7F1D1D" }]}>{food}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: "#1E3A8A" }]}>{t.diseaseGuide.tips}</Text>
          </View>
          {guide.nutritionTips.map((tip, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.tipNum, { color: "#3B82F6" }]}>{i + 1}.</Text>
              <Text style={[styles.listText, { color: "#1E3A8A" }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart-outline" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: "#78350F" }]}>{t.diseaseGuide.dailyLimits}</Text>
          </View>
          {guide.dailyLimits.map((limit, i) => (
            <View key={i} style={[styles.limitRow, { backgroundColor: "#FFFBEB" }]}>
              <Text style={[styles.limitReason, { color: "#92400E" }]}>{limit.reason}</Text>
              <View style={styles.limitInfo}>
                <Text style={[styles.limitValue, { color: "#D97706" }]}>{limit.limit}</Text>
                <Text style={[styles.limitNutrient, { color: "#78350F" }]}>{limit.nutrient}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#D97706" />
            <Text style={[styles.sectionTitle, { color: "#78350F" }]}>{t.diseaseGuide.warnings}</Text>
          </View>
          {guide.warnings.map((warning, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="warning-outline" size={14} color="#D97706" />
              <Text style={[styles.listText, { color: "#78350F" }]}>{warning}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.disclaimerCard, { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }]}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={[styles.disclaimerText, { color: "#6B7280" }]}>{t.diseaseGuide.disclaimer}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function DiseaseNutritionScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedGuide, setSelectedGuide] = useState<DiseaseGuide | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (selectedGuide) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background, paddingTop: topPadding }]}>
        <DiseaseDetail guide={selectedGuide} onBack={() => setSelectedGuide(null)} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>{t.diseaseGuide.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t.diseaseGuide.subtitle}</Text>
        </View>
      </View>

      <View style={[styles.alertCard, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
        <Ionicons name="warning-outline" size={18} color="#D97706" />
        <Text style={[styles.alertText, { color: "#92400E" }]}>{t.diseaseGuide.alert}</Text>
      </View>

      <View style={styles.list}>
        {DISEASE_GUIDES.map(guide => (
          <DiseaseCard key={guide.id} guide={guide} onPress={() => setSelectedGuide(guide)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "right" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  alertCard: { marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 10, alignItems: "center" },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  list: { paddingHorizontal: 16, gap: 10 },
  diseaseCard: { flexDirection: "row-reverse", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  diseaseIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  diseaseInfo: { flex: 1 },
  diseaseName: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  diseaseDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 3, lineHeight: 18 },
  detailHeader: { padding: 24, alignItems: "center", gap: 12 },
  detailIconCircle: { width: 70, height: 70, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  detailTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  detailDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  detailBody: { padding: 16, gap: 12 },
  section: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  sectionHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "right" },
  listRow: { flexDirection: "row-reverse", gap: 8, alignItems: "flex-start" },
  listText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  tipNum: { fontSize: 13, fontFamily: "Inter_700Bold", minWidth: 20, textAlign: "center" },
  limitRow: { padding: 10, borderRadius: 10, gap: 4 },
  limitInfo: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  limitNutrient: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right", flex: 1 },
  limitValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  limitReason: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  disclaimerCard: { padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: "row-reverse", gap: 10, alignItems: "flex-start" },
  disclaimerText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 18 },
});
