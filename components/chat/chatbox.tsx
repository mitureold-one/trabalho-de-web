"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation" 
import { supabase } from "@/lib/supabase"
import ChatFooter from "./chatfooter"
import styles from "@/styles/chat.module.css"


export default function Chatbox() {
  const params = useParams()
  const roomId = params.id as string

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [roomData, setRoomData] = useState<any>(null)

  // 1. Carregar dados da sala (Nome, etc)
  useEffect(() => {
    async function getRoomDetails() {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("id_room", roomId)
        .single()
      
      if (data) setRoomData(data)
    }

    if (roomId) getRoomDetails()
  }, [roomId])

  // 2. Enviar mensagem para o Supabase
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const { error } = await supabase
      .from("mensagem") // Certifique-se que essa tabela existe
      .insert({
        content: message,
        room_id: roomId, // Vincula a mensagem a esta sala específica
      })

    if (error) {
      console.error("Erro ao enviar:", error)
    } else {
      setMessage("")
      // Aqui você poderia recarregar as mensagens, mas o ideal é o Realtime
    }
  }

  return (
    <div className={styles.container}>
      <header>
        <h1>Chat da Galera</h1>
      </header>

      {/* Exibe o nome dinâmico vindo do banco */}
      <h2>Sala: {roomData?.nome || "Carregando..."}</h2>

      <div >
        {messages.map((msg, index) => (
          <p key={msg.id || index}>
            <strong>{msg.user_email || "Anônimo"}:</strong> {msg.content}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem"
        />
        <button type="submit">Enviar</button>
      </form>

      <ChatFooter room={roomData}/>


    </div>
  )
}