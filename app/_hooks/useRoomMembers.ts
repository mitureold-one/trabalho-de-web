import { useState, useEffect, useRef } from "react"
import { supabase } from "@/app/_lib/Supa-base"
import { roomDao } from "@/app/_interfaces/dao/room-dao"
import { MemberDto } from "@/app/_interfaces/dto/member-dto"

export function useRoomMembers(roomId: string, currentUserId: string | undefined) {
  const [members, setMembers] = useState<MemberDto[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fix #4: isMounted evita setState em componente desmontado
  useEffect(() => {
    if (!roomId) return
    let isMounted = true

    roomDao
      .getParticipants(roomId)
      .then((data) => {
        if (isMounted) setMembers(data)
      })
      .catch((err) => console.error("Erro ao carregar membros:", err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [roomId])

  // Fix #10: canal de Presence separado em seu próprio useEffect que depende
  // APENAS de roomId. currentUserId é lido via ref para que uma mudança de
  // referência do objeto user no contexto não recrie o canal desnecessariamente.
  const currentUserIdRef = useRef(currentUserId)
  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    if (!roomId) return

    const channelName = `room_presence_${roomId}`
    const channel = supabase.channel(channelName, {
      config: { presence: { key: currentUserIdRef.current } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        setOnlineUsers(Object.keys(state))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUserIdRef.current) {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
    // Fix #10: só roomId como dependência — não recria canal quando userId re-renderiza
  }, [roomId])

  return { members, onlineUsers, loading }
}