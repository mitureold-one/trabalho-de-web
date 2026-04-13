"use client"

import { useState, useEffect, useMemo } from "react"
import RoomList from "@/app/_components/_room/RoomList"
import CreateRoomModal from "@/app/_components/_room/CreateRoomModal"
import styles from "@/app/_styles/home.module.css"
import { roomDao } from "@/app/_interfaces/dao/room-dao"
import { useAuth } from "@/AuthContext"
import { RoomDto } from "@/app/_interfaces/dto/room-dto"
import { UserDto } from "@/app/_interfaces/dto/user-dto"

export function RoomsContent({ initialUser }: { initialUser?: UserDto }) {
  const { user } = useAuth()
  const displayUser = user || initialUser

  const [allRooms, setAllRooms] = useState<RoomDto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce para busca de salas
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const period = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
    const firstName = displayUser?.name?.trim().split(" ")[0] ?? "viajante"
    return `${period}, ${firstName}! Qual é a boa hoje?`
  }, [displayUser?.name])

  // Busca inicial de salas
  useEffect(() => {
    let isMounted = true
    async function fetchRooms() {
      setLoading(true)
      setError(null)
      try {
        const data = await roomDao.getRooms()
        if (isMounted) setAllRooms(data)
      } catch (err: any) {
        if (isMounted) setError(err.message || "Houve um problema ao sintonizar as salas.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchRooms()
    return () => { isMounted = false }
  }, [])

  const filteredRooms = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim()
    if (!term) return allRooms
    return allRooms.filter((r) => r.name.toLowerCase().includes(term))
  }, [allRooms, debouncedSearch])

  const handleRoomCreated = (newRoom: RoomDto) => {
    setAllRooms((prev) => {
      if (prev.some((r) => r.id === newRoom.id)) return prev
      return [newRoom, ...prev]
    })
    setIsModalOpen(false)
  }

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
    <div className={styles.errorState}>
      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
      {error}
    </div>
  ) : loading ? (
    <div className={styles.loader}>
      <span>Buscando as melhores conversas...</span>
    </div>
  ) : allRooms.length === 0 ? (
    <div className={styles.emptyState}>
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🏘️</span>
      <p>Ainda não há salas criadas.<br/>Que tal ser o primeiro?</p>
    </div>
  ) : filteredRooms.length === 0 ? (
    <div className={styles.emptyState}>
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
      <p>Nenhuma sala encontrada para <br/><strong>"{searchTerm}"</strong></p>
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
  )
}