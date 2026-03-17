"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "@/styles/avatar.header.module.css";
import { useRouter } from "next/navigation"

export default function AvatarHeader() {
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
    <div className={styles.userContainer}> 
  
      <Link href="/perfil" className={styles.avatarWrapper}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Perfil" className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarDefault}>👤</div>
        )}
      </Link>

      <div className={styles.userInfo}>
        <span className={styles.userName}>
          {profile?.nome || "Usuário"}
        </span>
        <button 
          className={styles.logoutBtn} 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/"; 
          }}
        >
          Sair
        </button>
      </div>

    </div>
  );
}