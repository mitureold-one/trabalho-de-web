import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getRoomParticipants } from "@/lib/rooms" 

export function useRoomMembers(roomId: string, currentUserId: string | undefined) {
  const [members, setMembers] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    // 1. Carga Inicial via sua Lib
    getRoomParticipants(roomId).then(data => {
      setMembers(data)
      setLoading(false)
    })

    // 2. Configuração do Presence (Tempo Real de Conexão)
    const channel = supabase.channel(`room_presence_${roomId}`, {
      config: { presence: { key: currentUserId } }
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        // Extraímos apenas os IDs dos usuários que estão com o canal aberto
        const onlineIds = Object.keys(state)
        setOnlineUsers(onlineIds)
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("Alguém entrou:", newPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUserId) {
          // "Anuncia" que eu estou online nesta sala
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, currentUserId])

  return { members, onlineUsers, loading }
}