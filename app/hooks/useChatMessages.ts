"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/app/lib/Supa-base"
import { messageDao } from "@/app/interfaces/dao/message-dao" 
import { MessageDto } from "@/app/interfaces/dto/message-dto"

export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Cache para não buscar o perfil do mesmo usuário várias vezes no Realtime
  const profileCache = useRef<Record<string, { name: string, avatarUrl: string }>>({})

  // 1. Busca Histórico via DAO
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (!roomId) return
      setLoading(true)
      try {
        // Busca info da sala
        const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).single()
        if (isMounted && room) setRoomData(room)

        const history = await messageDao.getMessagesByRoom(roomId)
        if (isMounted) setMessages(history)
      } catch (err) {
        console.error("Erro no hook useChatMessages:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [roomId])

  // 2. Realtime com Mapeamento para DTO
  useEffect(() => {
    if (!roomId) return

    const channel = supabase.channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const raw = payload.new as any

          // 1. Verifica Cache de Perfil
          let profile = profileCache.current[raw.user_id]
          if (!profile) {
            const { data } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("id", raw.user_id)
              .single()
            
            profile = {
              name: data?.name || "Usuário",
              avatarUrl: data?.avatar_url || "/Avatar_default.png"
            }
            profileCache.current[raw.user_id] = profile
          }

          // 2. Transforma o dado bruto do Realtime em MessageDto
          const newMessage: MessageDto = {
            id: raw.id,
            content: raw.content,
            createdAt: raw.created_at, // Mantemos a string ISO para o DTO
            roomId: raw.room_id,
            userId: raw.user_id,
            author: profile
          }

          // 3. Atualiza estado evitando duplicatas
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  return { messages, roomData, loading }
}