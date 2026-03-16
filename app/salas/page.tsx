"use client"

import styles from "../../styles/sala.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createRoom } from "@/lib/rooms"
import RoomList from "@/components/sala/RoomList"
import { getRooms } from "@/lib/rooms"

export default function SalasPage(){
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [roomName, setRoomName] = useState("")
  const [isPrivate, setPrivate] = useState(false)
  
  async function loadRooms(){

  try{
    const data = await getRooms()
    setRooms(data || [])
  }catch(error){
    console.log(error)
  }

}

useEffect(()=>{
  loadRooms()
},[])
    async function handleCreateRoom(){

      try{

        await createRoom(roomName, isPrivate)

        setRoomName("")
        setPrivate(false)

        loadRooms()

      }catch(error){
        console.log(error)
      }

    }

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

        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e)=>setPrivate(e.target.checked)}
          />
          Sala privada
        </label>

        <button
          className={styles.button}
          onClick={handleCreateRoom}
        >
          Criar
        </button>

      </div>
      <RoomList
        rooms={rooms}
      />

      

    </div>
  )
  
}