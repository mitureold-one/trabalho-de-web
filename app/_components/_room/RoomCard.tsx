"use client"

import { useState } from "react"
import styles from "@/app/_styles/rooms/roomcard.module.css"
import { useRouter } from "next/navigation"
import { roomDao } from "@/app/_interfaces/dao/room-dao" // ✅ Usando o novo DAO
import { RoomDto } from "@/app/_interfaces/dto/room-dto" // ✅ Usando o novo DTO

interface RoomCardProps {
  room: RoomDto; // ✅ Tipo atualizado
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [inputPassword, setInputPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setInputPassword("");
    setError(false);
  };

  // ✅ Lógica simplificada: O DTO já entrega os dados mastigados
  const totalMembros = room.memberCount ?? 0;
  const nomeCriador = room.creator.name;
  const tituloSala = room.name;

  const handleCardClick = () => {
    if (loading) return;
    // 🔄 Mudança para camelCase do DTO
    if (room.isPrivate) {
      setShowPasswordModal(true);
    } else {
      router.push(`/chat/${room.id}`);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPassword.trim()) return;

    setLoading(true);
    setError(false);

    try {
      // ✅ Usando o método do novo DAO
      await roomDao.verifyAndJoin(room.id, inputPassword);
      router.push(`/chat/${room.id}`);
    } catch (err) {
      setError(true);
      setInputPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className={`${styles.card} ${loading ? styles.loading : ""}`} 
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`Entrar na sala ${tituloSala}`}
      >
        <div className={styles.memberBadge}>
          <span className={styles.pulseDot}></span>
          {totalMembros} {totalMembros === 1 ? "membro" : "membros"}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.roomName}>{tituloSala}</h3>

          <div className={styles.infoGroup}>
            <div className={styles.creatorInfo}>
              <img 
                // 🔄 Mudança para camelCase: creator.avatarUrl
                src={room.creator.avatarUrl || "/Avatar_default.png"} 
                className={styles.miniAvatar} 
                alt={`Avatar de ${nomeCriador}`} 
                onError={(e) => { e.currentTarget.src = "/Avatar_default.png" }}
              />
              <p>Criada por: <span>{nomeCriador}</span></p>
            </div>
          </div>

          <div className={styles.footerRow}>
            {/* 🔄 Mudança para camelCase: isPrivate */}
            <div className={`${styles.statusBadge} ${room.isPrivate ? styles.private : styles.public}`}>
              <img 
                src={room.isPrivate ? "/cadeado.png" : "/globo-terrestre.png"} 
                alt={room.isPrivate ? "Privada" : "Pública"} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE SENHA */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.passwordModal} onClick={(e) => e.stopPropagation()}>
            <h3>Sala Privada 🔒</h3>
            <p>Esta sala exige uma senha para entrar.</p>
            
            <form onSubmit={handleVerifyPassword}>
              <input 
                type="password" 
                placeholder="Senha da sala"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                autoFocus
                disabled={loading}
                className={error ? styles.inputError : ""}
              />
              {error && <span className={styles.errorText}>Senha incorreta!</span>}
              
              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} disabled={loading}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.confirmBtn}
                  disabled={loading || !inputPassword}
                >
                  {loading ? "Validando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}