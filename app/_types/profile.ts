/**
 * ProfileRow - Mapeamento da tabela 'profiles' do Supabase
 * 
 * Representa UMA LINHA EXATA da tabela profiles no banco de dados.
 * Cada campo corresponde a uma coluna no banco.
 * 
 * RESPONSABILIDADE:
 * - Type-safe interface para dados brutos do Supabase
 * - Documentar estrutura da tabela (quais campos existem, tipos)
 * - Usado por profileDao para fazer queries
 * 
 * SEPARAÇÃO DE CONCEITOS:
 * 
 * Supabase Auth (tabela auth.users):
 * - id, email, email_confirmed_at, password_hash
 * - Gerenciado por supabase.auth (SignUp, Login, etc)
 * 
 * Supabase Data (tabela profiles) ← ProfileRow é AQUI
 * - Dados culturais/sociais do usuário
 * - Username, bio, status, avatar, banner, localização
 * - Gerenciado por profileDao
 * 
 * CAMPOS:
 * 
 * Identificação/Auth:
 * - id: Foreign key para auth.users(id)
 * 
 * Dados básicos de exibição:
 * - name: Nome real do usuário (ex: João Silva)
 * - username: Identificação social única (ex: joao_dev) [único no banco]
 * - avatar_url: URL do avatar (default: /Avatar_default.png)
 * - banner_url?: URL do banner/header visual do perfil
 * 
 * Dados de perfil/bio:
 * - description?: Bio/sobre o usuário (até 500 chars)
 * - location?: Localização do usuário (cidade, país, etc)
 * - status: Disponibilidade (disponivel, ocupado, nao_perturbe, invisivel)
 * 
 * Metadata:
 * - onboarding_complete: Flag se completou o setup inicial
 * - created_at: Data de criação do perfil (ISO string)
 * 
 * FLUXO DE USO:
 * 
 * Supabase (Auth + ProfileRow)
 *     ↓
 * profileDao.fetchProfile() → retorna ProfileRow | null
 *     ↓
 * userDao.mapToDto() → combina User (Auth) + ProfileRow → UserDto
 *     ↓
 * AuthContext.user (UserDto) → useAuth() → componentes
 * 
 * ALTERAÇÕES:
 * Se adicionar novo campo na tabela profiles do Supabase:
 * 1. Adicionar campo aqui em ProfileRow
 * 2. Atualizar profileDao.upsertProfile e profileDao.updateField
 * 3. Atualizar ProfileDto em _interfaces/dto/profile-dto.ts (se for campo social)
 * 4. Atualizar userDao.mapToDto se precisar incluir em UserDto
 */
export interface ProfileRow {
  // Identificação
  id: string;  // Foreign key para auth.users(id)
  
  // Dados de exibição
  name: string;                  // Nome real (ex: João Silva)
  username: string;              // @ único (ex: joao_dev)
  avatar_url: string;            // URL do avatar
  banner_url?: string;           // URL do banner (opcional)
  
  // Dados de perfil
  description?: string;          // Bio/sobre (opcional)
  location?: string;             // Localização (opcional)
  status: 'disponivel' | 'ocupado' | 'nao_perturbe' | 'invisivel';  // Status social
  
  // Metadata
  onboarding_complete: boolean;  // Completou setup?
  created_at: string;            // Data de criação (ISO)
}