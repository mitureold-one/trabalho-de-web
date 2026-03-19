"use client"

import { useState } from "react"
import styles from "@/styles/auth/auth.module.css"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import TogglePanel from "@/components/auth/TogglePanel"
import ResetPasswordModal from "@/components/auth/ResetPasswordModal" 
import WelcomeModal from "@/components/auth/welcomeModal" 

export default function Home() {
  const [active, setActive] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false) 
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [userData, setUserData] = useState<{ nome: string; avatar_url: string } | null>(null);

  const handleLoginSuccess = (data: { nome: string; avatar_url: string }) => {
    setUserData(data);      
    setIsWelcomeOpen(true); 
  };

  return (
    <div className={styles.page}>
      
      {isWelcomeOpen && userData && (
        <WelcomeModal isOpen={isWelcomeOpen} userData={userData} />
      )}

      <div className={`${styles.container} ${active ? styles.active : ""}`}>

        {/* A faixa de gradiente que você pediu! */}
        <div className={styles.mobileGradientHeader}></div>

          {/* SIGNUP CONTAINER */}
          <div className={`
            ${styles.formContainer} 
            ${styles.signUp} 
            ${active ? styles.visibleMobile : styles.hiddenMobile}
          `}>
            <SignupForm toggleMobile={() => setActive(false)} /> 
          </div>

          {/* SIGNIN CONTAINER */}
          <div className={`
            ${styles.formContainer} 
            ${styles.signIn} 
            ${active ? styles.hiddenMobile : styles.visibleMobile}
          `}>
            <LoginForm 
              onOpenReset={() => setIsResetOpen(true)} 
              onSuccess={handleLoginSuccess} 
              toggleMobile={() => setActive(true)}
            />
          </div>

          <div className={styles.toggleContainer}>
            <TogglePanel
              ativarLogin={() => setActive(false)}
              ativarCadastro={() => setActive(true)}
              active={active}
            />
          </div>

        </div> 

      <ResetPasswordModal 
          isOpen={isResetOpen} 
          onClose={() => setIsResetOpen(false)} 
      />

    </div>
  )
}