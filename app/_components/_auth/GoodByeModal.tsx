"use client"

import styles from "@/app/_styles/modal/modal.goodbye.module.css"

interface Props {
  isOpen: boolean
  userName?: string
}

// Fix #5: countdown removido — ele decrementava de 3 a 0 mas nunca disparava
// nenhum redirect. O redirect real já era feito pelo AuthContext via
// window.location.href = "/". O modal agora é puro feedback visual.
export default function GoodByeModal({ isOpen, userName }: Props) {
  if (!isOpen) return null

  const firstName = userName ? userName.split(" ")[0] : "Amigo"

  return (
    <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <div className={styles.waveEmoji}>👋</div>
          <div className={styles.particles}></div>
        </div>

        <h1 className={styles.title}>Até logo, {firstName}!</h1>

        <p className={styles.subtitle}>Sua sessão foi encerrada com segurança.</p>

        <p className={styles.footerText}>Redirecionando você...</p>
      </div>
    </div>
  )
}