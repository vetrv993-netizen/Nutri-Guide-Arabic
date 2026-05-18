import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ENCYCLOPEDIA_DATA, NutrientInfo } from "@/data/encyclopediaData";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

function EncyclopediaCard({ item }: { item: NutrientInfo }) {
  const colors = useColors();
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  const toggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    height.value = withTiming(newExpanded ? 1 : 0, { duration: 300 });
    opacity.value = withTiming(newExpanded ? 1 : 0, { duration: 250 });
  };

  const animStyle = useAnimatedStyle(() => ({
    maxHeight: height.value === 1 ? 2000 : 0,
    opacity: opacity.value,
    overflow: "hidden",
  }));

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable onPress={toggle} style={styles.cardHeader}>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.cardShort, { color: colors.mutedForeground }]}>{item.shortDescription}</Text>
        </View>
        <View style={[styles.iconCircle, { backgroundColor: item.color + "20" }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
      </Pressable>

      <Animated.View style={animStyle}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.expandedContent}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>{t.encyclopedia.whatIsIt}</Text>
          <Text style={[styles.bodyText, { color: colors.foreground }]}>{item.importance}</Text>

          <Text style={[styles.sectionLabel, { color: "#10B981", marginTop: 12 }]}>{t.encyclopedia.benefits}</Text>
          {item.benefits.map((b, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.listText, { color: colors.foreground }]}>{b}</Text>
            </View>
          ))}

          <Text style={[styles.sectionLabel, { color: "#F59E0B", marginTop: 12 }]}>{t.encyclopedia.deficiencyRisks}</Text>
          {item.deficiencyRisks.map((r, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="warning-outline" size={14} color="#F59E0B" />
              <Text style={[styles.listText, { color: colors.foreground }]}>{r}</Text>
            </View>
          ))}

          <Text style={[styles.sectionLabel, { color: "#EF4444", marginTop: 12 }]}>{t.encyclopedia.excessRisks}</Text>
          {item.excessRisks.map((r, i) => (
            <View key={i} style={styles.listRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
              <Text style={[styles.listText, { color: colors.foreground }]}>{r}</Text>
            </View>
          ))}

          <Text style={[styles.sectionLabel, { color: "#60A5FA", marginTop: 12 }]}>{t.encyclopedia.foodSources}</Text>
          <View style={styles.foodSourcesRow}>
            {item.foodSources.map((f, i) => (
              <View key={i} style={[styles.sourceChip, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.sourceText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.dailyBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.dailyTitle, { color: colors.foreground }]}>{t.encyclopedia.dailyIntake}</Text>
            <Text style={[styles.dailyValue, { color: colors.primary }]}>{item.dailyIntake}</Text>
          </View>

          {item.detailedExplanation ? (
            <View style={[styles.detailBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>{item.detailedExplanation}</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

export default function EncyclopediaScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 16, paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="book" size={28} color={colors.primary} />
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>{t.encyclopedia.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t.encyclopedia.subtitle}</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>{t.encyclopedia.tapCard}</Text>
      </View>

      <View style={styles.list}>
        {ENCYCLOPEDIA_DATA.map(item => (
          <EncyclopediaCard key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "right" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right" },
  infoCard: { marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 10, alignItems: "center" },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row-reverse", alignItems: "center", padding: 16, gap: 12 },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  cardShort: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  divider: { height: 1 },
  expandedContent: { padding: 16, gap: 6 },
  sectionLabel: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "right" },
  bodyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
  listRow: { flexDirection: "row-reverse", gap: 8, alignItems: "flex-start", marginTop: 4 },
  listText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  foodSourcesRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, marginTop: 4 },
  sourceChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  sourceText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dailyBox: { flexDirection: "row-reverse", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 10 },
  dailyTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dailyValue: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "right" },
  detailBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  detailText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
});
