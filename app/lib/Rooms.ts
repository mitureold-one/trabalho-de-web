import { supabase } from "@/app/lib/Supa-base"
import { Room } from "@/app/types/room"; 

// 1. Tipagem de Erro mais robusta
type SupabaseError = {
  code?: string;
  message?: string;
  details?: string;
}

function handleSupabaseError(error: SupabaseError): string {
  if (error.code === '23505') return "Já existe uma sala com este nome! 📛";
  if (error.code === '42P01') return "Tabela não encontrada no banco. 🛠️";
  if (error.message?.includes("fetch")) return "Erro de conexão! Verifique sua internet. 🌐";
  
  return error.message || "Ocorreu um erro inesperado.";
}

/**
 * CRIAÇÃO DE SALA (Com Validação e Hash)
 */
export async function createRoom(roomName: string, isPrivate: boolean, password?: string | null) {
  const name = roomName.trim();
  
  // Validações de Produto
  if (!name || name.length < 3) throw new Error("Nome da sala deve ter pelo menos 3 caracteres.");
  if (name.length > 50) throw new Error("Nome da sala muito longo.");
  if (isPrivate && (!password || password.length < 4)) {
    throw new Error("Salas privadas exigem uma senha de pelo menos 4 dígitos.");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");

  // DICA SÊNIOR: O hash da senha deve ser feito via RPC ou Trigger no Postgres
  // para garantir que o 'password' nunca fique em texto puro nos logs do banco.
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      name,
      user_id: user.id,
      is_private: isPrivate,
      password: password // Aqui o RLS/Postgres deve cuidar do hash/criptografia
    })
    .select(`id, name, is_private, creator:profiles!user_id (name, avatar_url)`)
    .single();

  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

/**
 * LISTAGEM COM PAGINAÇÃO (Tipada e Higienizada)
 */
export async function getRooms(page = 0, size = 20): Promise<Room[]> {
  const from = page * size;
  const to = from + size - 1;

  const { data, error } = await supabase
    .from("rooms")
    .select(`
      id, name, created_at, is_private,
      creator:profiles!user_id (name, avatar_url)
    `) 
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw new Error(handleSupabaseError(error));

  // O "Pulo do Gato": Transformar o array 'creator' em um objeto único
  return (data as any[]).map(room => ({
    ...room,
    creator: Array.isArray(room.creator) ? room.creator[0] : room.creator
  })) as Room[];
}

/**
 * PARTICIPANTES (Com limite e normalização)
 */
export async function getRoomParticipants(roomId: string, limit = 50) {
  const { data, error } = await supabase
    .from("room_members")
    .select(`
      id, user_id, role, joined_at,
      profiles:user_id (name, avatar_url)
    `)
    .eq("room_id", roomId)
    .limit(limit);

  if (error) throw new Error(handleSupabaseError(error));

  return (data || []).map(member => ({
    membershipId: member.id,
    userId: member.user_id, 
    role: member.role || 'member',
    nome: (member.profiles as any)?.name || "Usuário",
    avatar: (member.profiles as any)?.avatar_url || "/Avatar_default.png",
    joinedAt: member.joined_at
  }));
}

export async function verifyAndJoin(roomId: string, passwordTyped: string) {
  const { data, error } = await supabase.rpc('join_private_room', {
    target_room_id: roomId,
    typed_password: passwordTyped
  });

  if (error) throw new Error(handleSupabaseError(error));
  if (!data) throw new Error("Senha incorreta! Tente novamente. ❌");

  return true;
}