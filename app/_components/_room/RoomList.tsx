"use client"

import { useMemo } from "react";
import styles from "@/app/_styles/rooms/roomlist.module.css";
import RoomCard from "@/app/_components/_room/RoomCard";
import { RoomDto } from "@/app/_interfaces/dto/room-dto";

interface RoomListProps {
  rooms: RoomDto[];       
  allRooms?: RoomDto[];   
  isSearching: boolean;
}

export default function RoomList({ rooms, allRooms, isSearching }: RoomListProps) {
  
  // ✅ Lógica de Ranking limpa e performática
  const popularRooms = useMemo(() => {
    const source = allRooms || rooms;
    if (isSearching || source.length === 0) return [];
    
    return [...source]
      .sort((a, b) => {
        // 🔄 Antes: a.room_members?.[0]?.count
        // 🔄 Agora: a.memberCount (Limpo e seguro)
        const countA = a.memberCount ?? 0;
        const countB = b.memberCount ?? 0;
        return countB - countA;
      })
      .slice(0, 3);
  }, [rooms, allRooms, isSearching]);

  // Estados Vazios
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
      
      {/* SEÇÃO "ON FIRE" */}
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