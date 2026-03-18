"use client"
import styles from "@/styles/auth/toggle.module.css" 

export default function TogglePanel({ active, ativarLogin, ativarCadastro }: any) {
  
  const containerClasses = `${styles.toggleContainer} ${active ? styles.active : ""}`;

  return (
    <div className={containerClasses}>
      <div className={styles.toggle}>
        
        <div className={`${styles.togglePanel} ${styles.toggleLeft}`}>
          <h1>Chat da Galera!</h1>
          <h2>Seja Bem-vindo!</h2>
          <p>Já é cadastrado? Entre e comece a conversar com a galera!</p>
          
          
          <button className={styles.buttonGhost} onClick={ativarLogin}>
            Login
          </button>
        </div>


        <div className={`${styles.togglePanel} ${styles.toggleRight}`}>
          <h1>Chat da Galera!</h1>
          <p>Ainda não tem cadastro? Cadastre-se e comece a conversar!</p>
          <button className={styles.buttonGhost} onClick={ativarCadastro}>
            Registrar
          </button>
        </div>

      </div>
    </div>
  )
}