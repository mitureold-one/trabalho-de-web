"use client"
import styles from "@/app/styles/mensager.module.css"

interface MensagerProps {
  message: string;
  type?: "error" | "success";
}

export default function Mensager({ message, type = "error" }: MensagerProps) {
  if (!message) return null;

  const variantClass = type === "success" ? styles.success : styles.error;

  return (
    <div className={`${styles.messageContainer} ${variantClass}`}>
      <p>{message}</p>
    </div>
  )
}