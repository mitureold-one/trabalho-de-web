"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "@/styles/ui/avatar.header.module.css";
import { useRouter } from "next/navigation"

// Adicione a interface para a prop
interface AvatarHeaderProps {
  isCollapsed?: boolean;
}

export default function AvatarHeader({ isCollapsed }: AvatarHeaderProps) {
  const [profile, setProfile] = useState<{ nome: string; avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    router.push("/");             
    router.refresh();              
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("nome, avatar_url")
            .eq("id_user", user.id)
            .single();

          if (data) setProfile(data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) return <div className={styles.loadingSmall}>...</div>;

  return (
    /* Adicionamos a classe 'collapsed' dinamicamente ao container */
    <aside 
      className={`${styles.userContainer} ${isCollapsed ? styles.collapsed : ""}`} 
      aria-label="Perfil do usuário"
    > 
      
      <Link href="/perfil" className={styles.profileLink}>
        <div className={styles.avatarWrapper}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={`Foto de ${profile?.nome}`} 
              className={styles.avatarImg} 
            />
          ) : (
            <div className={styles.avatarDefault}>👤</div>
          )}
        </div>

        {/* Só mostra o nome se NÃO estiver colapsado */}
        {!isCollapsed && (
          <div className={styles.userInfo}>
            <strong className={styles.userName}>
              {profile?.nome || "Usuário"}
            </strong>
          </div>
        )}
      </Link>

      <button 
        type="button"
        className={styles.logoutBtnRound} 
        onClick={handleLogout} 
        title="Sair da conta"
      >
        ⏻
      </button>

    </aside>
  );
}