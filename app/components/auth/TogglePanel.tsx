import styles from "../../styles/auth.module.css"

export default function TogglePanel({ ativarLogin, ativarCadastro }: any) {

  return (
    <div className={styles["toggle-container"]}>
      <div className={styles.toggle}>

        <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
          <h1>Chat da Galera !</h1>
          <h2>Seja Bem-vindo !</h2>
          <p>Já é cadastro ? Entre e comece a conversar com a galera !</p>

          <button onClick={ativarLogin}>
            Login
          </button>
        </div>

        <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
          <h1>Chat da Galera!</h1>
          <p>Ainda não tem cadastro ? Cadastre-se e comece a conversar com a galera !</p>

          <button onClick={ativarCadastro}>
            Registrar
          </button>
        </div>

      </div>
    </div>
  )
}