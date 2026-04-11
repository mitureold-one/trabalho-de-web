import { supabase } from "@/app/lib/Supa-base";
import { MessageDto } from "../dto/message-dto";

export const messageDao = {
  /**
   * ✅ ENVIO BLINDADO (Regra da sua antiga lib)
   */
  async sendMessage(roomId: string, content: string): Promise<MessageDto> {
    const cleanContent = content.trim();

    if (!cleanContent) throw new Error("Mensagem vazia.");
    if (cleanContent.length > 1000) throw new Error("Mensagem muito longa.");

    // Fonte da verdade: Buscamos o user direto do Auth do Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Sessão expirada.");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: cleanContent
      })
      .select('*, author:profiles!user_id(name, avatar_url)') // Join com alias 'author'
      .single();

    if (error) throw error;

    return this.mapToDto(data);
  },

  /**
   * ✅ BUSCA COM PERFORMANCE (Suas regras de limite e paginação)
   */
  async getMessagesByRoom(roomId: string, limit = 50): Promise<MessageDto[]> {
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
      .order("created_at", { ascending: false }) // Buscamos as 50 mais recentes
      .limit(limit);

    if (error) throw error;

    // Invertemos para o chat exibir as antigas em cima e novas embaixo
    return (data as any[]).reverse().map(msg => this.mapToDto(msg));
  },

  /**
   * ✅ CENTRALIZADOR DE MAPEAMENTO
   * Evita repetir código no get, no send e no Realtime
   */
  mapToDto(raw: any): MessageDto {
    // Tratamos o autor (profiles) caso venha como array ou objeto único
    const profile = Array.isArray(raw.author) ? raw.author[0] : raw.author;

    return {
      id: raw.id,
      content: raw.content,
      createdAt: raw.created_at,
      roomId: raw.room_id,
      userId: raw.user_id,
      author: {
        name: profile?.name || "Usuário",
        avatarUrl: profile?.avatar_url || "/Avatar_default.png"
      }
    };
  }
};
