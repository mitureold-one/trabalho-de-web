"use client"

import { useState } from "react"
import styles from "@/styles/auth/signup.module.css"
import { registrarUsuario } from "@/lib/auth" 

interface SignUpProps {
  toggleMobile: () => void; 
}

export default function SignupForm({ toggleMobile }: SignUpProps) {
  const [file, setFile] = useState<File | null>(null) 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [nome, setNome] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null) 
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Cria a URL temporária para mostrar a foto antes de subir
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      await registrarUsuario({ email, senha, nome, file })
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSuccessMsg("Conta criada! Verifique seu e-mail.");
      setErrorMsg("");
    } catch (err: any) {
      const msg = err.message === "User already registered" 
        ? "Este e-mail já está em uso." 
        : "Erro ao cadastrar. Tente novamente.";
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSignup}>
      <header className={styles.header}>
        <h1>Crie sua conta</h1>
      </header>

      {/* FEEDBACK DE SUCESSO OU ERRO */}
      {successMsg && <div className={styles.successMessage}>✔ {successMsg}</div>}
      {errorMsg && <span className={styles.errorMessage}>{errorMsg}</span>}

      <section className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <label htmlFor="avatar-input" className={styles.avatarLabel}>
            <img 
              src={previewUrl || "/Avatar_default.png"} 
              alt="Avatar Preview" 
              className={styles.avatarImage}
            />
            {/* Opcional: Um ícone de câmera que aparece no CSS */}
            <div className={styles.cameraIcon}>📸</div>
          </label>

          <input 
            id="avatar-input" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} /* Esconde o botão original */
          />
          <p>Escolha sua foto</p>
        </div>
      </section>

      <fieldset className={styles.inputFields}>
        <input 
          type="text" 
          placeholder="Nome" 
          value={nome} 
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
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          required 
        />
      </fieldset>

      <footer className={styles.footer}>
        <button 
          type="submit" 
          disabled={loading} 
          className={styles.button}
        >
          {loading ? "Processando..." : "Inscrever-se"}
        </button>

        <p className={styles.mobileToggleLink}>
          Já tem uma conta?{" "}
          <span className={styles.linkHighlight} onClick={toggleMobile}>
            Faça Login
          </span>
        </p>
      </footer>
    </form>
  )
}