"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import Header from "@/app/_components/_ui/_header/Header";
import Footer from "@/app/_components/_ui/_footer/Footer";
import { AuthProvider } from "@/AuthContext"; 
import ColorController from "@/app/_components/_ui/ColorController"; 
import styles from "@/app/styles/layout.module.css"; 

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isThemeOpen ? 'hidden' : 'unset';
  }, [isThemeOpen]);

  return (
    <AuthProvider>
      {/* Centralizamos a classe de layout aqui usando o styles do CSS Module */}
      <div className={`${styles.appLayout} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          setIsThemeOpen={setIsThemeOpen} 
        />      
        
        <div className={styles.mainContainer}>
          <main className={styles.mainContent}>
            {children}

            {/* BOTÃO FLUTUANTE */}
            {!isThemeOpen && (
              <button 
                className={styles.floatingThemeBtn} 
                onClick={() => setIsThemeOpen(true)}
              >
                <Image src="/definicoes.png" alt="Config" width={24} height={24} />
              </button>
            )}

            {/* MODAL DE PERSONALIZAÇÃO */}
            {isThemeOpen && (
              <div className={styles.themeOverlay} onClick={() => setIsThemeOpen(false)}>
                <div className={styles.themeModal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <span>Personalizar Aparência</span>
                    <button onClick={() => setIsThemeOpen(false)} className={styles.closeBtn}>✕</button>
                  </div>
                  <div className={styles.modalBody}>
                    <ColorController />
                  </div>
                </div>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </div>        
    </AuthProvider>
  );
}