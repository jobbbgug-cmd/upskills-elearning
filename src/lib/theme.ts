export type Theme = 'default' | 'pastel-pink' | 'pastel-blue' | 'pastel-green' | 'pastel-purple' | 'pastel-orange';

export const THEMES: Record<Theme, { name: string; primary: string; accent: string; className: string }> = {
  default: {
    name: 'Default',
    primary: '#7c3aed',
    accent: '#6d28d9',
    className: 'theme-default',
  },
  'pastel-pink': {
    name: 'Pastel Pink',
    primary: '#f9a8d4',
    accent: '#f472b6',
    className: 'theme-pastel-pink',
  },
  'pastel-blue': {
    name: 'Pastel Blue',
    primary: '#a5d8ff',
    accent: '#7dd3fc',
    className: 'theme-pastel-blue',
  },
  'pastel-green': {
    name: 'Pastel Green',
    primary: '#bfdbfe',
    accent: '#86efac',
    className: 'theme-pastel-green',
  },
  'pastel-purple': {
    name: 'Pastel Purple',
    primary: '#d8b4fe',
    accent: '#c084fc',
    className: 'theme-pastel-purple',
  },
  'pastel-orange': {
    name: 'Pastel Orange',
    primary: '#fed7aa',
    accent: '#fdba74',
    className: 'theme-pastel-orange',
  },
};

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 58, 237';
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const colors = THEMES[theme];
  document.documentElement.style.setProperty('--color-primary', colors.primary);
  document.documentElement.style.setProperty('--color-accent', colors.accent);
  document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(colors.primary));
  document.documentElement.classList.remove(
    'theme-default',
    'theme-pastel-pink',
    'theme-pastel-blue',
    'theme-pastel-green',
    'theme-pastel-purple',
    'theme-pastel-orange'
  );
  document.documentElement.classList.add(colors.className);
};

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem('theme') as Theme;
  return stored || 'default';
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};
