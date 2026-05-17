import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface NutritionBarProps {
  label: string;
  value: number;
  unit: string;
  dailyTarget: number;
  color?: string;
  compact?: boolean;
}

export function NutritionBar({ label, value, unit, dailyTarget, color, compact = false }: NutritionBarProps) {
  const colors = useColors();
  const pct = dailyTarget > 0 ? Math.min((value / dailyTarget) * 100, 100) : 0;
  const barColor = color || (pct > 100 ? colors.destructive : pct > 75 ? colors.warning : colors.primary);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(pct / 100, { duration: 800 });
  }, [pct]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={[styles.compactLabel, { color: colors.mutedForeground }]}>{label}</Text>
          <Text style={[styles.compactValue, { color: colors.foreground }]}>
            {value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}<Text style={[styles.compactUnit, { color: colors.mutedForeground }]}>{unit}</Text>
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: barColor }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.foreground }]}>
            {value < 1 && value > 0 ? value.toFixed(2) : value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}
          </Text>
          <Text style={[styles.unit, { color: colors.mutedForeground }]}> {unit}</Text>
          <Text style={[styles.pct, { color: pct > 100 ? colors.destructive : colors.mutedForeground }]}>
            {" "}({Math.round(pct)}%)
          </Text>
        </View>
      </View>
      <View style={[styles.track, styles.trackFull, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, borderBottomWidth: 1 },
  row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "right" },
  valueRow: { flexDirection: "row-reverse", alignItems: "baseline" },
  value: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  unit: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pct: { fontSize: 11, fontFamily: "Inter_400Regular" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  trackFull: { height: 8 },
  fill: { height: "100%", borderRadius: 3 },
  compactContainer: { gap: 4 },
  compactHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  compactLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  compactValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  compactUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
