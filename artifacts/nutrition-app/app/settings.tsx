import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsScreen() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme, language, setLanguage } = useTheme();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleToggleTheme = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleTheme();
  };

  const handleLanguage = async (lang: "ar" | "en") => {
    if (lang === language) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguage(lang);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
  );

  const Row = ({
    icon,
    label,
    sublabel,
    right,
    onPress,
    iconBg,
    iconColor,
    isLast,
  }: {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    iconBg: string;
    iconColor: string;
    isLast?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        { borderBottomColor: isLast ? "transparent" : colors.border },
      ]}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPadding + 8, paddingBottom: 60 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.muted }]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>{t.settings.title}</Text>
      </View>

      {/* Appearance */}
      <SectionHeader title={t.settings.appearance} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row
          iconBg={isDark ? "#6366F120" : "#F59E0B20"}
          iconColor={isDark ? "#818CF8" : "#F59E0B"}
          icon={
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={20}
              color={isDark ? "#818CF8" : "#F59E0B"}
            />
          }
          label={isDark ? t.settings.darkMode : t.settings.lightMode}
          sublabel={isDark ? t.settings.darkModeDesc : t.settings.lightModeDesc}
          isLast
          right={
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={isDark ? colors.primary : "#FFFFFF"}
            />
          }
        />
      </View>

      {/* Language */}
      <SectionHeader title={t.settings.language} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.langRow}>
          <Pressable
            onPress={() => handleLanguage("ar")}
            style={[
              styles.langBtn,
              {
                backgroundColor: language === "ar" ? colors.primary : colors.muted,
                borderColor: language === "ar" ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.langBtnText, { color: language === "ar" ? "#fff" : colors.foreground }]}>
              {t.settings.arabic}
            </Text>
            {language === "ar" && (
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            )}
          </Pressable>
          <Pressable
            onPress={() => handleLanguage("en")}
            style={[
              styles.langBtn,
              {
                backgroundColor: language === "en" ? colors.primary : colors.muted,
                borderColor: language === "en" ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.langBtnText, { color: language === "en" ? "#fff" : colors.foreground }]}>
              {t.settings.english}
            </Text>
            {language === "en" && (
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
            )}
          </Pressable>
        </View>
        <View style={[styles.noteRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            {t.settings.restartNote}
          </Text>
        </View>
      </View>

      {/* About Developer */}
      <SectionHeader title={t.settings.aboutDev} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Dev Name */}
        <Row
          iconBg="#22C55E20"
          iconColor="#22C55E"
          icon={<Ionicons name="person" size={20} color="#22C55E" />}
          label={t.settings.devName}
          sublabel={t.settings.developer}
          isLast={false}
        />
        {/* Phone */}
        <Row
          iconBg="#0EA5E920"
          iconColor="#0EA5E9"
          icon={<Feather name="phone" size={18} color="#0EA5E9" />}
          label="770464353"
          sublabel={t.settings.phone}
          isLast={false}
          onPress={() => Linking.openURL("tel:770464353")}
          right={
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
          }
        />
        {/* Email */}
        <Row
          iconBg="#F59E0B20"
          iconColor="#F59E0B"
          icon={<Feather name="mail" size={18} color="#F59E0B" />}
          label="vetrv993@gmail.com"
          sublabel={t.settings.email}
          isLast
          onPress={() => Linking.openURL("mailto:vetrv993@gmail.com")}
          right={
            <Ionicons name="chevron-back" size={16} color={colors.mutedForeground} />
          }
        />
      </View>

      {/* App Info */}
      <SectionHeader title={t.settings.appInfo} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.appInfoRow}>
          <View style={[styles.appIconCircle, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="leaf" size={28} color={colors.primary} />
          </View>
          <View style={styles.appInfoText}>
            <Text style={[styles.appInfoName, { color: colors.foreground }]}>
              {t.settings.appName}
            </Text>
            <Text style={[styles.appInfoVersion, { color: colors.primary }]}>
              {t.settings.appVersion}
            </Text>
            <Text style={[styles.appInfoDesc, { color: colors.mutedForeground }]}>
              {t.settings.appDesc}
            </Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesRow}>
        <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="wifi-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Offline</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Private</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Secure</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", flex: 1, textAlign: "right" },
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "right" },
  rowSublabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 1 },
  langRow: { flexDirection: "row-reverse", gap: 10, padding: 14 },
  langBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  langBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  noteRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  noteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  appInfoRow: { flexDirection: "row-reverse", alignItems: "center", gap: 14, padding: 16 },
  appIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  appInfoText: { flex: 1, gap: 3 },
  appInfoName: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "right" },
  appInfoVersion: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  appInfoDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
