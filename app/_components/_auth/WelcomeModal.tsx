"use client"

import Image from "next/image"
import styles from "@/app/_styles/modal/modal.welcome.module.css"
import { UserDto } from "@/app/_interfaces/dto/user-dto"
import { useEffect } from "react"

interface Props {
  isOpen: boolean
  // Fix #20: UserDto | null em vez de Partial<UserDto> | null — contrato claro
  userData: UserDto | null
  onClose: () => void
}

export default function WelcomeModal({ isOpen, userData, onClose }: Props) {
  const firstName = userData?.name?.split(" ")[0] || "Viajante"

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.avatarContainer}>
          <div className={styles.ring}></div>
          <Image
            src={
              userData?.avatarUrl
                ? userData.avatarUrl.includes("http")
                  ? `${userData.avatarUrl}?v=1`
                  : userData.avatarUrl
                : "/Avatar_default.png"
            }
            className={styles.avatar}
            alt={`Foto de perfil de ${firstName}`}
            width={120}
            height={120}
            priority
          />
        </div>

        <h1 className={styles.title}>Bem-vindo, {firstName}!</h1>
        <p className={styles.subtitle}>Estamos preparando sua conexão com as salas...</p>

        <div className={styles.loaderBar} aria-hidden="true">
          <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  )
}