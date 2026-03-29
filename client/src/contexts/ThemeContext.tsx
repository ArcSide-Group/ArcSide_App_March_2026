import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const THEME_KEY = "arcside-theme";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  setIsDark: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved !== null ? saved === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
