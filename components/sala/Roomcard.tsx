"use client"

import styles from "@/styles/rooms/roomcard.module.css"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: any
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()

  // Extração limpa dos dados
  const totalMembros = room.room_members?.[0]?.count ?? 0
  const nomeCriador = room.creator?.nome || "Usuário"
  const avatarCriador = room.creator?.avatar_url
  const tituloSala = room.nome || "Sala sem nome"

  const handleEnterRoom = () => router.push(`/chat/${room.id_room}`)

  const formatDate = (date: string) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={styles.card} onClick={handleEnterRoom}>
      {/* Indicador de usuários online/membros */}
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
            <p>
              Criada por: <span>{nomeCriador}</span>
            </p>
          </div>
          
          <p className={styles.dateLabel}>
            Em: <span>{formatDate(room.created_at)}</span>
          </p>
        </div>

        <div className={styles.footerRow}>
          <div className={`${styles.statusBadge} ${room.is_private ? styles.private : styles.public}`}>
            {room.is_private ? "🔒 Privada" : "🌍 Pública"}
          </div>
          
          {room.tema && (
            <span className={styles.topicBadge}>#{room.tema}</span>
          )}
        </div>
      </div>

      {/* Efeito visual de profundidade */}
      <div className={styles.glare} />
    </div>
  )
}