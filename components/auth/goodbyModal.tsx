"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/modal/modal.goodbye.module.css";

interface Props {
  isOpen: boolean;
  userName: string;
}

export default function GoodbyeModal({ isOpen, userName }: Props) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <div className={styles.waveEmoji}>👋</div>
          <div className={styles.particles}></div>
        </div>

        <h1 className={styles.title}>Até logo, {userName.split(' ')[0]}!</h1>
        <p className={styles.subtitle}>
          Sua sessão está sendo encerrada com segurança em...
        </p>
        
        <div className={styles.timerCircle}>
          <span className={styles.number}>{countdown}</span>
          <svg className={styles.svg}>
            <circle cx="40" cy="40" r="38" />
          </svg>
        </div>

        <p className={styles.footerText}>Esperamos você para a próxima resenha!</p>
      </div>
    </div>
  );
}