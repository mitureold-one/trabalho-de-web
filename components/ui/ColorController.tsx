"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/ColorController.module.css";

const DEFAULT_COLORS = {
  "--cor-primaria": "#061644",
  "--cor-secundaria": "#f50911",
  "--cor-terciaria": "#0b0a1d",
  "--cor-quaternaria": "#1c1c3a",
};

export default function ColorController() {
  const [colors, setColors] = useState(DEFAULT_COLORS);

  const colorNames: { [key: string]: string } = {
    "--cor-primaria": "Cor 1",
    "--cor-secundaria": "Cor 2",
    "--cor-terciaria": "Cor 3",
    "--cor-quaternaria": "Cor 4",
  };

  useEffect(() => {
    const saved = localStorage.getItem("user-custom-theme");
    if (saved) {
      const parsed = JSON.parse(saved);
      setColors(parsed);
      applyTheme(parsed);
    }
  }, []);

  const applyTheme = (newColors: typeof DEFAULT_COLORS) => {
    Object.entries(newColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
      
      if (key === "--cor-secundaria" || key === "--cor-terciaria") {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        document.documentElement.style.setProperty(`${key}-rgb`, `${r}, ${g}, ${b}`);
      }
    });
  };

  const handleColorChange = (variable: string, value: string) => {
    const updated = { ...colors, [variable]: value };
    setColors(updated);
    applyTheme(updated);
    localStorage.setItem("user-custom-theme", JSON.stringify(updated));
  };

  return (
    <div className={styles.themePanel}>
      <div className={styles.verticalList}>
        {Object.entries(colors).map(([variable, value]) => (
          <div key={variable} className={styles.controlItem}>
            <label className={styles.label}>{colorNames[variable]}</label>
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

      <button 
        className={styles.resetBtn}
        onClick={() => {
          setColors(DEFAULT_COLORS);
          applyTheme(DEFAULT_COLORS);
          localStorage.removeItem("user-custom-theme");
        }}
      >
        Resetar Cores
      </button>
    </div>
  );
}
