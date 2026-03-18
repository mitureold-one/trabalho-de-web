import { supabase } from "./supabase"
import { uploadAvatar } from "./profile"

interface SignupData {
  email: string
  senha:  string
  nome:   string
  file:   File | null
}

export async function registrarUsuario({ email, senha, nome, file }: SignupData) {
  
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { 
      data: { 
        nome: nome, // Padronizei para 'nome' como usamos no Login
        full_name: nome, 
      } 
    }
  })

  if (signUpError) throw signUpError
  const user = data.user
  if (!user) throw new Error("Erro ao criar usuário.")

  if (file) {
    const avatarUrl = await uploadAvatar(file, user.id)
    
    // 1. Atualiza na sua tabela de 'profiles' (para buscas no banco)
    const { error: updateTableError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id_user", user.id)

    if (updateTableError) {
      console.warn("Erro ao atualizar tabela profiles:", updateTableError.message)
    }

    // 2. O PULO DO GATO: Atualiza o Metadata do AUTH
    // É isso aqui que o LoginForm lê no 'user_metadata'
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    })

    if (updateAuthError) {
      console.warn("Erro ao sincronizar avatar no Auth Metadata:", updateAuthError.message)
    }
  }

  return { user, success: true }
}