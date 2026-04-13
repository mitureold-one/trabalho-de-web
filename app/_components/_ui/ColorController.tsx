"use client";

import { useEffect, useState } from "react";
import styles from "@/app/_styles/ColorController.module.css";

const DEFAULT_COLORS = {
  "--cor-primaria": "#061644",
  "--cor-secundaria": "#f50911",
  "--cor-terciaria": "#0b0a1d",
  "--cor-quaternaria": "#1c1c3a",
};

const COLOR_NAMES: Record<string, string> = {
  "--cor-primaria": "Cor 1",
  "--cor-secundaria": "Cor 2",
  "--cor-terciaria": "Cor 3",
  "--cor-quaternaria": "Cor 4",
};

// ✅ Fora do componente — sem recriação a cada render
function applyTheme(newColors: typeof DEFAULT_COLORS) {
  Object.entries(newColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);

    // ✅ Gera RGB para todas as cores
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    document.documentElement.style.setProperty(`${key}-rgb`, `${r}, ${g}, ${b}`);
  });
}

export default function ColorController() {
  
  // ✅ Aplica o tema assim que o componente monta
  useEffect(() => {
    applyTheme(colors);
  }, []);

  const handleColorChange = (variable: string, value: string) => {
    const updated = { ...colors, [variable]: value };
    setColors(updated);
    applyTheme(updated);
    localStorage.setItem("user-custom-theme", JSON.stringify(updated));
  };

  const [colors, setColors] = useState<typeof DEFAULT_COLORS>(() => {
  if (typeof window === "undefined") return DEFAULT_COLORS;
  const saved = localStorage.getItem("user-custom-theme");
  return saved ? JSON.parse(saved) : DEFAULT_COLORS;
});

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    applyTheme(DEFAULT_COLORS);
    localStorage.removeItem("user-custom-theme");
  };

  return (
    <div className={styles.themePanel}>
      <div className={styles.verticalList}>
        {Object.entries(colors).map(([variable, value]) => (
          <div key={variable} className={styles.controlItem}>
            <label className={styles.label}>{COLOR_NAMES[variable]}</label>
            <div className={styles.inputGroup}>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorChange(variable, e.target.value)}
                className={styles.picker}
              />
              <span className={styles.hexText}>{value.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.resetBtn} onClick={handleReset}>
        Resetar Cores
      </button>
    </div>
  );
}