import { supabase } from "@/lib/supabase"

// Função auxiliar para traduzir os códigos técnicos do Postgres/Supabase
function handleSupabaseError(error: any): string {
  if (error.code === '23505') return "Já existe uma sala com este nome! 📛";
  if (error.code === '42P01') return "Tabela não encontrada no banco. 🛠️";
  if (error.message?.includes("fetch")) return "Erro de conexão! Verifique sua internet. 🌐";
  if (error.message?.includes("JWT")) return "Sua sessão expirou. Faça login novamente. 🔑";
  
  return error.message || "Ocorreu um erro inesperado.";
}

export async function createRoom(roomName: string, isPrivate: boolean, password?: string | null) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error("Usuário não autenticado")

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      nome: roomName,
      id_user: userData.user.id,
      is_private: isPrivate,
      password: isPrivate ? password : null 
    })
    .select(`
      *,
      creator:profiles!id_user (nome, avatar_url),
      room_members (count)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
// --- O GETROOMS VOLTOU ---
export async function getRooms() {
  const { data, error } = await supabase
    .from("rooms")
    .select(`
      id_room,
      nome,
      created_at,
      is_private,
      id_user,
      creator:profiles!id_user (
        nome,
        avatar_url
      ),
      room_members!room_id (
        count
      )
    `) 
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase:", error);
    throw error;
  }
  return data;
}

export async function joinPublicRoom(roomId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("Você precisa estar logado! 👤");

  const { error } = await supabase
    .from("room_members")
    .upsert({ 
      room_id: roomId, 
      user_id: userData.user.id,
      role: 'member' 
    });

  if (error) throw new Error(handleSupabaseError(error));
  return true;
}

export async function verifyAndJoin(roomId: string, password: string) {
  const { data, error } = await supabase.rpc('join_private_room', {
    target_room_id: roomId,
    typed_password: password
  });

  if (error) throw new Error(handleSupabaseError(error));

  if (data === false) {
    throw new Error("Senha incorreta! Tente novamente. ❌");
  }

  return true;
}

const { data, error } = await supabase
  .from("rooms")
  .select(`
    *,
    creator:profiles!rooms_id_user_fkey (
      nome,
      avatar_url
    ),
    room_members (
      count
    )
  `)
  .order("created_at", { ascending: false });