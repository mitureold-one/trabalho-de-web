"use client"

import { useMemo } from "react";
import styles from "@/styles/rooms/roomlist.module.css";
import RoomCard from "@/components/sala/Roomcard";

interface RoomListProps {
  rooms: any[];
  searchTerm: string;
}

export default function RoomList({ rooms, searchTerm }: RoomListProps) {
  
  // 1. FILTRO E ORDENAÇÃO
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tema?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  // 2. SEPARAR AS POPULARES (Ex: Top 3 com mais membros)
  // Só mostramos populares se o usuário não estiver pesquisando
  const popularRooms = useMemo(() => {
    if (searchTerm) return [];
    return [...rooms]
      .sort((a, b) => (b.room_members?.[0]?.count || 0) - (a.room_members?.[0]?.count || 0))
      .slice(0, 3);
  }, [rooms, searchTerm]);

  if (filteredRooms.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>🔍</span>
        <p>Nenhuma sala encontrada para "<strong>{searchTerm}</strong>"</p>
      </div>
    );
  }

  return (
    <div className={styles.feedWrapper}>
      
      {/* SEÇÃO DE POPULARES (Com animação de destaque) */}
      {!searchTerm && popularRooms.length > 0 && (
        <section className={styles.popularSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.fireIcon}>
              <img 
                src="/simbolo-de-interface-quente-ou-queimada.png" 
                alt="salas populares" 
                aria-hidden="true"
              />
            </span> 
            On fire agora !
          </h2>
          <div className={styles.popularGrid}>
            {popularRooms.map((room) => (
              <div key={`pop-${room.id_room}`} className={styles.featuredAnimation}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEED GERAL (Grid infinita/Feed) */}
      <section className={styles.feedSection}>
        <h2 className={styles.sectionTitle}>
          {searchTerm ? `Resultados para: ${searchTerm}` : "Todas as salas"}
        </h2>
        <div className={styles.roomGrid}>
          {filteredRooms.map((room) => (
            <RoomCard key={room.id_room} room={room} />
          ))}
        </div>
      </section>
    </div>
  );
}