"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/AuthContext"
import Link from "next/link"
import styles from "@/app/_styles/ui/avatar.header.module.css"
import GoodbyeModal from "@/app/_components/_auth/GoodByeModal"

interface AvatarHeaderProps {
  isCollapsed?: boolean
}

export default function AvatarHeader({ isCollapsed }: AvatarHeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [showGoodbye, setShowGoodbye] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Fix #21: capturamos o nome ANTES de disparar signOut, pois após o logout
  // user vira null e o GoodbyeModal exibiria "Amigo" em vez do nome real.
  const capturedNameRef = useRef<string>("Amigo")

  const handleLogout = async () => {
    if (isLoggingOut) return

    // Captura o nome enquanto user ainda está disponível
    capturedNameRef.current = user?.name || "Amigo"

    setIsLoggingOut(true)
    setShowGoodbye(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await signOut()
      // O AuthContext + SIGNED_OUT redireciona para "/"
    } catch (error) {
      console.error("Erro ao sair:", error)
      setIsLoggingOut(false)
      setShowGoodbye(false)
    }
  }

  if (loading && !isLoggingOut) return <div className={styles.loadingSmall}>...</div>
  if (!user && !showGoodbye) return null

  return (
    <>
      <aside
        className={`${styles.userContainer} ${isCollapsed ? styles.collapsed : ""}`}
        aria-label="Perfil do usuário"
      >
        <Link href="/profile" className={styles.profileLink}>
          <div className={styles.avatarWrapper}>
            <img
              src={user?.avatarUrl || "/Avatar_default.png"}
              alt={`Foto de ${user?.name || "usuário"}`}
              className={styles.avatarImg}
              onError={(e) => {
                e.currentTarget.src = "/Avatar_default.png"
              }}
            />
          </div>

          {!isCollapsed && (
            <div className={styles.userInfo}>
              <strong className={styles.userName}>{user?.name || "Usuário"}</strong>
            </div>
          )}
        </Link>

        <button
          type="button"
          className={`${styles.logoutBtnRound} ${isLoggingOut ? styles.btnDisabled : ""}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sair da conta"
        >
          <img
            src="/poder.png"
            alt="Sair"
            className={isLoggingOut ? styles.spinning : ""}
          />
        </button>
      </aside>

      {/* Fix #21: usa capturedNameRef.current para garantir que o nome
          esteja disponível mesmo após user virar null no contexto */}
      <GoodbyeModal isOpen={showGoodbye} userName={capturedNameRef.current} />
    </>
  )
}