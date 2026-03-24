"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/modal/modal.goodbye.module.css";

interface Props {
  isOpen: boolean;
  userName?: string; // ✅ Desacoplado do AuthContext
}

export default function GoodbyeModal({ isOpen, userName }: Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) setCountdown(3);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // ✅ 'replace' não deixa rastro no histórico do navegador
      router.replace("/");
    }
  }, [isOpen, countdown, router]);

  if (!isOpen) return null;

  // ✅ Lógica local segura: se o nome não vier, usa fallback
  const firstName = userName ? userName.split(' ')[0] : "Amigo";

  return (
    <div 
      className={styles.overlay} 
      onClick={(e) => e.stopPropagation()} // 🛡️ Bloqueia cliques externos
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <div className={styles.waveEmoji}>👋</div>
          <div className={styles.particles}></div>
        </div>

        <h1 className={styles.title}>Até logo, {firstName}!</h1>
        
        <p className={styles.subtitle}>
          Sua sessão foi encerrada com segurança.
        </p>
        
        <div className={styles.timerCircle}>
          <span className={styles.number}>{countdown}</span>
          <svg className={styles.svg}>
            <circle cx="40" cy="40" r="38" />
          </svg>
        </div>

        <p className={styles.footerText}>Redirecionando você...</p>
      </div>
    </div>
  );
}