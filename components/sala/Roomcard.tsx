"use client"

import { useState } from "react"
import styles from "@/styles/rooms/roomcard.module.css"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: any
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [inputPassword, setInputPassword] = useState("")
  const [error, setError] = useState(false)

  const totalMembros = room.room_members?.[0]?.count ?? 0
  const nomeCriador = room.creator?.nome || "Usuário"
  const avatarCriador = room.creator?.avatar_url
  const tituloSala = room.nome || "Sala sem nome"

  const handleCardClick = () => {
    if (room.is_private) {
      setShowPasswordModal(true)
    } else {
      router.push(`/chat/${room.id_room}`)
    }
  }

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault()
    // No mundo real, você faria uma chamada ao banco/API aqui. 
    // Para o MVP, validamos com o dado que veio da query (se você trouxe a senha)
    if (inputPassword === room.password) {
      router.push(`/chat/${room.id_room}`)
    } else {
      setError(true)
      // Feedback visual de erro
      setTimeout(() => setError(false), 2000)
    }
  }

  const formatDate = (date: string) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <>
      <div className={styles.card} onClick={handleCardClick}>
        <div className={styles.memberBadge}>
          <span className={styles.pulseDot}></span>
          {totalMembros} {totalMembros === 1 ? "membro" : "membros"}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.roomName}>{tituloSala}</h3>

          <div className={styles.infoGroup}>
            <div className={styles.creatorInfo}>
              {avatarCriador ? (
                <img src={avatarCriador} className={styles.miniAvatar} alt="" />
              ) : (
                <span className={styles.userIcon}>👤</span>
              )}
              <p>Criada por: <span>{nomeCriador}</span></p>
            </div>
            <p className={styles.dateLabel}>Em: <span>{formatDate(room.created_at)}</span></p>
          </div>

          <div className={styles.footerRow}>
            <div className={`${styles.statusBadge} ${room.is_private ? styles.private : styles.public}`}>
              {room.is_private ? <img src="/cadeado.png" alt="privada" /> : <img src="/globo-terrestre.png" alt="publica" />}
            </div>
            {room.tema && <span className={styles.topicBadge}>#{room.tema}</span>}
          </div>
        </div>
        <div className={styles.glare} />
      </div>

      {/* --- MODAL DE SENHA --- */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.passwordModal} onClick={(e) => e.stopPropagation()}>
            <h3>Sala Privada 🔒</h3>
            <p>Esta sala exige uma senha para entrar.</p>
            
            <form onSubmit={handleVerifyPassword}>
              <input 
                type="password" 
                placeholder="Digite a senha..."
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                autoFocus
                className={error ? styles.inputError : ""}
              />
              {error && <span className={styles.errorText}>Senha incorreta!</span>}
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className={styles.confirmBtn}>Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}