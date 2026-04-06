import { supabase } from "./Supa-base"

export interface MessageData {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    name: string
    avatar_url: string
  } | null // Perfil pode ser nulo, mas é UM objeto, não um array
}

/**
 * 1. BUSCA COM PAGINAÇÃO E PERFORMANCE
 * Implementando o padrão de "Últimas 50" para evitar crash em salas grandes.
 */
export async function getMessages(roomId: string, limit = 50) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      room_id,
      user_id,
      content,
      created_at,
      profiles:user_id (name, avatar_url)
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false }) // Buscamos as mais recentes
    .limit(limit)

  if (error) {
    console.error("❌ [Chat Lib] Erro ao carregar mensagens:", error.message)
    throw new Error("Não foi possível carregar o histórico.")
  }
  
  // Invertemos para o chat exibir na ordem natural (antigas em cima, novas embaixo)
  return (data as any[]).reverse() as MessageData[]
}

/**
 * 2. ENVIO BLINDADO (Segurança Nível Sênior)
 * Removemos o user_id dos argumentos para impedir personificação.
 */
export async function sendChatMessage({ content, room_id }: { 
  content: string, 
  room_id: string 
}) {
  const cleanContent = content.trim()

  // Validação de Payload (UX + Segurança)
  if (!cleanContent) return null
  if (cleanContent.length > 1000) {
    throw new Error("Mensagem muito longa (máximo 1000 caracteres).")
  }

  // BUSCA O USER_ID NO SERVIDOR (SUPABASE AUTH)
  // Única forma de garantir que o autor é quem diz ser.
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error("Sessão expirada. Faça login novamente.")
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      room_id,
      user_id: user.id, // Fonte da verdade vem do Auth, não do parâmetro
      content: cleanContent
    })
    .select('id, content, created_at, room_id, user_id, profiles:user_id(name, avatar_url)')
    .single()

  if (error) {
    console.error("❌ [Chat Lib] Erro no insert:", error.message)
    throw new Error("Erro ao enviar. Verifique sua conexão.")
  }

  const formattedData = {
  ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
  } as unknown as MessageData;

  return formattedData;
}