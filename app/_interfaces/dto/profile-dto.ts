/**
 * ProfileDto - Contém as informações socioculturais do usuário.
 * Centralizado no profileDao e editável na página de perfil.
 */
export interface ProfileDto {
  /** Nome de usuário único (@username) */
  username: string;

  /** Bio do perfil */
  description: string;

  /** Estado de presença do usuário */
  status: 'disponivel' | 'ocupado' | 'nao_perturbe' | 'invisivel';

  /** URL do banner do perfil */
  bannerUrl?: string;

  /** Sincronizado com hasCompletedOnboarding no UserDto */
  onboardingComplete: boolean;

  location?: string;
}