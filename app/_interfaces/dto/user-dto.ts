import { ProfileDto } from "./profile-dto";

/**
 * UserDto - DTO principal que circula por toda a aplicação.
 * Unifica os dados do Supabase Auth com os metadados do Perfil.
 */
export interface UserDto {
  // Dados básicos (imutáveis ou vindos do Auth)
  id: string;
  email: string;
  createdAt: string;
  
  // Dados rápidos de exibição (Sincronizados com Profile ou Auth)
  name: string;
  avatarUrl: string;
  bannerUrl?: string;

  // --- Flags de Gerenciamento de Fluxo ---
  
  /** Email enviado, esperando confirmação no Supabase */
  pendingConfirmation?: boolean;

  /** Email confirmado, usuário apto a logar */
  isConfirmed?: boolean;

  /** * Determina se o usuário pode sair da rota /setup 
   * e acessar /rooms ou /chat 
   */
  hasCompletedOnboarding?: boolean;

  /** Flag opcional para tratamento de erros de duplicidade */
  alreadyExists?: boolean;

  // Dados detalhados do perfil social
  profile?: ProfileDto;
}