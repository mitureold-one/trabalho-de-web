"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; // Não esqueça do import do Image
import Header from "@/components/UI/Header/header";
import Footer from "@/components/UI/Footer/footer";
import { AuthProvider } from "@/AuthContext"; 
import ColorController from "@/components/UI/ColorController"; 
import styles from "@/styles/layout.module.css"; 

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isThemeOpen ? 'hidden' : 'unset';
  }, [isThemeOpen]);

  return (
    <AuthProvider>
      <div className={`app-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <Header 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          setIsThemeOpen={setIsThemeOpen} 
        />      
        
        <div className="main-container">
          <main className="main-content">
            {children}

            {/* 1. BOTÃO FLUTUANTE (Aparece só quando o modal está FECHADO) */}
            {!isThemeOpen && (
              <button 
                className={styles.floatingThemeBtn} 
                onClick={() => setIsThemeOpen(true)}
                aria-label="Personalizar Cores"
              >
                <Image src="/definicoes.png" alt="" width={24} height={24} />
              </button>
            )}

            {/* 2. MODAL (Aparece só quando o estado for TRUE) */}
            {isThemeOpen && (
              <div className={styles.themeOverlay} onClick={() => setIsThemeOpen(false)}>
                <div className={styles.themeModal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <span>Personalizar Aparência</span>
                    <button 
                      type="button"
                      onClick={() => setIsThemeOpen(false)} 
                      className={styles.closeBtn}
                    >✕</button>
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