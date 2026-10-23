// Theme Accent System for StudyMate LK
// Supports dynamic CSS variable injection, preset swatches, custom hex color picking, and persistent localStorage storage

export interface ThemeColorPreset {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const DEFAULT_THEME_COLOR = '#2563eb'; // Classic Sapphire Blue
export const THEME_STORAGE_KEY = 'studymate_theme_accent';

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: 'blue',
    name: 'Sapphire Blue',
    hex: '#2563eb',
    description: 'Classic focused academic blue (Default)'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    hex: '#059669',
    description: 'Calm, refreshing organic green'
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    hex: '#7c3aed',
    description: 'Deep, creative focus & intellect'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    hex: '#e11d48',
    description: 'Energetic, bold & high-contrast'
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    hex: '#d97706',
    description: 'Warm, motivating study energy'
  },
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    hex: '#0891b2',
    description: 'Crisp, modern scientific cyan'
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    hex: '#4f46e5',
    description: 'Sophisticated, quiet night study'
  },
  {
    id: 'teal',
    name: 'Teal Horizon',
    hex: '#0d9488',
    description: 'Balanced, soothing & tranquil'
  },
  {
    id: 'fuchsia',
    name: 'Vivid Fuchsia',
    hex: '#c026d3',
    description: 'Vibrant, lively & expressive'
  },
  {
    id: 'slate',
    name: 'Steel Slate',
    hex: '#475569',
    description: 'Minimalist, understated neutrality'
  }
];

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parses any 3 or 6 digit hex string into RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

/**
 * Converts RGB numbers to 6-character hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjusts brightness by percentage (-100 to +100)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 + percent / 100;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

/**
 * Computes high-contrast text color (white or dark slate) for a given background hex
 */
export function getContrastingTextColor(hex: string): '#ffffff' | '#0f172a' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Standard sRGB luminance calculation
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
}

/**
 * Formats user input into a valid 6-character hex code, or null if invalid
 */
export function sanitizeHex(hex: string): string | null {
  let clean = hex.trim();
  if (!clean.startsWith('#')) {
    clean = '#' + clean;
  }
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(clean)) {
    if (clean.length === 4) {
      // expand #rgb to #rrggbb
      return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`.toLowerCase();
    }
    return clean.toLowerCase();
  }
  return null;
}

/**
 * Applies the primary accent color across the entire application instantly using CSS variables
 */
export function applyThemeColor(hex: string, saveToStorage: boolean = true): boolean {
  const validHex = sanitizeHex(hex);
  if (!validHex) return false;

  const rgb = hexToRgb(validHex);
  if (!rgb) return false;

  if (typeof window === 'undefined') return true;

  const root = document.documentElement;

  // Compute complementary variations
  const hoverHex = adjustBrightness(validHex, -12); // ~12% darker on hover
  const activeHex = adjustBrightness(validHex, -22); // ~22% darker on active/click
  const lightBgLight = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
  const lightBgDark = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`;
  const lightBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;
  const glowShadow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
  const contrastText = getContrastingTextColor(validHex);

  // Set CSS custom variables on the root document
  root.style.setProperty('--primary', validHex);
  root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--primary-hover', hoverHex);
  root.style.setProperty('--primary-active', activeHex);
  root.style.setProperty('--primary-light', lightBgLight);
  root.style.setProperty('--primary-light-dark', lightBgDark);
  root.style.setProperty('--primary-light-border', lightBorder);
  root.style.setProperty('--primary-glow', glowShadow);
  root.style.setProperty('--primary-contrast', contrastText);

  // Also update <meta name="theme-color"> if present
  try {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', validHex);
    }
  } catch {
    // ignore
  }

  // Persist to localStorage
  if (saveToStorage) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validHex);
      window.dispatchEvent(new CustomEvent('studymate_theme_change', { detail: { hex: validHex } }));
    } catch {
      // storage unavailable
    }
  }

  return true;
}

/**
 * Retrieves the currently saved theme color or defaults to Sapphire Blue
 */
export function getSavedThemeColor(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_COLOR;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && sanitizeHex(saved)) {
      return sanitizeHex(saved)!;
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME_COLOR;
}

/**
 * Resets the theme accent color to default
 */
export function resetThemeColor(): string {
  applyThemeColor(DEFAULT_THEME_COLOR, true);
  return DEFAULT_THEME_COLOR;
}
