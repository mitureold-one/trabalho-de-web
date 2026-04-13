"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/AuthContext"
import { storageDao } from "@/app/_interfaces/dao/storage-dao" 
import { profileDao } from "@/app/_interfaces/dao/profile-dao"
import styles from "@/app/_styles/profile.module.css"
import { Camera } from "lucide-react"

export default function Perfil() {
  const { user } = useAuth()
  const [nome, setNome] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [updating, setUpdating] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setNome(user.name || "")
      setAvatarUrl(user.avatarUrl || "") 
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    // Deixe o storageDao cuidar das validações se quiser, 
    // mas manter aqui para feedback instantâneo também é bom.
    if (selectedFile.size > 2 * 1024 * 1024) {
      setErrorMsg("Imagem muito grande (máx 2MB).")
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setErrorMsg(null)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      let finalAvatarUrl = avatarUrl

      // 1. Upload via DAO (Toda a sujeira de path e policy sumiu daqui)
      if (file) {
        finalAvatarUrl = await storageDao.uploadAvatar(file, user.id)
      }

      // 2. Update via profileDao (centralizado para todas operações de perfil)
      await profileDao.upsertProfile(user.id, { name: nome.trim(), avatar_url: finalAvatarUrl })

      setAvatarUrl(finalAvatarUrl)
      setFile(null)
      setPreviewUrl("")
      setSuccessMsg("Perfil atualizado com sucesso!")
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao atualizar perfil.")
    } finally {
      setUpdating(false)
    }
  }

  if (!user) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <form onSubmit={handleUpdate}>
          <h1>Meu Perfil</h1>

          {errorMsg && <p className={styles.errorMessage}>{errorMsg}</p>}
          {successMsg && <p className={styles.successMessage}>{successMsg}</p>}

          <div className={styles.avatarContainer}>
            <label htmlFor="avatar-input" className={styles.avatarLabel}>
              <img
                src={previewUrl || avatarUrl || "/Avatar_default.png"}
                className={styles.avatarImage}
                alt="Avatar"
              />
              <div className={styles.cameraIcon}><Camera size={16} /></div>
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <p>Clique na foto para alterar</p>
          </div>

          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            value={user.email || ""}
            disabled
            className={styles.inputDisabled}
          />
          <small>O email não pode ser alterado.</small>

          <button type="submit" disabled={updating}>
            {updating ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  )
}