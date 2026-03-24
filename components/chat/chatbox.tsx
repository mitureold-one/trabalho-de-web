"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useChatMessages } from "@/hooks/useChatMessages" 
import MessageInput from "@/components/chat/MessageInput" 
import MessageItem  from "@/components/chat/MessageItem" 
import MembersSidebar from "./MembersSidebar"
import styles from "@/styles/chat/chatbox.module.css"

interface ChatboxProps {
  roomId: string;
  currentUser: any; 
}

export default function Chatbox({ roomId, currentUser }: ChatboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messageText, setMessageText] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) 
  const { messages, roomData, loading } = useChatMessages(roomId)

  // ✅ Agrupamento inteligente usando useMemo para performance
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups: any, message) => {
      const date = new Date(message.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {});
  }, [messages]);

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
    if (isNearBottom || messages.length <= 50) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  return (
    <main className={styles.pageContainer}>
      <div 
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayActive : ""}`} 
        onClick={() => setIsSidebarOpen(false)} 
        aria-hidden="true" 
      />

      <section className={styles.chatWrapper}>
        <header className={styles.chatHeader}>
          <div className={styles.roomInfo}>
            <div className={styles.roomStatus}>
              <span className={styles.onlineDot} aria-hidden="true"></span>
              <h2>{roomData?.name || "Carregando sala..."}</h2>
            </div>
          </div>

          <button 
            className={`${styles.mobileMenuBtn} ${isSidebarOpen ? styles.menuOpen : ""}`} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-expanded={isSidebarOpen}
          >
            <img src="/lista.png" alt="Membros" className={styles.menuIcon} />
          </button>
        </header>

        <div className={styles.messagesArea} ref={scrollRef} role="log" aria-live="polite">
          {loading ? (
            <div className={styles.loader}><p>Buscando histórico...</p></div>
          ) : (
            Object.keys(groupedMessages).map((date) => (
              <div key={date} className={styles.dateGroup}>
                {/* 📅 Divisor de Data */}
                <div className={styles.dateDivider}>
                  <span>{date}</span>
                </div>

                {groupedMessages[date].map((msg: any) => (
                  <MessageItem 
                    key={msg.id} 
                    msg={msg} 
                    isMine={msg.user_id === currentUser?.uid} 
                  />
                ))}
              </div>
            ))
          )}
        </div>

        <footer className={styles.chatFooter}>
          <MessageInput
            roomId={roomId}
            currentUser={currentUser}
            message={messageText}
            setMessage={setMessageText}
          />
        </footer>
      </section>

      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.active : ""}`}>
         <MembersSidebar roomId={roomId} isOpen={isSidebarOpen} />
      </div>
    </main>
  )
}