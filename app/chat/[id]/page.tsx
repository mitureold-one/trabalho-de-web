"use client"

import { useParams } from "next/navigation"
import Chatbox from "@/components/chat/chatbox"
import SidebarSalas from "@/components/sala/sidebarSalas" 
import styles from "@/styles/chat.module.css"

export default function ChatRoomPage() {
  const params = useParams()
  const roomId = params.id as string

  return (
    <div className={styles.chatMainLayout}>
      {/* Sidebar na Esquerda */}
      <aside className={styles.sidebar}>
        <SidebarSalas currentRoomId={roomId} />
      </aside>

      {/* Chatbox na Direita ocupando o resto */}
      <main className={styles.chatContent}>
        <Chatbox roomId={roomId} />
      </main>
    </div>
  )
}