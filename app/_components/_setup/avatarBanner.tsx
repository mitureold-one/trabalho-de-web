"use client"

import styles from "@/app/_styles/setup.module.css"

interface AvatarBannerProps {
  bannerPreview: string | null;
  avatarPreview: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => void;
}

export default function AvatarBanner({ 
  bannerPreview, 
  avatarPreview, 
  handleFileChange 
}: AvatarBannerProps) {
  return (
    <div className={styles.stepContent}>
      {/* Banner */}
      <div className={styles.bannerSection}>
        <label htmlFor="banner-input" className={styles.bannerLabel}>
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className={styles.bannerPreview} />
          ) : (
            <div className={styles.bannerEmpty}>
              <span>+ Adicionar banner</span>
              <small>Opcional — recomendado 1200×400px</small>
            </div>
          )}
        </label>
        <input
          id="banner-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "banner")}
          hidden
        />
      </div>

      {/* Avatar */}
      <div className={styles.avatarSection}>
        <label htmlFor="avatar-input" className={styles.avatarLabel}>
          {/* Usando img normal aqui para o preview fluído do blob, 
              mas mantendo o estilo que definimos */}
          <img src={avatarPreview} alt="Preview" className={styles.avatarPreview} />
          <div className={styles.avatarOverlay}>📷</div>
        </label>
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "avatar")}
          hidden
        />
        <p className={styles.fieldHint}>Toque para mudar a foto</p>
      </div>

      <p className={styles.stepNote}>
        Você pode pular e usar o avatar padrão — dá pra mudar depois no perfil.
      </p>
    </div>
  );
}