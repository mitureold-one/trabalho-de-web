"use client"

import styles from "@/styles/rooms/roomcard.module.css"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: any
}

export default function RoomCard({ room }: RoomCardProps){
  const router = useRouter()

  function handleEnterRoom(){
    router.push(`/chat/${room.id_room}`)
  }

  function formatDate(date: string){
    const d = new Date(date)
    const dia = d.getDate().toString().padStart(2, "0")
    const mes = (d.getMonth() + 1).toString().padStart(2, "0")
    const ano = d.getFullYear()
    const horas = d.getHours().toString().padStart(2, "0")
    const minutos = d.getMinutes().toString().padStart(2, "0")

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`
  }

  return (
    <div className={styles.card} onClick={handleEnterRoom}>
      <div className={styles.cardContent}>
        <h3 className={styles.roomName}>{room.room_name || room.nome}</h3>

        <div className={styles.infoGroup}>
          <p className={styles.creator}>
            <span>👤</span> {room.creator?.nome || "Usuário"}
          </p>
          <p className={styles.date}>
            {formatDate(room.created_at)}
          </p>
        </div>

        <div className={`${styles.badge} ${room.is_private ? styles.private : styles.public}`}>
          {room.is_private ? "🔒 Privada" : "🌍 Pública"}
        </div>
      </div>
      
      {/* Overlay de brilho no hover */}
      <div className={styles.glare} />
    </div>
  )
}