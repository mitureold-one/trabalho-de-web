"use client"

import { useState } from "react"
import styles from "@/styles/auth.module.css"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/profile" 

export default function SignupForm() {
  const [file, setFile] = useState<File | null>(null) 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [nome, setNome] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  async function registrar(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)

  try {
    // 1. Criar o usuário no Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: { 
        data: { nome: nome } 
      }
    })

    if (signUpError) throw signUpError
    const user = data.user

    if (user) {
      let avatarUrl = ""

      // 2. Se o usuário selecionou uma foto, faz o upload para o Storage
      if (file) {
        try {
          avatarUrl = await uploadAvatar(file, user.id)
        } catch (uploadErr) {
          console.error("Erro no upload da imagem:", uploadErr)
          // Se a foto falhar, avisamos mas não travamos o processo se não quiser
          alert("Usuário criado, mas houve um erro ao salvar a foto.")
        }
      }

      // 3. ATUALIZAR os dados na tabela 'profiles'
      // Usamos .update() porque a TRIGGER já criou a linha com o id_user
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nome: nome,
          email: email,
          avatar_url: avatarUrl 
        })
        .eq("id_user", user.id) // Filtra pelo ID do usuário recém-criado

      if (profileError) {
        // Se der erro aqui, pode ser que a trigger ainda não terminou
        // Tentamos um .upsert() como plano B ou lançamos o erro
        throw profileError
      }

      // 4. Limpeza e Feedback
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      alert("Conta criada com sucesso!")
      
    }
  } catch (err: any) {
    console.error("Erro no registro:", err.message)
    alert(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className={`${styles["form-container"]} ${styles["sign-up"]}`}>
      <form onSubmit={registrar}>
        <h1>Crie sua conta</h1>
        
        <div className={styles.avatarContainer}>
          <p>Seu Avatar:</p>
          <label htmlFor="avatar-input" className={styles.avatarLabel}>
            <img 
              src={previewUrl || "/Avatar_default.png"} 
              alt="Avatar Preview" 
              className={styles.avatarImage}
            />
            <div className={styles.cameraIcon}>📸</div>
          </label>
          <input 
            id="avatar-input"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ display: 'none' }} 
          />
        </div>

        <input type="text" placeholder="Nome" onChange={(e) => setNome(e.target.value)} required />
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : "Inscrever-se"}
        </button>
      </form>
    </div>
  )
}