"use client";

import { useRef, useState, useEffect } from "react";
import styles from "@/styles/roomlist.module.css";
import RoomCard from "@/components/sala/Roomcard";

interface RoomListProps {
  rooms: any[];
}

export default function RoomList({ rooms }: RoomListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Novo estado para pausar o auto-play
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Triplicamos para o efeito infinito
  const infiniteRooms = [...rooms, ...rooms, ...rooms];

  // 1. Lógica do Auto-play (Animação constante)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isDragging && !isHovered) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += 1; // Velocidade: 1px por frame
        }
      }, 30); // ~30fps para suavidade
    }

    return () => clearInterval(interval);
  }, [isDragging, isHovered]);

  // 2. Reset Infinito (Posicionamento inicial e loop)
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const listWidth = container.scrollWidth / 3;
      container.scrollLeft = listWidth;
    }
  }, [rooms]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const listWidth = container.scrollWidth / 3;

    // Se chegar perto do fim da 2ª lista, volta pro início da 2ª
    if (container.scrollLeft >= listWidth * 2) {
      container.scrollLeft = listWidth;
    } 
    // Se chegar no início da 1ª lista, pula pro início da 2ª
    else if (container.scrollLeft <= 0) {
      container.scrollLeft = listWidth;
    }
  };

  // Funções de Arrastar (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      className={styles.carrossel}
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseMove={handleMouseMove}
      onScroll={handleScroll}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className={styles.group}>
        {infiniteRooms.map((room, index) => (
          <RoomCard key={`${room.id_room}-${index}`} room={room} />
        ))}
      </div>
    </div>
  );
}