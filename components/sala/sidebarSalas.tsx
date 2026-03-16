"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import styles from "@/styles/chat.module.css"

export default function SidebarSalas({ currentRoomId }: { currentRoomId: string }) {
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase.from("rooms").select("*")
      if (data) setRooms(data)
    }
    fetchRooms()
  }, [])

  return (
    <div className={styles.sidebarContainer}>
      <h3 className={styles.sidebarTitle}>Suas Salas</h3>
      <div className={styles.sidebarList}>
        {rooms.map((room) => (
          <Link 
            key={room.id_room} 
            href={`/chat/${room.id_room}`}
            className={`${styles.sidebarItem} ${currentRoomId === room.id_room ? styles.active : ""}`}
          >
            <span className={styles.roomIcon}>{room.is_private ? "🔒" : "💬"}</span>
            <span className={styles.roomName}>{room.nome}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}