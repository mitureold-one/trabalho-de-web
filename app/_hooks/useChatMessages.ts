"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/app/_lib/Supa-base"
import { messageDao } from "@/app/_interfaces/dao/message-dao"
import { roomDao } from "@/app/_interfaces/dao/room-dao"
import { MessageDto } from "@/app/_interfaces/dto/message-dto"

// Fix #23: limite para evitar crescimento ilimitado do cache em salas muito ativas
const PROFILE_CACHE_MAX = 200

export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fix #23: cache com controle de tamanho
  const profileCache = useRef<Record<string, { name: string; avatarUrl: string }>>({})
  const profileCacheSize = useRef(0)

  // 1. Busca histórico e dados da sala via DAO
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      if (!roomId) return
      setLoading(true)
      try {
        // Fix #14: roomDao.getRoomById em vez de supabase.from("rooms") direto
        const room = await roomDao.getRoomById(roomId)
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
    return () => {
      isMounted = false
    }
  }, [roomId])

  // 2. Realtime com mapeamento para DTO via messageDao
  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const raw = payload.new as any

          // Fix #2/#14: usa messageDao.fetchAuthorProfile em vez de
          // supabase.from("profiles") direto
          let profile = profileCache.current[raw.user_id]
          if (!profile) {
            profile = await messageDao.fetchAuthorProfile(raw.user_id)

            // Fix #23: limpa metade do cache quando atinge o limite
            if (profileCacheSize.current >= PROFILE_CACHE_MAX) {
              const half = Object.keys(profileCache.current).slice(
                0,
                PROFILE_CACHE_MAX / 2
              )
              half.forEach((k) => delete profileCache.current[k])
              profileCacheSize.current = PROFILE_CACHE_MAX / 2
            }

            profileCache.current[raw.user_id] = profile
            profileCacheSize.current++
          }

          const newMessage: MessageDto = {
            id: raw.id,
            content: raw.content,
            createdAt: raw.created_at,
            roomId: raw.room_id,
            userId: raw.user_id,
            author: profile,
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return { messages, roomData, loading }
}