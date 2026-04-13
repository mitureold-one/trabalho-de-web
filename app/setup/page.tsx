"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/AuthContext"
import styles from "@/app/_styles/setup.module.css"
import { storageDao } from "@/app/_interfaces/dao/storage-dao"
import AvatarBanner from "../_components/_setup/avatarBanner"
import { profileDao } from "../_interfaces/dao/profile-dao"
import { ProfileRow } from "../_types/profile"
import { supabase } from "../_lib/Supa-base"

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível", emoji: "🟢", desc: "Online e aberto pra conversa" },
  { value: "ocupado", label: "Ocupado", emoji: "🟡", desc: "Online mas sem muito tempo" },
  { value: "nao_perturbe", label: "Não perturbe", emoji: "🔴", desc: "Não quer ser interrompido" },
  { value: "invisivel", label: "Invisível", emoji: "⚫", desc: "Aparece como offline" },
]

const STEPS = ["Avatar & Banner", "Identidade", "Sobre você"]

export default function SetupPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("/Avatar_default.png")
  const [bannerPreview, setBannerPreview] = useState("")

  const [name, setName] = useState("")
  const [username, setUsername] = useState("") // Estado local para o input
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("disponivel")

  // --- CORREÇÃO AQUI: Popula campos usando a estrutura real do UserDto ---
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      // O username vive dentro do objeto profile no seu DTO
      setUsername(user.profile?.username || "") 
      setAvatarPreview(user.avatarUrl || "/Avatar_default.png")
      setBannerPreview(user.bannerUrl || "")
      setDescription(user.profile?.description || "")
      setLocation(user.profile?.location || "")
    }
  }, [user])

  // Proteção de Rota com a flag correta: hasCompletedOnboarding
  useEffect(() => {
    if (authLoading || saving) return 

    if (!user) {
      router.replace("/")
      return
    }

    // Se o DTO diz que já completou, não deve estar aqui (exceto se estiver salvando agora)
    if (user.hasCompletedOnboarding && !saving) {
      router.replace("/rooms")
      return
    }
  }, [user, authLoading, router, saving])

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
      if (bannerPreview.startsWith("blob:")) URL.revokeObjectURL(bannerPreview)
    }
  }, [avatarPreview, bannerPreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError("A imagem deve ter no máximo 2MB."); return }
    const url = URL.createObjectURL(file)
    if (type === "avatar") { setAvatarFile(file); setAvatarPreview(url) }
    else { setBannerFile(file); setBannerPreview(url) }
    setError(null)
  }

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      let finalAvatarUrl = user.avatarUrl || "/Avatar_default.png"
      let finalBannerUrl = user.bannerUrl

      if (avatarFile) finalAvatarUrl = await storageDao.uploadAvatar(avatarFile, user.id)
      if (bannerFile) finalBannerUrl = await storageDao.uploadBanner(bannerFile, user.id)

      const profileData: Partial<ProfileRow> = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        description: description.trim() || "Sem descrição",
        location: location.trim() || undefined,
        status: status as ProfileRow["status"],
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl,
      }

      // 1. Salva no Banco
      await profileDao.completeOnboarding(user.id, profileData)

      // 2. Refresh do Contexto
      const { data: { session } } = await supabase.auth.getSession()
      
      // Forçamos o refresh e aguardamos o DTO atualizado
      const updatedUser = await refreshUser(session, true) 

      // 3. Redirecionamento usando a flag hasCompletedOnboarding do DTO
      if (updatedUser?.hasCompletedOnboarding) {
        router.replace("/rooms?welcome=true")
      } else {
        // Fallback para latência: espera 1s e tenta a última vez
        await new Promise(res => setTimeout(res, 1000))
        await refreshUser(session, true)
        router.replace("/rooms?welcome=true")
      }
      
    } catch (err: any) {
      console.error("❌ [SetupPage.handleFinish] Erro:", err)
      setError(err.message || "Erro ao salvar seus dados.")
      setSaving(false) 
    }
  }

  const nextStep = () => {
    setError(null)
    if (step === 1) {
      if (!name.trim()) return setError("O nome é obrigatório.")
      if (!username.trim() || username.length < 3) return setError("Username inválido (mín. 3 caracteres).")
      if (!/^[a-z0-9_]+$/.test(username)) return setError("Username só pode ter letras, números e _.")
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else handleFinish()
  }

  if (authLoading || (!user && !saving)) return null

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <h1 className={styles.title}>Quase lá...</h1>
          <p className={styles.subtitle}>Etapa {step + 1} de {STEPS.length} — {STEPS[step]}</p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </header>

        <main className={styles.cardBody}>
          {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

          {step === 0 && (
            <div className={styles.stepContent}>
              <AvatarBanner
                bannerPreview={bannerPreview}
                avatarPreview={avatarPreview}
                handleFileChange={handleFileChange}
              />
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Como quer ser chamado? *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Guilherme Cruz"
                  className={styles.input}
                  autoFocus
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Username *</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.atSymbol}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                    placeholder="guilherme_dev"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo, Brasil"
                  className={styles.input}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Bio</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.statusSection}>
                <label className={styles.fieldLabel}>Status inicial</label>
                <div className={styles.statusGrid}>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.statusCard} ${status === opt.value ? styles.active : ""}`}
                      onClick={() => setStatus(opt.value)}
                    >
                      <span className={styles.statusEmoji}>{opt.emoji}</span>
                      <span className={styles.statusLabel}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className={styles.cardFooter}>
          {step > 0 && (
            <button className={styles.btnSecondary} onClick={() => setStep(s => s - 1)} disabled={saving}>
              Voltar
            </button>
          )}
          <button className={styles.btnPrimary} onClick={nextStep} disabled={saving}>
            {saving ? "Salvando..." : step === STEPS.length - 1 ? "Concluir Perfil 🚀" : "Continuar →"}
          </button>
        </footer>
      </div>
    </div>
  )
}