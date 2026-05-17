import translations from "@/constants/i18n";
import { useTheme } from "@/context/ThemeContext";

export function useTranslation() {
  const { language } = useTheme();
  return translations[language];
}
