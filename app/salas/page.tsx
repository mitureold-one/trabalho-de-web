"use client";

import styles from "@/styles/sala.module.css";
import { useEffect, useState } from "react"; 
import RoomList from "@/components/sala/RoomList";
import { getRooms } from "@/lib/rooms"; 
import CreateRoomModal from "@/components/sala/CreateRoomModal";

export default function HomePage() {
  const [rooms, setRooms] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtragem em tempo real
  const filteredRooms = rooms.filter(room => 
    room.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function loadRooms() {
    try {
      const data = await getRooms();
      setRooms(data || []);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1>Salas Disponíveis</h1>
          <p>Encontre sua galera ou crie um novo espaço</p>
        </div>
        
        <div className={styles.headerActions}> 
          <div className={styles.searchBar}>
            <input 
              type="text"
              placeholder="🔎 Buscar sala pelo nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className={styles.createBtn} 
            onClick={() => setIsModalOpen(true)}
          >
            <span>+</span> Nova Sala
          </button>

          <CreateRoomModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            loadRooms={loadRooms} 
          />
        </div>
      </header>

      <main className={styles.roomGrid}>
        {filteredRooms.length > 0 ? (
          <RoomList rooms={filteredRooms} />
        ) : (
          <div className={styles.emptyState}>
            <p>
              {searchTerm 
                ? `Nenhuma sala encontrada para "${searchTerm}"` 
                : "Ainda não há salas criadas. Seja o primeiro!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}