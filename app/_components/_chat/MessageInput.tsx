"use client"

import { useState, useRef } from "react"
import { sendChatMessage } from "@/app/lib/Messages"
import { UserData } from "@/app/lib/Auth"
import styles from "@/app/styles/chat/messageinput.module.css"

interface MessageInputProps {
  roomId: string
  currentUser: UserData | null
  message: string
  setMessage: (val: string) => void
}

export default function MessageInput({ roomId, currentUser, message, setMessage }: MessageInputProps) {
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()

    const textToSend = message.trim()
    if (!textToSend || !currentUser || sending) return

    try {
      setSending(true)
      setMessage("") 
      inputRef.current?.focus()

      await sendChatMessage({
        content: textToSend,
        room_id: roomId
      })
      
    } catch (err: any) {
      console.error("Erro ao enviar:", err.message)
      setMessage(textToSend) 
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    /* ✅ Usamos role="search" ou apenas form para indicar área de entrada */
    <form onSubmit={handleSubmit} className={styles.chatForm} role="form">
      {/* Label invisível para Acessibilidade */}
      <label htmlFor="chat-input" className={styles.srOnly}>Escreva sua mensagem</label>
      
      <div className={styles.inputWrapper}>
        <input
          id="chat-input"
          ref={inputRef}
          className={styles.chatInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva algo interessante..."
          autoFocus
          autoComplete="off"
        />
        
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!message.trim() || sending}
          aria-label="Enviar mensagem"
        >
          {sending ? (
            <div className={styles.spinnerSmall} aria-hidden="true" /> 
          ) : (
            <img 
              src="/enviar.png" 
              className={styles.sendIcon}
              alt="" /* Alt vazio pois o aria-label já está no botão */
            />
          )}
        </button>
      </div>
    </form>
  )
}