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

    // 1. Inicia o estado visual de saída
    setIsLoggingOut(true);
    setShowGoodbye(true); 

    try {
      // 2. Aguarda um tempo para o usuário ver o modal de Goodbye (ex: 2 segundos)
      // Usamos uma Promise para garantir que o código espere antes de deslogar
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Executa o logout real no Supabase/AuthContext
      await signOut(); 
      
      // O signOut no seu Context provavelmente já redireciona para "/"
      // então o código abaixo pode nem chegar a rodar, o que é o esperado.
    } catch (error) {
      console.error("Erro ao sair:", error);
      // Se der erro, avisamos o usuário e resetamos a UI
      setIsLoggingOut(false);
      setShowGoodbye(false);
    }
  };

  // Se estiver carregando a sessão inicial ou o usuário sumiu, não renderiza o header
  if (loading && !isLoggingOut) return <div className={styles.loadingSmall}>...</div>;
  if (!user && !showGoodbye) return null;

  return (
    <>
      <aside 
        className={`${styles.userContainer} ${isCollapsed ? styles.collapsed : ""}`} 
        aria-label="Perfil do usuário"
      > 
        <Link href="/profile" className={styles.profileLink}>
          <div className={styles.avatarWrapper}>
            <img 
              src={user?.avatarUrl || "/Avatar_default.png"} 
              alt={`Foto de ${user?.name}`} 
              className={styles.avatarImg} 
              onError={(e) => { e.currentTarget.src = "/Avatar_default.png" }}
            />
          </div>

          {!isCollapsed && (
            <div className={styles.userInfo}>
              <strong className={styles.userName}>
                {user?.name || "Usuário"} 
              </strong>
            </div>
          )}
        </Link>

        <button 
          type="button"
          className={`${styles.logoutBtnRound} ${isLoggingOut ? styles.btnDisabled : ""}`} 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          title="Sair da conta"
        >       
          <img 
            src="/poder.png" 
            alt="Sair" 
            className={isLoggingOut ? styles.spinning : ""} 
          />
        </button>
      </aside>

      {/* Renderizamos o modal passando o nome que já tínhamos para evitar undefined no sumiço do user */}
      <GoodbyeModal 
        isOpen={showGoodbye} 
        userName={user?.name || "Amigo"} 
      />   
    </>
  );
}