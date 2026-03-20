"use client";

import { useState, useEffect } from "react";
import RoomList from "@/components/sala/RoomList";
import CreateRoomModal from "@/components/sala/CreateRoomModal"; 
import styles from "@/styles/home.module.css";
import { getRooms } from "@/lib/rooms";
import { supabase } from "@/lib/supabase"; // Importe o seu supabase client

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  let greeting = "Bom dia";
  
  if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  else if (hour >= 18 || hour < 5) greeting = "Boa noite";

  return `${greeting}, ${name}! Qual é a boa com a galera hoje?`;
};

export default function SalasPage() {
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("viajante"); // Estado para o nome
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        // 1. Busca o usuário logado e o perfil dele
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("nome")
            .eq("id_user", user.id)
            .single();
          
          if (profile?.nome) setUserName(profile.nome);
        }

        // 2. Busca as salas
        const data = await getRooms();
        if (data) setAllRooms(data);
        
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleRoomCreated = (newRoom: any) => {
    setAllRooms((prev) => [newRoom, ...prev]);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.greetingText}>
            {getGreeting(userName)}
          </h1>
          {!loading && (
            <p className={styles.statsText}>
              Explorar Salas • <strong>{allRooms.length}</strong> disponíveis
            </p>
          )}
        </div>
        
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <img src="/mais-zoom.png" alt="pesquisa" />
            </span>
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