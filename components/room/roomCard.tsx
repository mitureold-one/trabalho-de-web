"use client"

import { useState, useEffect } from "react"
import styles from "@/styles/rooms/roomcard.module.css"
import { useRouter } from "next/navigation"
import { verifyAndJoin } from "@/lib/rooms"
import { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [inputPassword, setInputPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // 1. Limpeza de estado ao fechar o modal
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setInputPassword("");
    setError(false);
  };

  // 2. Extração de lógica de exibição (Clean Code)
  const totalMembros = room.room_members?.[0]?.count ?? 0;
  const nomeCriador = room.creator?.name || "Usuário";
  const tituloSala = room.name || "Sala sem nome";

  const handleCardClick = () => {
    if (loading) return;
    if (room.is_private) {
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
      await verifyAndJoin(room.id, inputPassword);
      router.push(`/chat/${room.id}`);
    } catch (err) {
      setError(true);
      setInputPassword("");
      // O erro some sozinho após 2s, mas o loading para imediatamente
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
              {room.creator?.avatar_url ? (
                <img 
                  src={room.creator.avatar_url} 
                  className={styles.miniAvatar} 
                  alt={`Avatar de ${nomeCriador}`} 
                />
              ) : (
                <span className={styles.userIcon} aria-hidden="true">👤</span>
              )}
              <p>Criada por: <span>{nomeCriador}</span></p>
            </div>
          </div>

          <div className={styles.footerRow}>
            <div className={`${styles.statusBadge} ${room.is_private ? styles.private : styles.public}`}>
              <img 
                src={room.is_private ? "/cadeado.png" : "/globo-terrestre.png"} 
                alt={room.is_private ? "Privada" : "Pública"} 
              />
            </div>
            {room.tema && <span className={styles.topicBadge}>#{room.tema}</span>}
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