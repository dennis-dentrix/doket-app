import useThemeStore from '../store/themeStore';
import { typography, spacing, radius, shadows } from '../utils/theme';

export default function useTheme() {
  const { colors, isDark, themeMode, toggleDark, setThemeMode } = useThemeStore();
  return { colors, isDark, themeMode, toggleDark, setThemeMode, typography, spacing, radius, shadows };
}
