"use client";

import styles from "@/styles/sala.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, getRooms } from "@/lib/rooms"; 
import RoomList from "@/components/sala/RoomList";

export default function SalasPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setPrivate] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [initialLoading, setInitialLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState("");
  const filteredRooms = rooms.filter(room => 
  room.nome.toLowerCase().includes(searchTerm.toLowerCase())
);

  async function loadRooms() {
    try {
      const data = await getRooms();
      setRooms(data || []);
    } catch (error) {
      console.error("Erro ao carregar salas:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function handleCreateRoom() {
    if (!roomName.trim()) return; 

    setLoading(true);
    try {
      await createRoom(roomName, isPrivate);
      
      setRoomName("");
      setPrivate(false);
      
      await loadRooms(); 
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      alert("Houve um erro ao criar a sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Chat Da Galera !</h1>
        <h2 className={styles.title}>Salas Disponíveis</h2>
        
        <div className={styles.controls}>
          <div className={styles.createBox}>
            <input 
              className={styles.input} 
              placeholder="Nova sala..." 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}/>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setPrivate(e.target.checked)}
                  disabled={loading} />
                  Sala privada
              </label>
            
            <button
              className={styles.button}
              onClick={handleCreateRoom}
              disabled={loading || !roomName.trim()} >
              {loading ? "Criando..." : "Criar"}
            </button>
          </div>

          <div className={styles.searchBox}>
            <input 
              className={styles.searchInput} 
              placeholder="🔎 Buscar sala..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
       <div className={styles.carrosselContainer}>
          {rooms.length > 0 ? (
            <RoomList rooms={filteredRooms} />
          ) : (
            <p className={styles.emptyText}>Nenhuma sala encontrada.</p>
          )}
       </div>
      </main>

    </div>
  );
}