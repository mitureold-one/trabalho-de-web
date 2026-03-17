"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/welcome.module.css";

interface Props {
  isOpen: boolean;
  userData: { nome: string; avatar_url: string } | null;
}

export default function WelcomeModal({ isOpen, userData }: Props) {
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