"use client"
import styles from "@/styles//auth/auth.module.css"
import ResetPasswordModal from "./ResetPasswordModal";
import { useState } from "react";

interface ToggleProps {
  ativarLogin: () => void;
  ativarCadastro: () => void;
  // Adicione esta prop para receber a função que vem do componente pai (Auth)
  onOpenReset?: () => void; 
}

export default function TogglePanel({ ativarLogin, ativarCadastro }: ToggleProps) {
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <div className={styles["toggle-container"]}>
      <div className={styles.toggle}>

        <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
          <h1>Chat da Galera!</h1>
          <h2>Seja Bem-vindo!</h2>
          <p>Já é cadastrado? Entre e comece a conversar com a galera!</p>
          <button className={styles.hidden} onClick={ativarLogin}>
            Login
          </button>
        </div>

        <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
          <h1>Chat da Galera!</h1>
          <p>Ainda não tem cadastro? Cadastre-se e comece a conversar!</p>
          <button className={styles.hidden} onClick={ativarCadastro}>
            Registrar
          </button>
        </div>

      </div>

      <ResetPasswordModal 
        isOpen={isResetOpen} 
        onClose={() => setIsResetOpen(false)} 
      />
    </div>
  )
}