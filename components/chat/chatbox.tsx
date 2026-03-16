"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import ChatFooter from "./chatfooter"
import styles from "@/styles/chat.module.css"

// Definimos o que o componente espera receber
interface ChatboxProps {
  roomId: string
}

export default function Chatbox({ roomId }: ChatboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [roomData, setRoomData] = useState<any>(null)

  // 1. Carregar dados iniciais
  useEffect(() => {
    async function getInitialData() {
      if (!roomId) return

      const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("id_room", roomId)
        .single()
      if (room) setRoomData(room)

      const { data: msgs } = await supabase
        .from("mensagem")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
      
      if (msgs) setMessages(msgs || [])
    }

    getInitialData()
  }, [roomId])

  // 2. Realtime (Ouvir novas mensagens)
  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mensagem', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  // 3. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const { error } = await supabase
      .from("mensagem")
      .insert({ content: message, room_id: roomId })

    if (!error) setMessage("")
  }

  return (
    <div className={styles.chatWrapper}>
      <header className={styles.chatHeader}>
        <h2>Sala: {roomData?.nome || "Carregando..."}</h2>
      </header>

      <div className={styles.messagesArea} ref={scrollRef}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={styles.messageRow}>
            <div className={styles.bubble}>
              <span className={styles.userLabel}>{msg.user_email || "Membro"}</span>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className={styles.chatForm}>
        <input
          className={styles.chatInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button type="submit" className={styles.sendButton}>Enviar</button>
      </form>

      <ChatFooter room={roomData}/>
    </div>
  )
}