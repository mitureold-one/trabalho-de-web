"use client";

import { useState, useEffect, useMemo } from "react";
import RoomList from "@/app/_components/_room/RoomList";
import CreateRoomModal from "@/app/_components/_room/CreateRoomModal"; 
import styles from "@/app/styles/home.module.css";
import { getRooms } from "@/app/lib/Rooms";
import { useAuth } from "@/AuthContext"; 
import { Room } from "@/app/types/room";

// 1. INTERFACE COMPLETA: Alinhada com o que o RoomList/Card precisa


export default function SalasPage() {
  const { user } = useAuth(); 
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // 2. Estado para Debounce
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. DEBOUNCE LOGIC: Evita re-renders pesados a cada tecla
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 4. SAUDAÇÃO DINÂMICA (Pode ser estendida com um setInterval se necessário)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    const firstName = user?.name?.trim().split(' ')[0] ?? "viajante";
    return `${period}, ${firstName}! Qual é a boa hoje?`;
  }, [user?.name]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRooms() {
      setLoading(true);
      setError(null);
      try {
        // Na lib: export async function getRooms(): Promise<Room[]>
        const data = await getRooms();
        if (isMounted) setAllRooms(data);
      } catch (err) {
        if (isMounted) setError("Houve um problema ao sintonizar as salas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRooms();
    return () => { isMounted = false };
  }, []);

  // 5. FILTRO MEMOIZADO (Usando o termo com debounce)
  const filteredRooms = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return allRooms;
    return allRooms.filter(r => 
      r.name.toLowerCase().includes(term)
    );
  }, [allRooms, debouncedSearch]);

  const handleRoomCreated = (newRoom: Room) => {
    setAllRooms((prev) => {
      if (prev.some(r => r.id === newRoom.id)) return prev;
      return [newRoom, ...prev];
    });
    setIsModalOpen(false);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.greetingText}>{greeting}</h1>
          {!loading && !error && (
            <p className={styles.statsText}>
              <strong>{allRooms.length}</strong> salas disponíveis
            </p>
          )}
        </div>
        
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
             <input
              type="text"
              placeholder="Buscar salas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            type="button" 
            className={styles.createButton} 
            onClick={() => setIsModalOpen(true)}
          >
            <span>+</span> Criar Sala
          </button>
        </div>
      </header>

      <section className={styles.content}>
        {error ? (
          <div className={styles.errorState}>{error}</div>
        ) : loading ? (
          <div className={styles.loader}>Buscando as melhores conversas...</div>
        ) : filteredRooms.length === 0 ? (
          // 6. ESTADO VAZIO (Empty State) elegante
          <div className={styles.emptyState}>
             <p>Nenhuma sala encontrada para "{searchTerm}" 🔍</p>
             <button onClick={() => setSearchTerm("")}>Limpar busca</button>
          </div>
        ) : (
          <RoomList 
            rooms={filteredRooms} 
            allRooms={allRooms} 
            isSearching={searchTerm.length > 0} 
          />
        )}
      </section>

      <CreateRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleRoomCreated} 
      />
    </main>
  );
}