"use client"

import styles from "@/styles/roomcard.module.css"
import { useRouter } from "next/navigation"

interface RoomCardProps {
  room: any
}

export default function RoomCard({ room }: RoomCardProps){

  const router = useRouter()

  function handleEnterRoom(){
    router.push(`/chat/${room.id_room}`)
  }

  function formatDate(date:string){
    const d = new Date(date)

    const dia = d.getDate().toString().padStart(2,"0")
    const mes = (d.getMonth()+1).toString().padStart(2,"0")
    const ano = d.getFullYear()

    const horas = d.getHours().toString().padStart(2,"0")
    const minutos = d.getMinutes().toString().padStart(2,"0")

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`
  }

  return(

   <div className={styles.card} onClick={handleEnterRoom}>

        <h3>{room.nome}</h3>

        <div>
            <p>Criado por: {room.creator?.nome}</p>
            <p>Em: {formatDate(room.created_at)}</p>
        </div>

        <p>
            {room.is_private ? "🔒 Privada" : "🌍 Pública"}
        </p>

    </div>

  )
}