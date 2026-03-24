"use client"

import { useState } from "react"
import { useAuth } from "@/AuthContext" // 1. Usando o Poder Central
import styles from "@/styles/auth/login.module.css"

interface SignInProps {
  onOpenReset: () => void;  
  onSuccess: () => void; // Removi o envio de dados, o contexto já os tem
  toggleMobile: () => void; 
}

export default function LoginForm({ onOpenReset, onSuccess, toggleMobile }: SignInProps) {
  const { signIn } = useAuth() // Consumindo a central de verdade
  
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    // 2. Blindagem contra múltiplos submits
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 3. Higienização e Uso do Contexto
      // O componente agora é agnóstico à implementação (Firebase/API)
      await signIn(email.trim().toLowerCase(), senha);
      
      // Se chegou aqui, o AuthContext já atualizou o estado global 'user'
      onSuccess(); 
    } catch (error: unknown) {
      console.error("Login Error:", error);

      // 4. Tipagem Segura (Unknown -> Error)
      if (error instanceof Error) {
        const msg = error.message === "Invalid login credentials" 
          ? "E-mail ou senha incorretos." 
          : "Erro ao entrar. Tente novamente mais tarde.";
        setErrorMsg(msg);
      } else {
        setErrorMsg("Ocorreu um erro inesperado.");
      }
    } finally {
      // 5. Garantia de consistência da UI
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <header className={styles.header}>
        <h1>Login</h1>
      </header>
    
      {/* 6. Consistência: Fieldset desabilitado como no Signup */}
      <fieldset className={styles.inputFields} disabled={loading}>
        <input
          type="email"
          placeholder="Email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha} 
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <div className={styles.forgotPassword}>
          Esqueceu a senha?{" "}
          {/* 7. Acessibilidade: Botão em vez de span */}
          <button 
            type="button"
            className={styles.linkButton} 
            onClick={onOpenReset}
            disabled={loading}
          >
            Recupere Aqui !
          </button>
        </div>

        {errorMsg && (
          <span className={styles.errorMessage} role="alert">
            {errorMsg}
          </span>
        )}
      </fieldset>

      <footer className={styles.footer}>
        <button 
          type="submit"
          disabled={loading || !email || !senha}
          className={styles.button}
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>

        {!loading && (
          <p className={styles.mobileToggleLink}>
            Não tem uma conta?{" "}
            <button 
              type="button"
              className={styles.linkButton} 
              onClick={toggleMobile}
            >
              Cadastre-se
            </button>
          </p>
        )}
      </footer>
    </form>
  )
}