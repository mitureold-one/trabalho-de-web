"use client"

import { useState, useCallback } from "react"
import styles from "@/app/_styles/auth/signup.module.css"
import { UserDto } from "@/app/_interfaces/dto/user-dto"
import Mensager from "./Mensager"
import { useSignup } from "@/app/_hooks/useSignup"

interface SignUpProps {
  toggleMobile: () => void
  onSuccess: (user: UserDto) => void
}

export default function SignupForm({ toggleMobile }: SignUpProps) {
  // Estados da UI
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Lógica técnica do hook
  const { signup, validateFormData, loading, error, setError } = useSignup()

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  // No handleSignup dentro do SignupForm.tsx

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (loading) return

      // 1. Limpa estados de feedback antes de começar
      setError(null); 
      setSuccessMsg(null);

      const validationError = validateFormData(email, password, confirmPassword)
      if (validationError) {
        setError(validationError)
        triggerShake()
        return
      }

      const result = await signup(email, password)

      if (result) {
        // ✅ Definimos a mensagem baseada no status real do usuário
        if (result.pendingConfirmation) {
          setSuccessMsg("Conta criada! (Aguardando confirmação de e-mail)")
        } else {
          setSuccessMsg("Conta criada com sucesso! Você já pode entrar.")
        }

        // ✅ Limpamos os campos mas NÃO chamamos onSuccess(result) 
        // para evitar o redirecionamento automático que você não quer.
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        
      } else {
        triggerShake()
      }
    },
    [email, password, confirmPassword, signup, validateFormData, loading, setError]
  )

  return (
    <form className={styles.form} onSubmit={handleSignup}>
      <header className={styles.header}>
        <h1>Crie sua conta</h1>
        <p>Preencha os campos abaixo para criar sua conta</p>
        <p>e comece a falar com a galera</p>
      </header>

      <div className={`${styles.feedbackArea} ${isShaking ? styles.shake : ""}`}>
        {error && <Mensager message={error} />}
        {successMsg && <Mensager message={successMsg} type="success" />}
      </div>

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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </fieldset>

      <footer className={styles.footer}>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Processando..." : "Inscrever-se"}
        </button>

        {!loading && (
          <p className={styles.mobileToggleLink} onClick={toggleMobile}>
            Já tem uma conta? <span className={styles.linkHighlight}>Faça Login</span>
          </p>
        )}
      </footer>
    </form>
  )
}