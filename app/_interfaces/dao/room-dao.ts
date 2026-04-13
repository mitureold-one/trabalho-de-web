import { supabase } from "@/app/_lib/Supa-base"
import { RoomDto } from "../dto/room-dto"
import { MemberDto } from "../dto/member-dto"
import { RoomMemberQueryResult } from "../util/RoomMember"

export const roomDao = {
  handleError(error: any): string {
    if (error.code === "23505") return "Já existe uma sala com este nome! 📛"
    if (error.message?.includes("fetch")) return "Erro de conexão! 🌐"
    return error.message || "Erro inesperado."
  },

  // Fix #14/#2: novo método para buscar dados de uma sala pelo ID,
  // usado pelo useChatMessages em vez de supabase.from("rooms") direto.
  async getRoomById(roomId: string): Promise<RoomDto | null> {
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `id, name, created_at, is_private,
         creator:profiles!user_id (name, avatar_url),
         room_members(count)`
      )
      .eq("id", roomId)
      .single()

    if (error) return null
    return this.mapToDto(data)
  },

  /**
   * Busca uma sala com a lista completa de membros já incluída no DTO
   * Útil para exibir participantes da sala ou gerenciar permissões
   */
  async getRoomWithMembers(roomId: string): Promise<RoomDto | null> {
    try {
      // Busca dados básicos da sala
      const room = await this.getRoomById(roomId)
      if (!room) return null

      // Busca lista de membros
      const members = await this.getParticipants(roomId)

      // Retorna sala com membros populados
      return {
        ...room,
        members,
      }
    } catch (error) {
      console.error("[roomDao] Erro ao buscar sala com membros:", error)
      return null
    }
  },

  async getParticipants(roomId: string): Promise<MemberDto[]> {
    const { data, error } = await supabase
      .from("room_members")
      .select(
        `role,
         joined_at,
         profiles (
           id,
           name,
           avatar_url
         )`
      )
      .eq("room_id", roomId)

    if (error) throw new Error(this.handleError(error))

    const rawData = data as unknown as RoomMemberQueryResult[]

    return rawData.map((item) => ({
      userId: item.profiles?.id || "desconhecido",
      name: item.profiles?.name || "Usuário",
      avatarUrl: item.profiles?.avatar_url || "/Avatar_default.png",
      role: item.role,
      joinedAt: item.joined_at,
    }))
  },

  async createRoom(
    name: string,
    isPrivate: boolean,
    password?: string
  ): Promise<RoomDto> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Sessão expirada.")

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: name.trim(),
        user_id: user.id,
        is_private: isPrivate,
        password: password,
      })
      .select(
        `id, name, is_private, created_at,
         creator:profiles!user_id (name, avatar_url),
         room_members(count)`
      )
      .single()

    if (error) throw new Error(this.handleError(error))
    return this.mapToDto(data)
  },

  // Fix #15: query agora inclui contagem de membros via subquery agregada.
  // Supabase retorna room_members como [{count: N}], por isso extraímos [0].count.
  async getRooms(page = 0, size = 20): Promise<RoomDto[]> {
    const from = page * size
    const to = from + size - 1

    const { data, error } = await supabase
      .from("rooms")
      .select(
        `id, name, created_at, is_private,
         creator:profiles!user_id (name, avatar_url),
         room_members(count)`
      )
      .range(from, to)
      .order("created_at", { ascending: false })

    if (error) throw new Error(this.handleError(error))
    return (data as any[]).map((room) => this.mapToDto(room))
  },

  async verifyAndJoin(roomId: string, passwordTyped: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("join_private_room", {
      target_room_id: roomId,
      typed_password: passwordTyped,
    })

    if (error) throw new Error(this.handleError(error))

    if (data === false) {
      throw new Error("Senha incorreta! ❌")
    }

    return true
  },

  // Fix #15/#16: mapToDto agora popula memberCount corretamente.
  // slug foi removido — nunca foi populado pelo banco.
  mapToDto(raw: any): RoomDto {
    const creatorData = Array.isArray(raw.creator) ? raw.creator[0] : raw.creator
    const memberCount: number =
      Array.isArray(raw.room_members) && raw.room_members.length > 0
        ? (raw.room_members[0].count ?? 0)
        : 0

    return {
      id: raw.id,
      name: raw.name,
      isPrivate: raw.is_private,
      createdAt: raw.created_at,
      memberCount,
      creator: {
        name: creatorData?.name || "Criador Desconhecido",
        avatarUrl: creatorData?.avatar_url || "/Avatar_default.png",
      },
    }
  },

  /**
   * Busca todas as salas que o usuário criou
   */
  async getRoomsByUser(): Promise<RoomDto[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.warn("[roomDao] Usuário não autenticado ao buscar salas do usuário")
        return []
      }

      const { data, error } = await supabase
        .from("rooms")
        .select(
          `id, name, created_at, is_private,
           creator:profiles!user_id (name, avatar_url),
           room_members(count)`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[roomDao] Erro ao buscar salas do usuário:", error)
        return []
      }

      return (data as any[]).map((room) => this.mapToDto(room))
    } catch (error) {
      console.error("[roomDao] Erro inesperado em getRoomsByUser:", error)
      return []
    }
  },

  /**
   * Busca todas as salas que o usuário participa (joined)
   */
  async getUserJoinedRooms(): Promise<RoomDto[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.warn("[roomDao] Usuário não autenticado ao buscar salas ativas")
        return []
      }

      const { data, error } = await supabase
        .from("room_members")
        .select(
          `rooms (
             id, name, created_at, is_private,
             creator:profiles!user_id (name, avatar_url),
             room_members(count)
           )`
        )
        .eq("user_id", user.id)

      if (error) {
        console.error("[roomDao] Erro ao buscar salas do usuário:", error)
        return []
      }

      return (data as any[])
        .map((item: any) => item.rooms)
        .filter((room) => room !== null)
        .map((room) => this.mapToDto(room))
    } catch (error) {
      console.error("[roomDao] Erro inesperado em getUserJoinedRooms:", error)
      return []
    }
  },

  /**
   * Verifica se um usuário é membro de uma sala
   */
  async isUserMemberOfRoom(roomId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from("room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single()

      return !error && data !== null
    } catch (error) {
      console.error("[roomDao] Erro ao verificar membro da sala:", error)
      return false
    }
  },

  /**
   * Adiciona um usuário como membro da sala
   */
  async addMemberToRoom(roomId: string, userId: string, role: string = "member"): Promise<void> {
    try {
      const { error } = await supabase.from("room_members").insert({
        room_id: roomId,
        user_id: userId,
        role: role,
        joined_at: new Date().toISOString(),
      })

      if (error) {
        if (error.code === "23505") {
          console.warn("[roomDao] Usuário já é membro da sala")
          return
        }
        throw new Error(this.handleError(error))
      }
    } catch (error) {
      console.error("[roomDao] Erro ao adicionar membro à sala:", error)
      throw error
    }
  },

  /**
   * Remove um usuário da sala
   */
  async removeMemberFromRoom(roomId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", userId)

      if (error) {
        throw new Error(this.handleError(error))
      }
    } catch (error) {
      console.error("[roomDao] Erro ao remover membro da sala:", error)
      throw error
    }
  },

  /**
   * Usuário sai da sala
   */
  async leaveRoom(roomId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      await this.removeMemberFromRoom(roomId, user.id)
    } catch (error) {
      console.error("[roomDao] Erro ao sair da sala:", error)
      throw error
    }
  },

  /**
   * Atualiza o nome ou privacidade de uma sala
   */
  async updateRoom(roomId: string, updates: {
    name?: string
    isPrivate?: boolean
    password?: string
  }): Promise<RoomDto | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      const updateData: any = {}
      if (updates.name) updateData.name = updates.name.trim()
      if (updates.isPrivate !== undefined) updateData.is_private = updates.isPrivate
      if (updates.password !== undefined) updateData.password = updates.password

      const { data, error } = await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", roomId)
        .eq("user_id", user.id) // Apenas criador pode atualizar
        .select(
          `id, name, created_at, is_private,
           creator:profiles!user_id (name, avatar_url),
           room_members(count)`
        )
        .single()

      if (error) {
        console.error("[roomDao] Erro ao atualizar sala:", error)
        return null
      }

      return this.mapToDto(data)
    } catch (error) {
      console.error("[roomDao] Erro inesperado em updateRoom:", error)
      return null
    }
  },

  /**
   * Deleta uma sala (apenas o criador pode deletar)
   */
  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      // Primeiro deleta todos os membros da sala
      const { error: membersError } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)

      if (membersError) {
        throw new Error(`Erro ao limpar membros: ${this.handleError(membersError)}`)
      }

      // Depois deleta a sala (apenas se o usuário é o criador)
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomId)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(this.handleError(error))
      }

      return true
    } catch (error) {
      console.error("[roomDao] Erro ao deletar sala:", error)
      return false
    }
  },

  /**
   * Busca uma sala por nome (busca parcial)
   */
  async searchRoomsByName(query: string, limit = 10): Promise<RoomDto[]> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `id, name, created_at, is_private,
           creator:profiles!user_id (name, avatar_url),
           room_members(count)`
        )
        .ilike("name", `%${query}%`)
        .limit(limit)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[roomDao] Erro ao buscar salas:", error)
        return []
      }

      return (data as any[]).map((room) => this.mapToDto(room))
    } catch (error) {
      console.error("[roomDao] Erro inesperado em searchRoomsByName:", error)
      return []
    }
  },

  /**
   * Atualiza o role de um membro na sala
   */
  async updateMemberRole(roomId: string, userId: string, newRole: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      // Verifica se o usuário atual é o criador/admin
      const room = await this.getRoomById(roomId)
      // Implementação simplificada - você pode adicionar verificação de permissões

      const { error } = await supabase
        .from("room_members")
        .update({ role: newRole })
        .eq("room_id", roomId)
        .eq("user_id", userId)

      if (error) {
        throw new Error(this.handleError(error))
      }

      return true
    } catch (error) {
      console.error("[roomDao] Erro ao atualizar role do membro:", error)
      return false
    }
  },
}