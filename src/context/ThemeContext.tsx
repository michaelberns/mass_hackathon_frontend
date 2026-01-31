import { createContext, useContext } from 'react';

/** App uses light theme only. Kept for compatibility if any code calls useTheme(). */
const ThemeContext = createContext<{ resolvedTheme: 'light' }>({ resolvedTheme: 'light' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ resolvedTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): { resolvedTheme: 'light' } {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { resolvedTheme: 'light' };
  return ctx;
}
