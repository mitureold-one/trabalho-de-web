"use client"

import { useState, useCallback } from "react"
import styles from "@/app/_styles/auth/login.module.css"
import { UserDto } from "@/app/_interfaces/dto/user-dto"
import Mensager from "./Mensager"
import { useLogin } from "@/app/_hooks/useLogin"

interface SignInProps {
  onOpenReset: () => void
  onSuccess: (user: UserDto) => void
  toggleMobile: () => void
}

export default function LoginForm({ onOpenReset, onSuccess, toggleMobile }: SignInProps) {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  const { login, loading, error } = useLogin()

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (loading) return

      const result = await login(email, senha)
      if (result) {
        onSuccess(result)
      }
    },
    [email, senha, login, loading, onSuccess]
  )

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
            Recupere Aqui!
          </button>
        </div>

        {error && <Mensager message={error} />}
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
            <button type="button" className={styles.linkButton} onClick={toggleMobile}>
              Cadastre-se
            </button>
          </p>
        )}
      </footer>
    </form>
  )
}