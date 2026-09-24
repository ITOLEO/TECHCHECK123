import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'techcheck_theme';

/**
 * Validates a theme string safely.
 */
export function isValidTheme(val: unknown): val is Theme {
  return val === 'light' || val === 'dark';
}

/**
 * Reads the system preference safely.
 */
export function getSystemPreference(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Reads the stored theme following the exact priority rules:
 * 1. Explicitly saved valid user theme ('light' | 'dark')
 * 2. System preference ('prefers-color-scheme: dark')
 * 3. Default application theme ('light')
 *
 * If an invalid value is in localStorage, cleans it up and safely recovers.
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw !== null) {
      if (isValidTheme(raw)) {
        return raw;
      }
      // Invalid value found in localStorage -> safely recover and remove corrupted entry
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    return getSystemPreference();
  } catch {
    return getSystemPreference();
  }
}

/**
 * Applies the given theme to the DOM (HTML root and body).
 * Keeps classes, dataset attributes, and colorScheme in sync without duplicates or conflicts.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    if (body) {
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    if (body) {
      body.classList.remove('dark');
      body.setAttribute('data-theme', 'light');
    }
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage quota or security errors
  }
}

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = getStoredTheme();
    // Synchronize immediately to prevent flash
    applyTheme(initial);
    return initial;
  });

  // Keep DOM and localStorage synchronized whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system preference changes ONLY IF user hasn't explicitly set a theme in localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        // Only adapt to system preference if user has never manually saved a preference
        if (!saved || !isValidTheme(saved)) {
          const sysTheme: Theme = e.matches ? 'dark' : 'light';
          setThemeState(sysTheme);
          applyTheme(sysTheme);
        }
      } catch {
        // ignore
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isValidTheme(e.newValue)) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!isValidTheme(newTheme)) return;
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook:
 * Single source of truth for the active theme state and toggle actions across the entire app.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  // Fallback for standalone/test environments without crashing
  const fallbackTheme = getStoredTheme();
  return {
    theme: fallbackTheme,
    isDark: fallbackTheme === 'dark',
    toggleTheme: () => {
      const next: Theme = fallbackTheme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    },
    setTheme: (t: Theme) => applyTheme(t),
  };
}
