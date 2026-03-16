"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/profile" 
import styles from "@/styles/auth.module.css" 
import { Camera } from "lucide-react"

export default function Perfil() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("nome, email, avatar_url")
          .eq("id_user", user.id)
          .single()

        if (data) {
          setNome(data.nome)
          setEmail(data.email)
          setAvatarUrl(data.avatar_url)
        }
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let newAvatarUrl = avatarUrl

      if (file) {
        newAvatarUrl = await uploadAvatar(file, user.id)
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          nome: nome,
          avatar_url: newAvatarUrl
        })
        .eq("id_user", user.id)

      if (error) throw error
      
      setAvatarUrl(newAvatarUrl)
      alert("Perfil atualizado com sucesso!")
      window.location.reload() 
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className={styles.page}>Carregando...</div>

  return (
    <div className={styles.page}>
      <div className={styles.container} style={{ minHeight: '400px', padding: '40px' }}>
        <form onSubmit={handleUpdate}>
          <h1>Meu Perfil</h1>
          
          <div className={styles.avatarContainer}>
            <label htmlFor="avatar-input" className={styles.avatarLabel}>
              <img 
                src={previewUrl || avatarUrl || "/default-avatar.png"} 
                className={styles.avatarImage} 
                alt="Avatar" 
              />
              <div className={styles.cameraIcon}><Camera size={16} /></div>
            </label>
            <input 
              id="avatar-input" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <p>Clique na foto para alterar</p>
          </div>
          <div>
            <p>A Sua Galera !</p>
            <p>Seus conversas</p>
          </div>

          <input 
            type="text" 
            placeholder="Seu nome" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
          />
          
          <input 
            type="email" 
            value={email} 
            disabled 
            style={{ opacity: 0.6, cursor: 'not-allowed' }} 
          />
          <small style={{ color: '#aaa', marginBottom: '15px' }}>O email não pode ser alterado.</small>

          <button type="submit" disabled={updating}>
            {updating ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  )
}