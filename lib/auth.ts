import { supabase } from "./supabase"
import { uploadAvatar } from "./profile"

interface SignupData {
  email: string
  senha:  string
  nome:   string
  file:   File | null
}

export async function registrarUsuario({ email, senha, nome, file }: SignupData) {
  // 1. Criar o usuário no Auth (A Trigger vai criar o profile automaticamente)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { 
      data: { 
        full_name: nome, // A Trigger geralmente pega o nome daqui
      } 
    }
  })

  if (signUpError) throw signUpError
  const user = data.user
  if (!user) throw new Error("Erro ao criar usuário.")

  // 2. Se o usuário enviou foto, atualizamos o profile que a Trigger acabou de criar
  if (file) {
    const avatarUrl = await uploadAvatar(file, user.id)
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id_user", user.id)

    if (updateError) {
      console.warn("Usuário criado, mas erro ao atualizar avatar:", updateError.message)
    }
  }

  return { user, success: true }
}