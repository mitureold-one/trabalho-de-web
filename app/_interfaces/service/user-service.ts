import { profileDao } from "@/app/_interfaces/dao/profile-dao"

/**
 * UserService - Camada de serviço para dados de usuário/perfil
 * 
 * RESPONSABILIDADE: Operações de perfil APENAS
 * 
 * ⚠️ IMPORTANTE - Autenticação é responsabilidade do AuthContext:
 * - SignUp: AuthContext (signup com Supabase Auth)
 * - Login: AuthContext (signIn com Supabase Auth)
 * - Logout: AuthContext (signOut com Supabase Auth)
 * - GetSession: AuthContext (recupera usuário autenticado)
 * 
 * PADRÃO:
 * - Nunca acessa supabase.auth diretamente
 * - SEMPRE usa profileDao para operações de perfil
 * - Valida entrada antes de enviar
 * - Trata erros com mensagens amigáveis
 * 
 * Componentes + AuthContext (auth) → userService (perfil) → profileDao (banco)
 */

/**
 * Atualiza o perfil do usuário autenticado
 * 
 * @param userId - ID do usuário autenticado
 * @param updates - Campos a atualizar (name, username, description, status, etc)
 */
export async function atualizarPerfil(
  userId: string,
  updates: {
    name?: string
    username?: string
    description?: string
    status?: 'disponivel' | 'ocupado' | 'nao_perturbe' | 'invisivel'
    avatar_url?: string
    banner_url?: string
  }
): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("Nenhum campo para atualizar.")
  }

  try {
    await profileDao.upsertProfile(userId, updates)
  } catch (error) {
    console.error("[userService] Erro ao atualizar perfil:", error)
    throw error
  }
}

/**
 * Atualiza o nome do usuário
 */
export async function atualizarNome(userId: string, novoNome: string): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (!novoNome || novoNome.trim().length === 0) {
    throw new Error("O nome não pode estar vazio.")
  }

  try {
    await profileDao.updateName(userId, novoNome.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar nome:", error)
    throw error
  }
}

/**
 * Atualiza o username do usuário
 */
export async function atualizarUsername(userId: string, novoUsername: string): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (!novoUsername || novoUsername.trim().length === 0) {
    throw new Error("O username não pode estar vazio.")
  }

  try {
    await profileDao.updateUsername(userId, novoUsername.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar username:", error)
    throw error
  }
}

/**
 * Atualiza a descrição/bio do usuário
 */
export async function atualizarDescricao(
  userId: string,
  novaDescricao: string
): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (novaDescricao && novaDescricao.length > 500) {
    throw new Error("A descrição não pode exceder 500 caracteres.")
  }

  try {
    await profileDao.updateDescription(userId, novaDescricao.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar descrição:", error)
    throw error
  }
}

/**
 * Atualiza o status do usuário (disponível, ocupado, não perturbe, invisível)
 */
export async function atualizarStatus(
  userId: string,
  novoStatus: 'disponivel' | 'ocupado' | 'nao_perturbe' | 'invisivel'
): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  const statusValidos = ['disponivel', 'ocupado', 'nao_perturbe', 'invisivel']
  if (!statusValidos.includes(novoStatus)) {
    throw new Error("Status inválido.")
  }

  try {
    await profileDao.updateStatus(userId, novoStatus)
  } catch (error) {
    console.error("[userService] Erro ao atualizar status:", error)
    throw error
  }
}

/**
 * Atualiza a localização do usuário
 */
export async function atualizarLocalizacao(
  userId: string,
  novaLocalizacao: string
): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  try {
    await profileDao.updateLocation(userId, novaLocalizacao.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar localização:", error)
    throw error
  }
}

/**
 * Atualiza o avatar do usuário
 */
export async function atualizarAvatar(userId: string, avatarUrl: string): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (!avatarUrl || avatarUrl.trim().length === 0) {
    throw new Error("URL do avatar é obrigatória.")
  }

  try {
    await profileDao.updateAvatar(userId, avatarUrl.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar avatar:", error)
    throw error
  }
}

/**
 * Atualiza o banner do usuário
 */
export async function atualizarBanner(userId: string, bannerUrl: string): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (!bannerUrl || bannerUrl.trim().length === 0) {
    throw new Error("URL do banner é obrigatória.")
  }

  try {
    await profileDao.updateBanner(userId, bannerUrl.trim())
  } catch (error) {
    console.error("[userService] Erro ao atualizar banner:", error)
    throw error
  }
}