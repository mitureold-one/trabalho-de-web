import { useState, useEffect } from "react"
import { supabase } from "@/app/lib/Supa-base"
import { roomDao } from "@/app/interfaces/dao/room-dao" 
import { MemberDto } from "@/app/interfaces/dto/member-dto"

export function useRoomMembers(roomId: string, currentUserId: string | undefined) {
  const [members, setMembers] = useState<MemberDto[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    // 1. Carga Inicial via DAO
    roomDao.getParticipants(roomId)
      .then(data => {
        setMembers(data)
      })
      .catch(err => console.error("Erro ao carregar membros:", err))
      .finally(() => setLoading(false))

    // 2. Presence (Mantemos a lógica, mas usamos o currentUserId atualizado)
    const channelName = `room_presence_${roomId}`
    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUserId } }
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        setOnlineUsers(Object.keys(state))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUserId) {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, currentUserId])

  return { members, onlineUsers, loading }
}