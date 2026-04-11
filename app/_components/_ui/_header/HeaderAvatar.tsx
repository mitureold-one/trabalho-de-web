"use client";

import { useState } from "react";
import { useAuth } from "@/AuthContext"; 
import Link from "next/link";
import styles from "@/app/styles/ui/avatar.header.module.css";
import GoodbyeModal from "@/app/_components/_auth/GoodByeModal"; 

interface AvatarHeaderProps {
  isCollapsed?: boolean;
}

export default function AvatarHeader({ isCollapsed }: AvatarHeaderProps) {
  const { user, signOut, loading } = useAuth(); 
  const [showGoodbye, setShowGoodbye] = useState(false); 
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setShowGoodbye(true); 
    
    try {
      
      setTimeout(async () => {
        await signOut(); 
      }, 1000);
    } catch (error) {
      console.error("Erro ao sair:", error);
      setIsLoggingOut(false);
      setShowGoodbye(false);
    }
  };

  if (loading) return <div className={styles.loadingSmall}>...</div>;
  if (!user) return null;
  

  return (
    <>
        <aside 
        className={`${styles.userContainer} ${isCollapsed ? styles.collapsed : ""}`} 
        aria-label="Perfil do usuário"
      > 
        {/* O Link deve envolver tudo o que identifica o usuário */}
        <Link href="/profile" className={styles.profileLink}>
          <div className={styles.avatarWrapper}>
            <img 
              src={user.avatarUrl || "/Avatar_default.png"} 
              alt={`Foto de ${user.name}`} 
              className={styles.avatarImg} 
              onError={(e) => { e.currentTarget.src = "/Avatar_default.png" }}
            />
          </div>

          {!isCollapsed && (
            <div className={styles.userInfo}>
              <strong className={styles.userName}>
                {user.name || "Usuário"} 
              </strong>
            </div>
          )}
        </Link>

        {/* O botão de Logout fica de fora do Link para não disparar a navegação */}
        <button 
          type="button"
          className={`${styles.logoutBtnRound} ${isLoggingOut ? styles.btnDisabled : ""}`} 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          title="Sair da conta"
        >
        
          <img src="/poder.png" alt="Sair" />
        </button>
      </aside>

      <GoodbyeModal 
        isOpen={showGoodbye} 
        userName={user.name} 
        />

    
    </>
  );
}