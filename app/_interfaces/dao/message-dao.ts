/**
 * messageDao é responsável CENTRALIZADO por TODAS as operações de mensagens.
 * 
 * Responsabilidades:
 * - Envio de mensagens para o banco
 * - Busca de mensagens (por sala, por usuário, etc)
 * - Edição de mensagens
 * - Deleção de mensagens
 * - Assinatura de mudanças em tempo real (Realtime)
 * - Mapeamento de dados brutos para DTOs
 * 
 * Nenhum componente ou hook faz query direto na tabela "messages".
 * Tudo passa por aqui!
 */
import { supabase } from "@/app/_lib/Supa-base"
import { MessageDto } from "../dto/message-dto"

export const messageDao = {

  // ─── Create ────────────────────────────────────────────────────────────────

  /**
   * Envia uma mensagem para uma sala
   * Validações: conteúdo não vazio, máximo 1000 caracteres
   */
  async sendMessage(roomId: string, content: string): Promise<MessageDto> {
    const cleanContent = content.trim()

    // Validações
    if (!cleanContent) {
      throw new Error("Mensagem vazia.")
    }
    if (cleanContent.length > 1000) {
      throw new Error("Mensagem muito longa (máx 1000 caracteres).")
    }

    // Valida autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Sessão expirada.")
    }

    // Insere mensagem
    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: cleanContent,
      })
      .select("*, author:profiles!user_id(name, avatar_url)")
      .single()

    if (error) {
      console.error("❌ [MessageDao.sendMessage] Error:", error)
      throw new Error("Falha ao enviar mensagem.")
    }

    return this.mapToDto(data)
  },

  // ─── Read ──────────────────────────────────────────────────────────────────

  /**
   * Busca as últimas N mensagens de uma sala
   * Retorna em ordem cronológica (mais antigas primeiro)
   */
  async getMessagesByRoom(roomId: string, limit = 50): Promise<MessageDto[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          author:profiles!user_id (
            name,
            avatar_url
          )
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ [MessageDao.getMessagesByRoom] Error:", error)
        throw new Error("Falha ao buscar mensagens.")
      }

      // Inverte para order cronológica (antigas → novas)
      return (data as any[]).reverse().map((msg) => this.mapToDto(msg))
    } catch (err: any) {
      console.error("❌ [MessageDao.getMessagesByRoom] Exception:", err)
      throw new Error(err.message || "Falha ao buscar mensagens.")
    }
  },

  /**
   * Busca mensagens a partir de uma data (para paginação)
   */
  async getMessagesAfter(roomId: string, fromDate: string, limit = 50): Promise<MessageDto[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          author:profiles!user_id (
            name,
            avatar_url
          )
        `)
        .eq("room_id", roomId)
        .gt("created_at", fromDate)
        .order("created_at", { ascending: true })
        .limit(limit)

      if (error) {
        console.error("❌ [MessageDao.getMessagesAfter] Error:", error)
        throw new Error("Falha ao buscar mensagens.")
      }

      return (data as any[]).map((msg) => this.mapToDto(msg))
    } catch (err: any) {
      console.error("❌ [MessageDao.getMessagesAfter] Exception:", err)
      throw new Error(err.message || "Falha ao buscar mensagens.")
    }
  },

  /**
   * Busca uma mensagem específica por ID
   */
  async getMessageById(messageId: string): Promise<MessageDto | null> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          author:profiles!user_id (
            name,
            avatar_url
          )
        `)
        .eq("id", messageId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("❌ [MessageDao.getMessageById] Error:", error)
        throw error
      }

      return data ? this.mapToDto(data) : null
    } catch (err: any) {
      console.error("❌ [MessageDao.getMessageById] Exception:", err)
      return null
    }
  },

  // ─── Update ────────────────────────────────────────────────────────────────

  /**
   * Edita o conteúdo de uma mensagem
   * Validações: conteúdo não vazio, máximo 1000 caracteres
   */
  async editMessage(messageId: string, newContent: string): Promise<MessageDto> {
    const cleanContent = newContent.trim()

    // Validações
    if (!cleanContent) {
      throw new Error("Mensagem vazia.")
    }
    if (cleanContent.length > 1000) {
      throw new Error("Mensagem muito longa (máx 1000 caracteres).")
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .update({ content: cleanContent, updated_at: new Date().toISOString() })
        .eq("id", messageId)
        .select(`
          *,
          author:profiles!user_id (
            name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error("❌ [MessageDao.editMessage] Error:", error)
        throw new Error("Falha ao editar mensagem.")
      }

      return this.mapToDto(data)
    } catch (err: any) {
      console.error("❌ [MessageDao.editMessage] Exception:", err)
      throw new Error(err.message || "Falha ao editar mensagem.")
    }
  },

  // ─── Delete ────────────────────────────────────────────────────────────────

  /**
   * Deleta uma mensagem
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)

      if (error) {
        console.error("❌ [MessageDao.deleteMessage] Error:", error)
        throw new Error("Falha ao deletar mensagem.")
      }
    } catch (err: any) {
      console.error("❌ [MessageDao.deleteMessage] Exception:", err)
      throw new Error(err.message || "Falha ao deletar mensagem.")
    }
  },

  // ─── Realtime & Helpers ────────────────────────────────────────────────────

  /**
   * Busca o perfil de um autor para display em tempo real
   * Usado pelo useChatMessages no handler de Realtime
   */
  async fetchAuthorProfile(
    userId: string
  ): Promise<{ name: string; avatarUrl: string }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userId)
        .single()

      if (error) {
        console.warn("⚠️ [MessageDao.fetchAuthorProfile] Could not fetch profile:", error)
        return {
          name: "Usuário",
          avatarUrl: "/Avatar_default.png",
        }
      }

      return {
        name: data?.name || "Usuário",
        avatarUrl: data?.avatar_url || "/Avatar_default.png",
      }
    } catch (err) {
      console.warn("⚠️ [MessageDao.fetchAuthorProfile] Exception:", err)
      return {
        name: "Usuário",
        avatarUrl: "/Avatar_default.png",
      }
    }
  },

  // ─── Mapper ────────────────────────────────────────────────────────────────

  /**
   * Mapeia dados brutos do Supabase para MessageDto
   */
  mapToDto(raw: any): MessageDto {
    const profile = Array.isArray(raw.author) ? raw.author[0] : raw.author

    return {
      id: raw.id,
      content: raw.content,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      roomId: raw.room_id,
      userId: raw.user_id,
      author: {
        name: profile?.name || "Usuário",
        avatarUrl: profile?.avatar_url || "/Avatar_default.png",
      },
    }
  },
}