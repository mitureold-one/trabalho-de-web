import styles from "@/styles/ui/Logo.header.module.css";

interface LogoProps {
  isCollapsed?: boolean;
}

export default function Logo({ isCollapsed }: LogoProps) {
  return (
    <div className={`${styles.speechBubble} ${isCollapsed ? styles.collapsed : ""}`}>
      <h1 className={styles.logo}>
        {isCollapsed ? "CG" : "Chat da Galera"}
      </h1>
    </div>
  );
}