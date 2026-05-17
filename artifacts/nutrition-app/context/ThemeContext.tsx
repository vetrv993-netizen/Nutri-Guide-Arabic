import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert, Appearance, I18nManager } from "react-native";

import { Language } from "@/constants/i18n";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false,
  toggleTheme: async () => {},
  language: "ar",
  setLanguage: async () => {},
  isRTL: true,
  isReady: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [language, setLanguageState] = useState<Language>("ar");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedTheme, savedLang] = await Promise.all([
        AsyncStorage.getItem("appTheme"),
        AsyncStorage.getItem("appLanguage"),
      ]);
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        const sys = Appearance.getColorScheme();
        setTheme(sys === "dark" ? "dark" : "light");
      }
      if (savedLang === "ar" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch {}
    setIsReady(true);
  };

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(next);
    await AsyncStorage.setItem("appTheme", next);
  }, [theme]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("appLanguage", lang);
    const shouldRTL = lang === "ar";
    if (I18nManager.isRTL !== shouldRTL) {
      I18nManager.forceRTL(shouldRTL);
      Alert.alert(
        lang === "ar" ? "تغيير اللغة" : "Language Changed",
        lang === "ar"
          ? "أعد تشغيل التطبيق لتطبيق اتجاه اللغة بالكامل"
          : "Please restart the app to fully apply the language direction.",
        [{ text: lang === "ar" ? "موافق" : "OK" }]
      );
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        language,
        setLanguage,
        isRTL: language === "ar",
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
