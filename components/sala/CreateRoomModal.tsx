"use client";

import styles from "@/styles/modal/modal.createroom.module.css";
import { useState } from "react";
import { createRoom } from "@/lib/rooms";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  loadRooms: () => Promise<void>;
}

export default function CreateRoomModal({ isOpen, onClose, loadRooms }: Props) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Novo estado de sucesso
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
      await createRoom(roomName, isPrivate, isPrivate ? password : null);
      
      setSuccess(true); // Ativa o feedback visual de sucesso

      // Espera 1.2s para o usuário ver que deu certo antes de fechar
      setTimeout(async () => {
        setRoomName("");
        setPrivate(false);
        setPassword("");
        setSuccess(false);
        if (loadRooms) await loadRooms();
        onClose();
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Ops! Algo deu errado no servidor. 🛠️");
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
          /* TELA DE SUCESSO ANIMADA */
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