"use client"

import { useMemo } from "react";
import styles from "@/styles/rooms/roomlist.module.css";
import RoomCard from "@/components/room/roomCard";
import { Room } from "@/types/room"; // 1. CONTRATO FORTE: Tipagem oficial

interface RoomListProps {
  rooms: Room[];       // Recebe a lista já filtrada pela página
  allRooms?: Room[];   // Opcional: Para calcular os "Populares" sem o filtro da busca
  isSearching: boolean;
}

export default function RoomList({ rooms, allRooms, isSearching }: RoomListProps) {
  
  // 2. LÓGICA DE NEGÓCIO: Ranking focado apenas na exibição
  const popularRooms = useMemo(() => {
    // Se estiver buscando ou não houver salas, não mostra o "On Fire"
    const source = allRooms || rooms;
    if (isSearching || source.length === 0) return [];
    
    return [...source]
      .sort((a, b) => {
        const countA = a.room_members?.[0]?.count ?? 0;
        const countB = b.room_members?.[0]?.count ?? 0;
        return countB - countA;
      })
      .slice(0, 3);
  }, [rooms, allRooms, isSearching]);

  // 3. ESTADOS VAZIOS (FEEDBACK AO USUÁRIO)
  if (rooms.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon} aria-hidden="true">
          {isSearching ? "🔍" : "🏘️"}
        </span>
        <p>
          {isSearching 
            ? "Nenhuma sala encontrada para sua busca." 
            : "Ainda não há salas criadas. Que tal criar a primeira?"}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.feedWrapper}>
      
      {/* SEÇÃO "ON FIRE" - Destaque visual */}
      {popularRooms.length > 0 && (
        <section className={styles.popularSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.fireIcon}>🔥</span> 
            On fire agora!
          </h2>
          <div className={styles.popularGrid}>
            {popularRooms.map((room) => (
              <div key={`pop-${room.id}`} className={styles.featuredAnimation}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GRADE PRINCIPAL */}
      <section className={styles.feedSection}>
        <h2 className={styles.sectionTitle}>
          {isSearching ? "Resultados da busca" : "Todas as salas"}
        </h2>
        <div className={styles.roomGrid}>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>
    </div>
  );
}