"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/modal/welcome.module.css";

interface Props {
  isOpen: boolean;
  userData: { nome: string; avatar_url: string } | null;
}

export default function WelcomeModal({ isOpen, userData }: Props) {
  if (!isOpen) return null;
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push("/salas");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, router]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.avatarContainer}>
          <div className={styles.ring}></div>
          <img 
            src={userData?.avatar_url || "/default-avatar.png"} 
            className={styles.avatar} 
            alt="User" 
          />
        </div>
        
        <h1 className={styles.title}>Bem-vindo, {userData?.nome}!</h1>
        <p className={styles.subtitle}>Preparando suas salas...</p>
      </div>
    </div>
  );
}