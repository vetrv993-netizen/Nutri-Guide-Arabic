import colors from "@/constants/colors";

/**
 * Always returns the light palette for a clean, bright app experience.
 */
export function useColors() {
  return { ...colors.light, radius: colors.radius };
}
