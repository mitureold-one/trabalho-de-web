"use client"
import styles from "@/styles/auth.module.css"

interface ToggleProps {
  ativarLogin: () => void;
  ativarCadastro: () => void;
}

export default function TogglePanel({ ativarLogin, ativarCadastro }: ToggleProps) {
  return (
    <div className={styles["toggle-container"]}>
      <div className={styles.toggle}>

        {/* PAINEL QUE APARECE NO CADASTRO (LADO ESQUERDO) */}
        <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
          <h1>Chat da Galera!</h1>
          <h2>Seja Bem-vindo!</h2>
          <p>Já é cadastrado? Entre e comece a conversar com a galera!</p>
          <button className={styles.hidden} onClick={ativarLogin}>
            Login
          </button>
        </div>

        {/* PAINEL QUE APARECE NO LOGIN (LADO DIREITO) */}
        <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
          <h1>Chat da Galera!</h1>
          <p>Ainda não tem cadastro? Cadastre-se e comece a conversar!</p>
          <button className={styles.hidden} onClick={ativarCadastro}>
            Registrar
          </button>
        </div>

      </div>
    </div>
  )
}