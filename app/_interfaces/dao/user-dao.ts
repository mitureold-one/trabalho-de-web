import { ProfileRow } from "@/app/_types/profile";
import { UserDto } from "@/app/_interfaces/dto/user-dto";
import { User } from "@supabase/supabase-js";

/**
 * userDao é responsável por converter dados do Supabase Auth + Database em DTOs.
 * * MELHORIAS APLICADAS:
 * 1. Fallback de Metadados: Se o perfil ainda não existir no DB (delay da Trigger), 
 * usa display_name do Auth.
 * 2. Fallback de Data: Usa user.created_at se o perfil for nulo.
 * 3. Tipagem de Status: Cast seguro para o estado de presença.
 */
export const userDao = {

  /**
   * Converte dados do Supabase Auth + Profile em UserDto
   * Mapeia os estágios de cadastro do usuário de forma segura
   */
  mapToDto(user: User, profile?: ProfileRow | null): UserDto {
    // 1. Verificação de Email (Double check: existe data de confirmação?)
    const isEmailConfirmed = !!user.email_confirmed_at;
    
    // 2. Lógica de Onboarding
    // Se não temos profile, ele definitivamente não completou o onboarding.
    const hasCompletedOnboarding = profile?.onboarding_complete || false;

    return {
      id: user.id,
      email: user.email ?? "",
      
      // Prioridade: Data do perfil -> Data de criação do Auth -> Data atual
      createdAt: profile?.created_at || user.created_at || new Date().toISOString(),
      
      /**
       * Dados do perfil mostrados no app:
       * Se o perfil no banco de dados (profiles) ainda não estiver pronto,
       * buscamos nos metadados que o Supabase guarda no Auth.
       */
      name: profile?.name || 
            user.user_metadata?.display_name || 
            user.user_metadata?.name || 
            "Usuário",

      avatarUrl: profile?.avatar_url || 
                 user.user_metadata?.avatar_url || 
                 "/Avatar_default.png",
                 
      bannerUrl: profile?.banner_url || undefined,

      // --- Estágios de ciclo de vida do usuário ---
      
      /** * Verdadeiro se aguarda clique no link do email 
       */
      pendingConfirmation: !isEmailConfirmed,

      /** * Verdadeiro se o usuário está validado para autenticação 
       */
      isConfirmed: isEmailConfirmed,

      /**
       * Crucial para o middleware: indica se o usuário já preencheu 
       * os dados iniciais (/setup)
       */
      hasCompletedOnboarding: hasCompletedOnboarding,

      // --- Objeto de Perfil detalhado ---
      // Só enviamos o sub-objeto se o registro no banco de fato existir
      profile: profile ? {
        username: profile.username || "",
        description: profile.description || "",
        status: (profile.status as any) || 'disponivel',
        bannerUrl: profile.banner_url,
        onboardingComplete: hasCompletedOnboarding
      } : undefined
    };
  },
}