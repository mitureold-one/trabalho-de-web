"use client";

import styles from "@/app/_styles/modal/modal.createroom.module.css";
import { useState } from "react";
import { roomDao } from "@/app/_interfaces/dao/room-dao"; // ✅ Importando o DAO
import { RoomDto } from "@/app/_interfaces/dto/room-dto"; // ✅ Importando o Tipo

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRoom: RoomDto) => void; // ✅ Tipagem correta em vez de any
}

export default function CreateRoomModal({ isOpen, onClose, onSuccess }: Props) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading && !success) {
      onClose();
    }
  };

  async function handleCreateRoom() {
    setError(null);
    setLoading(true);

    try {
      // ✅ Usando o DAO: passamos apenas os campos necessários.
      // O DAO cuida de buscar o user_id internamente.
      const newRoom = await roomDao.createRoom(
        roomName, 
        isPrivate, 
        isPrivate ? password : undefined
      );
      
      setSuccess(true); 

      setTimeout(() => {
        setRoomName("");
        setPrivate(false);
        setPassword("");
        setSuccess(false);
        
        // Agora o onSuccess entrega um objeto RoomDto padronizado
        if (onSuccess) onSuccess(newRoom); 
        onClose();
      }, 1500);

    } catch (err: any) {
      // O DAO já retorna mensagens amigáveis no handleError
      setError(err.message || "Ops! Algo deu errado. 🛠️");
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <section className={`${styles.modalContainer} ${success ? styles.modalSuccess : ""}`}>
        {!success ? (
          <>
            <button className={styles.closeBtn} onClick={onClose} type="button">
              &times;
            </button>

            <div className={styles.titleWrapper}>
              <h2 className={styles.cardTitle}>
                Criando um novo...
                <span className={styles.highlightText}>Chat Da Galera !</span>
              </h2>
            </div>

            <div className={styles.createCard}>
              <div className={styles.inputGroup}>
                <input
                  className={styles.mainInput}
                  placeholder="Nome da Sala"
                  value={roomName}
                  disabled={loading}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    if (error) setError(null);
                  }}
                />

                {isPrivate && (
                  <div className={styles.passwordWrapper}>
                    <input
                      type="password"
                      className={styles.mainInput}
                      placeholder="Defina a senha privada..."
                      value={password}
                      disabled={loading}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div className={styles.errorMessage}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <div className={styles.createActions}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={isPrivate}
                      disabled={loading}
                      onChange={(e) => {
                        setPrivate(e.target.checked);
                        if (!e.target.checked) setPassword("");
                      }}
                    />
                    <span className={`${styles.customCheckbox} ${isPrivate ? styles.checked : ""}`}></span>
                    <span className={styles.labelText}>Sala Privada</span>
                  </label>

                  <button
                    className={styles.submitBtn}
                    onClick={handleCreateRoom}
                    disabled={loading || !roomName.trim() || (isPrivate && !password.trim())}
                  >
                    {loading ? "Criando..." : "Criar Sala"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h3>Sala Criada!</h3>
            <p>Prepare a resenha, estamos te levando...</p>
          </div>
        )}
      </section>
    </div>
  );
}