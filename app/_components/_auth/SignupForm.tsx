"use client"

import { useState, useEffect } from "react"
import styles from "@/app/styles/auth/signup.module.css"
import { registrarUsuario } from "@/app/lib/Auth" 

interface SignUpProps {
  toggleMobile: () => void;
  onSuccess: (data: { name: string; avatar_url: string }) => void; 
}

export default function SignupForm({ toggleMobile, onSuccess }: SignUpProps) {
  const [file, setFile] = useState<File | null>(null) 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setSenha] = useState("")
  const [name, setNome] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 1. CLEANUP DE MEMÓRIA (Otimizado)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validação Sênior: Tamanho de arquivo (2MB max)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setErrorMsg("A imagem deve ter no máximo 2MB.")
        return
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setErrorMsg(null)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return // Guard clause contra double-tap

    setLoading(true)
    setErrorMsg(null)

    // Higienização de dados
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    try {
      // Chamada da API/Lib
      const novoUsuario = await registrarUsuario({ 
        email: cleanEmail, 
        password, 
        name: cleanName, 
        file 
      })  
      
      // 2. FLUXO DETERMINÍSTICO
      // O sucesso aqui é imediato. O "delay" de leitura agora 
      // é responsabilidade da Page (Home) via WelcomeModal.
      onSuccess({
        name: novoUsuario.name,
        avatar_url: novoUsuario.avatar_url
      })

    } catch (err: unknown) {
      console.error("Erro no cadastro:", err)
      
      // 3. TIPAGEM DE ERRO ROBUSTA
      if (err instanceof Error) {
        const msg = err.message === "User already registered" 
          ? "Este e-mail já está em uso." 
          : "Erro ao cadastrar. Verifique os dados."
        setErrorMsg(msg)
      } else {
        setErrorMsg("Ocorreu um erro inesperado.")
      }
    } finally {
      // 4. GARANTIA DE ESTADO CONSISTENTE
      setLoading(false) 
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSignup}>
      <header className={styles.header}>
        <h1>Crie sua conta</h1>
      </header>

      {errorMsg && (
        <div className={styles.feedbackArea}>
          <div className={styles.errorMessage}>✖ {errorMsg}</div>
        </div>
      )}

      <section className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <label htmlFor="avatar-input" className={styles.avatarLabel}>
            <img 
              src={previewUrl || "/Avatar_default.png"} 
              alt="Preview" 
              className={styles.avatarImage}
            />
            <div className={styles.cameraIcon}>
              <img src="/cenario.png" alt="Trocar foto" />
            </div>
          </label>
          <input 
            id="avatar-input" 
            type="file" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
            className="hidden"
            style={{ display: 'none' }}
          />
        </div>
      </section>

      <fieldset className={styles.inputFields} disabled={loading}>
        <input 
          type="text" 
          placeholder="Nome" 
          value={name} 
          onChange={(e) => setNome(e.target.value)} 
          required 
        />
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
          onChange={(e) => setSenha(e.target.value)} 
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