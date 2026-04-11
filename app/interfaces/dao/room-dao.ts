import { supabase } from "@/app/lib/Supa-base";
import { RoomDto } from "../dto/room-dto";
import { MemberDto } from "../dto/member-dto";
import { RoomMemberQueryResult } from "../util/RoomMember";

export const roomDao = {
  // ✅ Central de Erros
  handleError(error: any): string {
    if (error.code === '23505') return "Já existe uma sala com este nome! 📛";
    if (error.message?.includes("fetch")) return "Erro de conexão! 🌐";
    return error.message || "Erro inesperado.";
  },

  /**
   * ✅ LISTAGEM DE PARTICIPANTES
   */
  async getParticipants(roomId: string): Promise<MemberDto[]> {
    const { data, error } = await supabase
      .from("room_members")
      .select(`
        role,
        joined_at,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq("room_id", roomId);

    if (error) throw new Error(this.handleError(error));

    const rawData = data as unknown as RoomMemberQueryResult[];

    return rawData.map(item => ({
      userId: item.profiles?.id || "desconhecido",
      name: item.profiles?.name || "Usuário",
      avatarUrl: item.profiles?.avatar_url || "/Avatar_default.png",
      role: item.role,
      joinedAt: item.joined_at
    }));
  },

  /**
   * ✅ CRIAÇÃO DE SALA
   */
  async createRoom(name: string, isPrivate: boolean, password?: string): Promise<RoomDto> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sessão expirada.");

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: name.trim(),
        user_id: user.id,
        is_private: isPrivate,
        password: password 
      })
      .select(`id, name, is_private, created_at, creator:profiles!user_id (name, avatar_url)`)
      .single();

    if (error) throw new Error(this.handleError(error));
    return this.mapToDto(data);
  },

  /**
   * ✅ LISTAGEM PAGINADA DE SALAS
   */
  async getRooms(page = 0, size = 20): Promise<RoomDto[]> {
    const from = page * size;
    const to = from + size - 1;

    const { data, error } = await supabase
      .from("rooms")
      .select(`id, name, created_at, is_private, creator:profiles!user_id (name, avatar_url)`)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw new Error(this.handleError(error));
    return (data as any[]).map(room => this.mapToDto(room));
  },

  /**
   * ✅ ENTRAR EM SALA PRIVADA (RPC)
   */
  async verifyAndJoin(roomId: string, passwordTyped: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('join_private_room', {
    target_room_id: roomId,
    typed_password: passwordTyped
  });

  if (error) throw new Error(this.handleError(error));

  if (data === false) {
    throw new Error("Senha incorreta! ❌");
  }

  return true;
  },

  /**
   * ✅ MAPEADOR DE SALAS
   */
  mapToDto(raw: any): RoomDto {
    const creatorData = Array.isArray(raw.creator) ? raw.creator[0] : raw.creator;
    return{
      id: raw.id,
      name: raw.name,
      isPrivate: raw.is_private,
      createdAt: raw.created_at,
      creator: {
        name: creatorData?.name || "Criador Desconhecido",
        avatarUrl: creatorData?.avatar_url || "/Avatar_default.png"
      }
    };
  }
};

