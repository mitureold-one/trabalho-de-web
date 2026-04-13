/**
 * AuthContextType - Interface do contexto de autenticação
 * 
 * Define o estado e operações de autenticação da aplicação.
 * Gerenciado por AuthContext.tsx (AuthProvider).
 * 
 * RESPONSABILIDADES:
 * - Estado: user, loading, flags de estágio de cadastro
 * - Operações: signIn, signUp, signOut, refreshUser
 * - Shortcuts: isAuthenticated, isPendingConfirmation, hasCompletedOnboarding
 * 
 * FLUXO:
 * 1. AuthProvider carrega sessão inicial
 * 2. Componentes acessam via useAuth()
 * 3. SignupForm chama signUp() do AuthContext
 * 4. AuthContext dispara onAuthStateChange → refreshUser → atualiza UserDto
 */

import { Session } from "@supabase/supabase-js"
import { UserDto } from "../dto/user-dto"

export interface AuthContextType {
  // ─── Estado do Usuário ────────────────────────────────────────────────────

  /**
   * Dados do usuário autenticado (null se não autenticado)
   * Inclui: id, email, name, avatar, banner, flags de estágio (pendingConfirmation, isConfirmed, hasCompletedOnboarding), profile
   */
  user: UserDto | null

  /**
   * Flag indicando se está carregando sessão inicial
   * true enquanto busca dados do usuário
   */
  loading: boolean

  // ─── Shortcuts de Estado ──────────────────────────────────────────────────

  /**
   * Verdadeiro se é um usuário autenticado (user !== null)
   */
  isAuthenticated: boolean

  /**
   * Verdadeiro se o email ainda precisa ser confirmado
   * Equivalente a user?.pendingConfirmation
   */
  isPendingConfirmation: boolean

  /**
   * Verdadeiro se completou o setup/onboarding
   * Necessário para /rooms e /chat
   * Equivalente a user?.hasCompletedOnboarding
   */
  hasCompletedOnboarding: boolean

  // ─── Operações de Autenticação ────────────────────────────────────────────

  /**
   * Faz login do usuário com email e senha
   * 
   * @param email - Email do usuário
   * @param pass - Senha
   * @returns UserDto após autenticação bem-sucedida
   * @throws Error se email/senha inválidos ou outro erro
   * 
   * Fluxo:
   * 1. Valida email/senha
   * 2. Chama supabase.auth.signInWithPassword
   * 3. Supabase dispara SIGNED_IN → refreshUser
   * 4. refreshUser busca perfil + mapeia UserDto
   * 5. Returns UserDto completo
   */
  signIn: (email: string, pass: string) => Promise<UserDto>

  /**
   * Faz signup/registro com email e senha
   * Cria usuário em Supabase Auth + perfil inicial via auth-service
   * 
   * @param email - Email do novo usuário
   * @param pass - Senha
   * @returns UserDto após registro bem-sucedido
   * @throws Error se email já cadastrado ou outro erro
   * 
   * Fluxo:
   * 1. Cria usuário via supabase.auth.signUp
   * 2. Cria perfil inicial via auth-service.createUserProfile
   * 3. Supabase dispara SIGNED_IN → refreshUser
   * 4. refreshUser busca perfil + mapeia UserDto
   * 5. Returns UserDto completo
   */
  signUp: (email: string, pass: string) => Promise<UserDto>

  /**
   * Faz logout do usuário
   * 
   * Fluxo:
   * 1. Chama supabase.auth.signOut
   * 2. Supabase dispara SIGNED_OUT → setUser(null)
   * 3. Redireciona para /
   */
  signOut: () => Promise<void>

  /**
   * Atualiza UserDto a partir da sessão
   * Busca perfil do banco + mapeia para UserDto
   * 
   * @param session - Sessão do Supabase (null para logout)
   * @param forceRefresh - Se true, ignora cache e busca ao banco
   * 
   * Uso interno: chamado por onAuthStateChange
   * Uso externo: pode ser necessário forçar refresh (raro)
   */
  // Altere para:
  refreshUser: (session: Session | null, forceRefresh?: boolean) => Promise<UserDto | null>

  /**
   * Invalida o cache do usuário manualmente
   * 
   * USAR QUANDO:
   * - Após editar perfil (nome, avatar, descrição, etc)
   * - Após editar configurações de usuário
   * - Quando há certeza que os dados mudaram
   * 
   * EFEITO:
   * - Próxima requisição buscará dados frescos do banco
   * - Sem invalidar, dados em cache são usados por 5 minutos
   * 
   * EXEMPLO:
   * const { invalidateUserCache } = useAuth()
   * await profileService.atualizarNome(userId, novoNome)
   * invalidateUserCache() // força atualização na próxima conversão
   */
  invalidateUserCache: () => void
}