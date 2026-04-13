import { profileDao } from "@/app/_interfaces/dao/profile-dao"
import { userDao } from "@/app/_interfaces/dao/user-dao"
import { UserDto } from "@/app/_interfaces/dto/user-dto"

/**
 * waitForSession - Permanece útil para garantir que o cliente Supabase
 * reconheceu o usuário antes de tentarmos qualquer escrita.
 */
async function waitForSession(maxAttempts: number = 20): Promise<boolean> {
  const { supabase } = await import("@/app/_lib/Supa-base")
  
  let attempts = 0
  while (attempts < maxAttempts) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return true

    attempts++
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return false
}

/**
 * setupInitialProfile - Finaliza o perfil que a Trigger criou.
 * * Em vez de "criar", ele "ajusta" os dados iniciais.
 */
export async function setupInitialProfile(
  userId: string,
  name: string
): Promise<UserDto> {
  if (!userId) throw new Error("ID do usuário é obrigatório.")

  try {
    await waitForSession()

    // 1. Atualizamos o perfil que a Trigger já criou
    // Usamos upsert por segurança, mas agora focando em preencher o que falta
    const profile = await profileDao.upsertProfile(userId, {
      name: name,
      username: name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000),
      avatar_url: "/Avatar_default.png",
      onboarding_complete: false, // Ainda falso, pois ele acabou de registrar
    })

    // 2. Recuperamos o usuário do Auth para o mapeamento completo
    const { supabase } = await import("@/app/_lib/Supa-base")
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) throw new Error("Usuário não autenticado.")

    // 3. Usamos o nosso userDao oficial para garantir consistência
    return userDao.mapToDto(authUser, profile)
    
  } catch (err: any) {
    console.error("[authService.setupInitialProfile] Erro:", err)
    throw new Error(`Erro no setup: ${err.message}`)
  }
}
