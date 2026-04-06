import { supabase } from "./Supa-base"
import { User } from "@supabase/supabase-js"

// 1. Tipagem Estrita para o Banco
export interface ProfileRow {
  name: string
  avatar_url: string
  created_at: string
}

export interface UserData extends ProfileRow {
  uid: string
  email: string | undefined
}

/**
 * MAPPERS: Centraliza a construção do objeto do usuário.
 * Se mudar o schema amanhã, você só mexe aqui.
 */
const mapUserData = (user: User, profile?: ProfileRow | null): UserData => ({
  uid: user.id,
  email: user.email,
  name: profile?.name || user.user_metadata?.name || "Usuário",
  avatar_url: profile?.avatar_url || "/Avatar_default.png",
  created_at: profile?.created_at || new Date().toISOString(),
})

/**
 * REUSABILIDADE: Busca perfil no banco de dados
 */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, avatar_url, created_at")
    .eq("id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("❌ Erro crítico ao buscar perfil:", error.message)
    throw new Error("Falha ao carregar dados do perfil.")
  }

  return data as ProfileRow | null
}

/**
 * SEGURANÇA: Validação de Upload de Avatar
 */
async function uploadAvatar(file: File, userId: string): Promise<string> {
  // Validações básicas (Tamanho e Tipo)
  if (!file.type.startsWith("image/")) throw new Error("Apenas imagens são permitidas.")
  if (file.size > 2 * 1024 * 1024) throw new Error("Imagem muito grande (máx 2MB).")

  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`)

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
  return data.publicUrl
}

/**
 * REGISTRO: Garantindo consistência Atômica (ou quase)
 */
export async function registrarUsuario({ email, password, name, file }: any) {
  // 1. Criação no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error("Erro ao criar credenciais.")

  const user = authData.user
  let avatarUrl = "/Avatar_default.png"

  // 2. Upload condicional
  if (file) {
    try {
      avatarUrl = await uploadAvatar(file, user.id)
    } catch (err) {
      console.warn("⚠️ Upload falhou, seguindo com avatar padrão.", err)
    }
  }

  // 3. Upsert com onConflict explicíto para consistência
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, name, avatar_url: avatarUrl },
      { onConflict: "id" }
    )

  if (profileError) {
    // Aqui em produção você poderia disparar um log para o Sentry
    throw new Error("Conta criada, mas houve um erro ao configurar seu perfil.")
  }

  return mapUserData(user, { name, avatar_url: avatarUrl, created_at: new Date().toISOString() })
}

/**
 * LOGIN E SESSÃO: Usando o Mapper e a busca centralizada
 */
export async function loginUsuario(email: string, pass: string): Promise<UserData> {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: email.trim(), 
    password: pass 
  });

  if (error) {
    throw error; 
  }

  const profile = await fetchProfile(data.user.id);
  return mapUserData(data.user, profile);
}

export async function getSessionUser(): Promise<UserData | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  
  const profile = await fetchProfile(session.user.id)

  return mapUserData(session.user, profile)
}

export async function logoutUsuario() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}