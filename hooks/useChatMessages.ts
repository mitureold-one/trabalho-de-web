import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { getMessages, MessageData } from "@/lib/messages"

// ... seus imports

export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const profileCache = useRef<Record<string, any>>({})

  // 1. Busca Histórico (Mantido igual, mas com limpeza de segurança)
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (!roomId) return
      setLoading(true)
      try {
        const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).single()
        if (isMounted && room) setRoomData(room)

        const history = await getMessages(roomId)
        // ✅ Garantir que o histórico venha limpo
        if (isMounted) setMessages(history || [])
      } catch (err) {
        console.error("Erro no hook useChatMessages:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [roomId])

  // 2. Realtime com Prevenção de Duplicata Reforçada
  useEffect(() => {
    if (!roomId) return

    const channel = supabase.channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const baseMessage = payload.new as any

          // ✅ BUSCA DE PERFIL FORA DO SETTER
          let profile = profileCache.current[baseMessage.user_id]
          if (!profile) {
            const { data } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("id", baseMessage.user_id)
              .single()
            profile = data
            profileCache.current[baseMessage.user_id] = data
          }

          const newMessage: MessageData = { ...baseMessage, profiles: profile }

          // ✅ ÚNICO SETTER COM VERIFICAÇÃO FINAL
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  return { messages, roomData, loading }
}