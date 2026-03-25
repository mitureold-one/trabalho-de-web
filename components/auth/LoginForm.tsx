"use client"

import { useState } from "react"
import { useAuth } from "@/AuthContext" 
import styles from "@/styles/auth/login.module.css"

interface SignInProps {
  onOpenReset: () => void;  
  onSuccess: () => void; 
  toggleMobile: () => void; 
}

export default function LoginForm({ onOpenReset, onSuccess, toggleMobile }: SignInProps) {
  const { signIn } = useAuth() 
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent)
  {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      await signIn(email.trim().toLowerCase(), senha);
      
      onSuccess(); 
    } catch (error: any) {

      const errorMessage = error.error_description || error.message || "";
      
      const isAuthError = 
        errorMessage.includes("Invalid login credentials") || 
        error.status === 400;

      if (isAuthError) {
        setErrorMsg("E-mail ou senha incorretos.");
      } else {
        setErrorMsg("Erro ao entrar. Tente novamente.");
      }
    } finally {
      
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <header className={styles.header}>
        <h1>Login</h1>
      </header>
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