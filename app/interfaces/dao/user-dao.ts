import { supabase } from "@/app/lib/Supa-base";
import { ProfileRow } from "@/app/interfaces/util/profilerow"; 
import { UserDto } from "@/app/interfaces/dto/user-dto";
import { User } from "@supabase/supabase-js";

export const userDao = {

  // O Mapper agora usa a interface centralizada
  mapToDto(user: User, profile?: ProfileRow | null): UserDto {
    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name || "Usuário",
      avatarUrl: profile?.avatar_url || "/Avatar_default.png",
      createdAt: profile?.created_at || new Date().toISOString(),
    };
  },

  async fetchProfile(userId: string): Promise<ProfileRow | null>
    {
        const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

        if (error && error.code !== "PGRST116") throw error;
        return data as ProfileRow | null;
    },

  async upsertProfile(id: string, name: string, avatarUrl: string): Promise<void>
    {
        const profileData: Partial<ProfileRow> = {
            id,
            name,
            avatar_url: avatarUrl, 
            // created_at geralmente o banco gera sozinho, por isso usamos Partial
        };

        const { error } = await supabase
            .from("profiles")
            .upsert(profileData, { onConflict: "id" });

        if (error) {
            console.error("❌ [UserDao.upsertProfile]:", error);
            throw new Error(`Falha ao sincronizar perfil no banco.`);
        }
    }
};