"use client";
import { useEffect } from "react";
import styles from "@/styles/modal/modal.welcome.module.css";

interface Props {
  isOpen: boolean;
  userData: { nome: string; avatar_url: string } | null;
}

export default function WelcomeModal({ isOpen, userData }: Props) {
  // 1. Verificação de segurança: se não estiver aberto, não renderiza o HTML
  if (!isOpen) return null;

 useEffect(() => {
    // Só dispara se o modal estiver aberto
    if (isOpen) {
      const timer = setTimeout(() => {
        // window.location.replace é o "segredo" profissional.
        // Ele substitui a página "/" (login) pela "/salas" no histórico.
        // Resultado: Se o usuário clicar em "Voltar", ele sai do site 
        // em vez de voltar para o modal de boas-vindas.
        window.location.replace("/salas"); 
      }, 5000);

      // Limpeza importante: se o componente sumir, o timer para.
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        
        <h1 className={styles.title}>Bem-vindo, {userData?.nome?.split(' ')[0]}!</h1>
        <p className={styles.subtitle}>Sincronizando as melhores salas...</p>
        
        {/* Feedback visual de progresso */}
        <div className={styles.loaderBar}>
           <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  );
}