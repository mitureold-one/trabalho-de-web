"use client"

import styles from "@/styles/auth/toggle.module.css" 

// 1. TIPAGEM PROFISSIONAL (Adeus, any!)
interface TogglePanelProps {
  active: boolean;
  onLogin: () => void;
  onSignup: () => void;
}

export default function TogglePanel({ active, onLogin, onSignup }: TogglePanelProps) {
  
  const title = "Chat da Galera!" // 2. DRY: Constante única para manutenção rápida
  const containerClasses = `${styles.toggleContainer} ${active ? styles.active : ""}`;

  return (
    <div className={containerClasses} aria-hidden="true"> 
      <div className={styles.toggle}>
        
        {/* Painel Esquerdo (Convite para Login) */}
        <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
          <h1>{title}</h1>
          <h2>Seja Bem-vindo!</h2>
          <p>Já é cadastrado? Entre e comece a conversar com a galera!</p>
          
          <button 
            type="button" // 3. SEGURANÇA: Evita submit acidental do form pai
            className={styles.buttonGhost} 
            onClick={onLogin}
            aria-label="Ir para tela de login" // 4. ACESSIBILIDADE (A11y)
          >
            Login
          </button>
        </div>

        {/* Painel Direito (Convite para Cadastro) */}
        <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
          <h1>{title}</h1>
          <p>Ainda não tem cadastro? Cadastre-se e comece a conversar!</p>
          
          <button 
            type="button"
            className={styles.buttonGhost} 
            onClick={onSignup}
            aria-label="Ir para tela de cadastro"
          >
            Registrar
          </button>
        </div>

      </div>
    </div>
  )
}