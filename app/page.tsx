"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/AuthContext"
import styles from "@/app/_styles/auth/auth.module.css"
import LoginForm from "@/app/_components/_auth/LoginForm"
import SignupForm from "@/app/_components/_auth/SignupForm"
import TogglePanel from "@/app/_components/_auth/TogglePanel"
import ResetPasswordModal from "@/app/_components/_auth/ResetPasswordModal"
import WelcomeModal from "@/app/_components/_auth/WelcomeModal"
import { UserDto } from "@/app/_interfaces/dto/user-dto"

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [active, setActive] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)

  // welcomeUser: quando preenchido, bloqueia o useEffect de redirect e exibe o modal.
  // Zerado quando o modal fecha → useEffect pode redirecionar normalmente.
  const [welcomeUser, setWelcomeUser] = useState<UserDto | null>(null)

  // ─── Fluxo: Usuário veterano ───────────────────────────────────────────────
  // signIn aguarda SIGNED_IN → refreshUser → devolve UserDto completo.
  // Neste ponto user.profile já está populado, sem race condition.
  // ─── Fluxo: Login com Sucesso ───────────────────────────────────────────────
  const handleLoginSuccess = useCallback((loggedUser: UserDto) => {
    if (loggedUser.hasCompletedOnboarding) {
      // Veterano: trava o redirect automático e mostra boas-vindas
      setWelcomeUser(loggedUser)
    } else {
      // Novato: Se não completou o setup, mandamos para o /setup explicitamente
      router.replace("/setup")
    }
  }, [router])

  // ─── Redirect de sessão ativo ───────────────────────────────────────────────
  useEffect(() => {
    if (loading) return 
    if (!user) return 
    if (welcomeUser) return // Essencial: trava o redirect enquanto o modal está aberto

    // Se o user existe, o loading acabou e não há modal de boas-vindas:
    if (user.hasCompletedOnboarding) {
        router.replace("/rooms")
    } else {
        router.replace("/setup")
    }
  }, [user, loading, welcomeUser, router])

  // ─── Fluxo: Usuário novo ────────────────────────────────────────────────────
  // registrarUsuario sempre retorna pendingConfirmation=true (o Supabase envia
  // e-mail de confirmação). O SignupForm mostra a mensagem de sucesso e para por aqui.
  // Após confirmação o usuário faz login normal.
  // Sem redirecionamento automático após signup - o usuário permanece na página de auth
  // até completar a confirmação ou fazer login.
  const handleSignupSuccess = useCallback((_newUser: UserDto) => {
    // SignupForm exibe mensagem de sucesso, nada mais a fazer aqui.
    // Redirecionamento automático SÓ acontece quando user está autenticado (existe).
  }, [])

  const handleWelcomeClose = useCallback(() => {
    setWelcomeUser(null)
    // O useEffect abaixo vai rodar após welcomeUser virar null e redirecionar
  }, [])


  if (loading) {
    return <div className={styles.loadingFullPage}>Carregando...</div>
  }

  return (
    <div className={styles.page}>
      <WelcomeModal
        isOpen={!!welcomeUser}
        userData={welcomeUser}
        onClose={handleWelcomeClose}
      />

      <main className={`${styles.container} ${active ? styles.active : ""}`}>
        <div className={styles.mobileGradientHeader}></div>

        <div
          className={`${styles.formContainer} ${styles.signUp} ${
            active ? styles.visibleMobile : styles.hiddenMobile
          }`}
        >
          <SignupForm
            toggleMobile={() => setActive(false)}
            onSuccess={handleSignupSuccess}
          />
        </div>

        <div
          className={`${styles.formContainer} ${styles.signIn} ${
            active ? styles.hiddenMobile : styles.visibleMobile
          }`}
        >
          <LoginForm
            onOpenReset={() => setIsResetOpen(true)}
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