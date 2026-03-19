"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import RoomList from "@/components/sala/RoomList";
import CreateRoomModal from "@/components/sala/CreateRoomModal"; // Verifique se o caminho está correto
import styles from "@/styles/home.module.css";
import { getRooms } from "@/lib/rooms";

export default function SalasPage() {
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const handleRoomCreated = (newRoom: any) => {
  // Adiciona a nova sala no início do array existente
  setAllRooms((prev) => [newRoom, ...prev]);
};
  
  // Adicionando o estado que estava faltando:
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
  async function fetchRooms() {
    setLoading(true);
    try {
      // USANDO A LIB AQUI:
      const data = await getRooms();
      if (data) {
        setAllRooms(data);
      }
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    } finally {
      setLoading(false);
    }
  }
  fetchRooms();
}, []);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Explorar Salas</h1>
          {!loading && <p><strong>{allRooms.length}</strong> salas disponíveis para você</p>}
        </div>

        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Buscar salas ou temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button 
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
            title="Criar nova sala"
          >
            <span>+</span> Criar Sala
          </button>
        </div>
      </header>

      <hr className={styles.divider} />

      <section className={styles.content}>
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Carregando salas...</p>
          </div>
        ) : (
          <RoomList rooms={allRooms} searchTerm={searchTerm} />
        )}
      </section>

      {/* Renderização Condicional do Modal */}
      {isModalOpen && (
        <CreateRoomModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleRoomCreated} 
        />
      )}
    </main>
  );
}