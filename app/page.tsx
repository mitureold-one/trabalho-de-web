"use client"

import { useState } from "react"
import styles from "@/styles/auth/auth.module.css"
import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import TogglePanel from "@/components/auth/TogglePanel"
import ResetPasswordModal from "@/components/auth/ResetPasswordModal" 

export default function Home() {
  const [active, setActive] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false) 
      
      
  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${active ? styles.active : ""}`}>

        {/* SIGN UP */}
        <div className={`${styles.formContainer} ${styles.signUp}`}>
          <SignupForm />
        </div>

        {/* SIGN IN */}
        <div className={`${styles.formContainer} ${styles.signIn}`}>
          <LoginForm onOpenReset={() => setIsResetOpen(true)} />
        </div>

        {/* TOGGLE */}
        <div className={styles.toggleContainer}>
          <TogglePanel
            ativarLogin={() => setActive(false)}
            ativarCadastro={() => setActive(true)}
            active={active}
          />
        </div>

        <ResetPasswordModal 
          isOpen={isResetOpen} 
          onClose={() => setIsResetOpen(false)} 
        />
        

      </div>
    </div>
  )
}