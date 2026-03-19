"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import styles from "@/styles/rooms/roomlist.module.css";
import RoomCard from "@/components/sala/Roomcard";

interface RoomListProps {
  rooms: any[];
  searchTerm: string;
}

export default function RoomList({ rooms, searchTerm }: RoomListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 1. FILTRO INTELIGENTE
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tema?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const isSearching = searchTerm.length > 0;

  // 2. LÓGICA DE EXIBIÇÃO (Loop apenas se não estiver buscando)
  const displayRooms = useMemo(() => {
    if (isSearching) return filteredRooms;
    // Triplicamos a lista para o efeito de scroll infinito funcionar suavemente
    return [...filteredRooms, ...filteredRooms, ...filteredRooms];
  }, [filteredRooms, isSearching]);

  // 3. AUTO-PLAY
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isDragging && !isHovered && !isSearching) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += 1;
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isDragging, isHovered, isSearching]);

  // 4. RESET DO SCROLL INFINITO
  const handleScroll = () => {
    if (!scrollRef.current || isSearching) return;
    const container = scrollRef.current;
    const listWidth = container.scrollWidth / 3;

    if (container.scrollLeft >= listWidth * 2) {
      container.scrollLeft = listWidth;
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft = listWidth;
    }
  };

  // 5. LÓGICA DE DRAG (ARRASTAR COM O MOUSE)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // ESTADO VAZIO
  if (filteredRooms.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>🔍</span>
        <p>Nenhuma sala encontrada com "<strong>{searchTerm}</strong>"</p>
      </div>
    );
  }

  return (
    <div className={styles.listWrapper}>
      <div 
        ref={scrollRef}
        className={`${styles.carrossel} ${isSearching ? styles.searchingMode : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => {
          setIsDragging(false);
          setIsHovered(false);
        }}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={styles.group}>
          {displayRooms.map((room, index) => (
            <RoomCard key={`${room.id_room || room.id}-${index}`} room={room} />
          ))}
        </div>
      </div>
      
      {/* Opcional: Efeito de Fade nas laterais para o carrossel */}
      {!isSearching && <div className={styles.fadeLeft} />}
      {!isSearching && <div className={styles.fadeRight} />}
    </div>
  );
}