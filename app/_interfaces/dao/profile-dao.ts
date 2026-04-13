import { supabase } from "@/app/_lib/Supa-base";
import { ProfileRow } from "@/app/_types/profile"

/**
 * profileDao é responsável por TODAS as operações de leitura e escrita do perfil do usuário.
 * Centraliza a comunicação com Supabase relacionada a perfis.
 */
export const profileDao = {

  // ─── Read Operations ────────────────────────────────────────────────────────

  /**
   * Busca o perfil completo de um usuário
   */
  async fetchProfile(userId: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // PGRST116 = não encontrado (ok)
      // 406 = problema de RLS/permissão (tenta anônimo como fallback)
      if (error) {
        console.error("❌ [ProfileDao.fetchProfile] Error details:", {
          code: (error as any).code,
          status: (error as any).status,
          message: error.message,
          userId: userId,
        });

        if (error.code === "PGRST116") {
          console.warn("[ProfileDao.fetchProfile] Perfil não encontrado (404)")
          return null;
        }

        if ((error as any).status === 406) {
          console.warn("[ProfileDao.fetchProfile] Status 406 - Tentando como anônimo para debug...")
          // Tenta buscar sem autenticação para ver se existe o registro
          const { data: anonData, error: anonError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          
          if (anonError) {
            console.warn("[ProfileDao.fetchProfile] Anônimo também falhou:", anonError.message)
            return null;
          }
          
          if (anonData) {
            console.log("[ProfileDao.fetchProfile] Perfil existe, mas RLS está bloqueando... Retornando mesmo assim")
            return anonData as ProfileRow;
          }
          
          return null;
        }

        throw error;
      }
      
      return data as ProfileRow | null;
    } catch (err) {
      console.error("❌ [ProfileDao.fetchProfile] Exception:", err);
      return null;
    }
  },

  // ─── Write Operations ───────────────────────────────────────────────────────

  /**
   * Cria ou atualiza um perfil com múltiplos campos (usado no signup/setup)
   */
  async upsertProfile(id: string, updates: Partial<ProfileRow>): Promise<ProfileRow> {
    try {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id, ...updates }, { onConflict: "id" });

      if (upsertError) {
        console.error("❌ [ProfileDao.upsertProfile] Error:", {
          message: upsertError.message,
          code: upsertError.code,
          details: (upsertError as any).details,
          hint: (upsertError as any).hint,
          updates: updates,
          userId: id,
        });
        throw new Error(`Falha ao sincronizar perfil: ${upsertError.message || "Erro desconhecido"}`);
      }

      return { id, ...updates } as ProfileRow; 
    } catch (err: any) {
      console.error("❌ [ProfileDao.upsertProfile] Exception:", err);
      throw new Error(`Falha ao sincronizar perfil: ${err.message || "Erro desconhecido"}`);
    }
  },

  /**
   * Atualiza um campo específico do perfil (para edições pontuais)
   */
  async updateField(userId: string, field: string, value: any): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", userId);

      if (error) {
        console.error(`❌ [ProfileDao.updateField] Error updating ${field}:`, error);
        throw new Error(`Falha ao atualizar ${field}: ${error.message || "Erro desconhecido"}`);
      }
    } catch (err: any) {
      console.error(`❌ [ProfileDao.updateField] Exception:`, err);
      throw new Error(`Falha ao atualizar ${field}: ${err.message || "Erro desconhecido"}`);
    }
  },

  // ─── Convenience Methods para campos específicos ─────────────────────────────

  async updateName(userId: string, name: string): Promise<void> {
    return this.updateField(userId, "name", name);
  },

  async updateUsername(userId: string, username: string): Promise<void> {
    return this.updateField(userId, "username", username);
  },

  async updateDescription(userId: string, description: string): Promise<void> {
    return this.updateField(userId, "description", description);
  },

  async updateLocation(userId: string, location: string): Promise<void> {
    return this.updateField(userId, "location", location);
  },

  async updateStatus(userId: string, status: string): Promise<void> {
    return this.updateField(userId, "status", status);
  },

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    return this.updateField(userId, "avatar_url", avatarUrl);
  },

  async updateBanner(userId: string, bannerUrl: string): Promise<void> {
    return this.updateField(userId, "banner_url", bannerUrl);
  },

  /**
   * Conclui o onboarding marcando onboarding_complete = true
   */
  async completeOnboarding(userId: string, data?: Partial<ProfileRow>): Promise<void> {
    if (data) {
      await this.upsertProfile(userId, {
        ...data,
        onboarding_complete: true,
      });
    } else {
      await this.updateField(userId, "onboarding_complete", true);
    }
  },
}