"use client";

import { useState, useEffect, useMemo } from "react";
import RoomList from "@/app/_components/_room/RoomList";
import CreateRoomModal from "@/app/_components/_room/CreateRoomModal"; 
import styles from "@/app/styles/home.module.css";
import { roomDao } from "@/app/interfaces/dao/room-dao"; // ✅ Novo DAO
import { useAuth } from "@/AuthContext"; 
import { RoomDto } from "@/app/interfaces/dto/room-dto"; // ✅ Novo DTO

export default function SalasPage() {
  const { user } = useAuth(); 
  const [allRooms, setAllRooms] = useState<RoomDto[]>([]); // ✅ Tipagem DTO
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Debounce Logic para Busca
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Saudação Dinâmica
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    // Usamos user.name do nosso UserDto
    const firstName = user?.name?.trim().split(' ')[0] ?? "viajante";
    return `${period}, ${firstName}! Qual é a boa hoje?`;
  }, [user?.name]);

  // 3. Busca de Salas via DAO
  useEffect(() => {
    let isMounted = true;
    async function fetchRooms() {
      setLoading(true);
      setError(null);
      try {
        // ✅ O DAO já retorna RoomDto[] formatado
        const data = await roomDao.getRooms();
        if (isMounted) setAllRooms(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Houve um problema ao sintonizar as salas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRooms();
    return () => { isMounted = false };
  }, []);

  // 4. Filtro Memoizado
  const filteredRooms = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return allRooms;
    return allRooms.filter(r => 
      r.name.toLowerCase().includes(term)
    );
  }, [allRooms, debouncedSearch]);

  // 5. Callback de Sucesso (Atualiza a lista local com o DTO recebido)
  const handleRoomCreated = (newRoom: RoomDto) => {
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
        ) : allRooms.length === 0 ? (
          /* Estado vazio quando não há NENHUMA sala no banco */
          <div className={styles.emptyState}>
              <p>Ainda não há salas criadas. Que tal ser o primeiro? 🏘️</p>
              <button onClick={() => setIsModalOpen(true)}>Criar Sala</button>
          </div>
        ) : filteredRooms.length === 0 ? (
          /* Estado vazio apenas para a busca */
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