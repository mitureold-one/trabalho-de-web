import { useTheme } from "@/ThemeContext";
import styles from "./ColorPicker.module.css";

export function ColorPicker() {
  const { changeTheme, currentTheme } = useTheme();

  const options = [
    { name: "dark", color: "#f50911" },
    { name: "ocean", color: "#2aa198" },
    { name: "purple", color: "#a020f0" },
  ];

  return (
    <div className={styles.container}>
      {options.map((opt) => (
        <button
          key={opt.name}
          className={`${styles.dot} ${currentTheme === opt.name ? styles.active : ""}`}
          style={{ backgroundColor: opt.color }}
          onClick={() => changeTheme(opt.name)}
          title={`Tema ${opt.name}`}
        />
      ))}
    </div>
  );
}