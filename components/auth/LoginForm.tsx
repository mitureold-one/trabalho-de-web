"use client"

import { useState } from "react"
import styles from "@/styles/auth/login.module.css"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface SignInProps {
  onOpenReset: () => void;  
}

export default function LoginForm({ onOpenReset}: SignInProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    })

    if (error) {
      if (error.message === "Invalid login credentials") { 
        setErrorMsg("E-mail ou senha incorretos.")
      } else {
        setErrorMsg("Ocorreu um erro ao entrar. Tente novamente.")
      }
      setLoading(false)
      return
    }
    
    router.push("/salas")
    setLoading(false)
  }

  return (
    <div className={`${styles.formContainer} ${styles.signIn}`}>
        <form onSubmit={login} className={styles.form}>
          <header>
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

          <footer>
            <button 
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </footer>
      </form>
    </div>
  )
}