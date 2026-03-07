import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function ThemeInit(): null {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  return null;
}
