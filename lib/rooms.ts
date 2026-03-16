import { supabase } from "@/lib/supabase"

export async function createRoom(roomName: string, isPrivate: boolean) {

  if(!roomName.trim()){
    throw new Error("Digite um nome para a sala")
  }

  const { data:userData, error:userError } = await supabase.auth.getUser()

  if(userError || !userData?.user){
    throw new Error("Usuário não autenticado")
  }

  const userId = userData.user.id

  const { error } = await supabase
    .from("rooms")
    .insert({
      nome: roomName,
      id_user: userId,
      is_private: isPrivate
    })

  if(error){
    throw error
  }
}

export async function getRooms() {

  const { data, error } = await supabase
    .from("rooms")
    .select(`
      *,
      creator:profiles!rooms_id_user_fkey (
        nome
      )
    `)
    .order("created_at", { ascending:false })

  if(error){
    throw error
  }
  return data

  
}