"use client";
import Image from "next/image";
import styles from "@/styles/modal/modal.welcome.module.css";
import { UserData } from "@/lib/auth";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  userData: Partial<UserData> | null;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, userData, onClose }: Props) {
  // ✅ hooks sempre antes de qualquer return condicional
  const firstName = userData?.name?.split(" ")[0] || "Viajante";

  useEffect(() => {
    if (!isOpen) return; // ✅ condição dentro do hook, não fora

    const timer = setTimeout(() => {
      console.log("Timer finalizado, chamando onClose...");
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  // ✅ return condicional só aqui, depois dos hooks
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.avatarContainer}>
          <div className={styles.ring}></div>
          <Image
            src={userData?.avatar_url ? `${userData.avatar_url}?v=1` : "/Avatar_default.png"}
            className={styles.avatar}
            alt={`Foto de perfil de ${firstName}`}
            width={120}
            height={120}
            priority
          />
        </div>

        <h1 id="welcome-title" className={styles.title}>
          Bem-vindo, {firstName}!
        </h1>
        <p className={styles.subtitle}>
          Estamos preparando sua conexão com as salas...
        </p>

        <div className={styles.loaderBar} aria-hidden="true">
          <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  );
}