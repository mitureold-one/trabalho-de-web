"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Definição dos temas (Exemplo: Dark e um Tema "Vibrant")
const themes = {
  dark: {
    "--cor-primaria": "#061644",
    "--cor-secundaria": "#f50911",
    "--cor-terciaria": "#0b0a1d",
    "--cor-quaternaria": "#1c1c3a",
  },
  ocean: {
    "--cor-primaria": "#002b36",
    "--cor-secundaria": "#2aa198",
    "--cor-terciaria": "#001f27",
    "--cor-quaternaria": "#073642",
  },
  purple: {
    "--cor-primaria": "#2d0a4e",
    "--cor-secundaria": "#a020f0",
    "--cor-terciaria": "#1a052e",
    "--cor-quaternaria": "#3c1361",
  }
};

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState("dark");

  const changeTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes];
    if (theme) {
      // ✅ A MÁGICA: Atualiza as variáveis CSS direto no :root
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
      setCurrentTheme(themeName);
      localStorage.setItem("app-theme", themeName);
    }
  };

  // Persistência: Carrega o tema salvo ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) changeTheme(saved);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);