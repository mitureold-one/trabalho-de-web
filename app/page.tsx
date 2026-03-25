"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/AuthContext"
import styles from "@/styles/auth/auth.module.css"

import LoginForm from "@/components/auth/LoginForm"
import SignupForm from "@/components/auth/SignupForm"
import TogglePanel from "@/components/auth/TogglePanel"
import ResetPasswordModal from "@/components/auth/ResetPasswordModal"
import WelcomeModal from "@/components/auth/welcomeModal"

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [active, setActive] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  // ✅ Todos os hooks ANTES de qualquer return condicional
  const handleLoginSuccess = useCallback(() => {
    setShowWelcome(true)
  }, [])

  const handleOpenReset = useCallback(() => {
    setIsResetOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setShowWelcome(false)
  }, [])

  useEffect(() => {
    if (!showWelcome && user) {
      router.replace("/rooms")
    }
  }, [showWelcome, user, router])

  // ✅ Return condicional só depois de todos os hooks
  if (loading) {
    return <div className={styles.loadingFullPage}>Carregando...</div>
  }

  return (
    <div className={styles.page}>
      <WelcomeModal
        isOpen={showWelcome}
        userData={user}
        onClose={handleClose}
      />
      <main className={`${styles.container} ${active ? styles.active : ""}`}>
        <div className={styles.mobileGradientHeader}></div>

        <div className={`${styles.formContainer} ${styles.signUp} ${active ? styles.visibleMobile : styles.hiddenMobile}`}>
          <SignupForm
            toggleMobile={() => setActive(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>

        <div className={`${styles.formContainer} ${styles.signIn} ${active ? styles.hiddenMobile : styles.visibleMobile}`}>
          <LoginForm
            onOpenReset={handleOpenReset}
            onSuccess={handleLoginSuccess}
            toggleMobile={() => setActive(true)}
          />
        </div>

        <div className={styles.toggleContainer}>
          <TogglePanel
            onLogin={() => setActive(false)}
            onSignup={() => setActive(true)}
            active={active}
          />
        </div>
      </main>

      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  )
}