import React, { useEffect, useState, createContext, useContext } from 'react';
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [theme, setTheme] = useState<Theme>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ?
    'dark' :
    'light';
  });
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  return (
    <ThemeContext.Provider
      value={{
        theme
      }}>
      
      {children}
    </ThemeContext.Provider>);

}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}