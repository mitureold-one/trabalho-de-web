"use client"

import { useState } from "react"
import styles from "@/styles/auth/login.module.css"
import { supabase } from "@/lib/supabase"

interface SignInProps {
  onOpenReset: () => void;  
  onSuccess: (data: { nome: string; avatar_url: string }) => void;
  toggleMobile: () => void; 
}

export default function LoginForm({ onOpenReset, onSuccess, toggleMobile }: SignInProps) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) {
      if (error.message === "Invalid login credentials") { 
        setErrorMsg("E-mail ou senha incorretos.");
      } else {
        setErrorMsg("Ocorreu um erro ao entrar. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    if (data?.user) {
      const userData = {
        nome: data.user.user_metadata?.nome || "Usuário",
        avatar_url: data.user.user_metadata?.avatar_url || "/Avatar_default.png"
      };

      // Dá 500ms para o navegador "respirar" e gravar o cookie
      setTimeout(() => {
        onSuccess(userData); 
      }, 500); 
    }
    setLoading(false);
      }

  return (
    /* Removi styles.formContainer e styles.signIn daqui para não conflitar com o pai */
    <form onSubmit={login} className={styles.form}>
      <header className={styles.header}>
        <h1>Login</h1>
      </header>
    
      <fieldset className={styles.inputFields}>
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

        <p className={styles.forgotPassword}>
          Esqueceu a senha?{" "}
          <span 
            className={styles.linkHighlight} 
            onClick={onOpenReset} 
          >
            Recupere Aqui !
          </span>
        </p>

        {errorMsg && (
          <span className={styles.errorMessage}>
            {errorMsg}
          </span>
        )}
      </fieldset>

      <footer className={styles.footer}>
        <button 
          type="submit"
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className={styles.mobileToggleLink}>
          Não tem uma conta?{" "}
          <span className={styles.linkHighlight} onClick={toggleMobile}>
            Cadastre-se
          </span>
        </p>
      </footer>
    </form>
  )
}