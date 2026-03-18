"use client";
import { useState } from "react";
import { createRoom } from "@/lib/rooms"; 
import styles from "@/styles/rooms/CreateRoom.module.css";

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
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCreateRoom() {
    setError(null);
    setLoading(true);

    try {
      await createRoom(roomName, isPrivate, isPrivate ? password : null);
      setRoomName("");
      setPrivate(false);
      setPassword("");
      
      if (loadRooms) await loadRooms(); 
    } catch (err: any) {
      setError(err.message || "Ops! Algo deu errado no servidor. 🛠️");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className={styles.actionSection}>
      <div className={styles.createCard}>
        <h2 className={styles.cardTitle}>Criando um novo... Chat Da Galera !</h2>
        
        <div className={styles.inputGroup}>
          <input 
            className={styles.mainInput}
            placeholder="Nome de um Novo... Chat da Galera !" 
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
              if (error) setError(null); 
            }}
          />

          {isPrivate && (
            <div className={styles.passwordWrapper}>
              <input 
                type="password"
                className={`${styles.mainInput} ${styles.passwordInput}`}
                placeholder="Defina a senha do Chat privado... e convide a Galera !" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
              <span className={styles.inputBadge}>🔒 Obrigatório</span>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
          
          <div className={styles.createActions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.hiddenCheckbox}
                checked={isPrivate}
                onChange={(e) => {
                  setPrivate(e.target.checked);
                  setError(null);
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
    </section>
  );
}