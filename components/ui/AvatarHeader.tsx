"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "@/styles/header.module.css";

export default function AvatarHeader() {
  const [profile, setProfile] = useState<{ nome: string; avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
    <Link href="/perfil" className={styles.profileLink}>
      <span className={styles.userName}>{profile?.nome || "Usuário"}</span>
      <div className={styles.avatarWrapper}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Perfil" className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarDefault}>👤</div>
        )}
      </div>
    </Link>
  );
}