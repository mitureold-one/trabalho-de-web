"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "@/styles/ui/avatar.header.module.css";
import GoodbyeModal from "@/components/auth/goodbyModal"; 

interface AvatarHeaderProps {
  isCollapsed?: boolean;
}

export default function AvatarHeader({ isCollapsed }: AvatarHeaderProps) {
  const [profile, setProfile] = useState<{ nome: string; avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoodbye, setShowGoodbye] = useState(false); 
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Trava o botão

  const handleLogout = async () => {
    if (isLoggingOut) return; // Evita cliques duplos

    setIsLoggingOut(true);
    setShowGoodbye(true);

    setTimeout(async () => {
      try {
        await supabase.auth.signOut();
        // Substitui o histórico para matar o botão "Voltar"
        window.location.replace("/"); 
      } catch (error) {
        console.error("Erro ao deslogar:", error);
        setIsLoggingOut(false);
        setShowGoodbye(false);
      }
    }, 3500); 
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
    <>
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
          disabled={isLoggingOut} // Desabilita enquanto desloga
          title="Sair da conta"
          style={{ opacity: isLoggingOut ? 0.5 : 1, cursor: isLoggingOut ? 'not-allowed' : 'pointer' }}
        >
          <img src="/poder.png" alt="botão de sair" />
        </button>
      </aside>

      <GoodbyeModal 
        isOpen={showGoodbye} 
        userName={profile?.nome || "Usuário"} 
      />
    </>
  );
}