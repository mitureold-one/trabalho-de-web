"use client"

import styles from "../../styles/sala.module.css"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function RoomList(){

  const router = useRouter()

  const [rooms, setRooms] = useState<any[]>([])
  const [roomName, setRoomName] = useState("")

  async function loadRooms(){

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending:false })

    if(error){
      console.log(error)
      return
    }

    setRooms(data || [])
  }

  async function createRoom(){

    if(!roomName.trim()){
      alert("Digite um nome para a sala")
      return
    }

    const { error } = await supabase
      .from("rooms")
      .insert({
        nome: roomName
      })

    if(error){
      console.log(error)
      return
    }

    setRoomName("")
    loadRooms()
  }

  useEffect(()=>{
    loadRooms()
  },[])

  return (
    <div className={styles.container}>

      <h2 className={styles.title}>Salas Disponíveis</h2>

      <div className={styles.createRoom}>
        <input
          className={styles.input}
          type="text"
          placeholder="Nome da sala"
          value={roomName}
          onChange={(e)=>setRoomName(e.target.value)}
        />

        <button
          className={styles.button}
          onClick={createRoom}
        >
          Criar
        </button>
      </div>

      <div className={styles.carrossel}>
        <div className={styles.group}>

          {rooms.map((room)=>(
            <div
              className={styles.card}
              key={room.id_room}
              onClick={()=>router.push(`/chat/${room.id_room}`)}
            >
              {room.nome}
            </div>
          ))}

        </div>
      </div>

    </div>
  )
}