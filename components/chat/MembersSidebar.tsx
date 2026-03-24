"use client"

import { useAuth } from "@/AuthContext"
import { useRoomMembers } from "@/hooks/useRoomMembers"
import Membercard from "@/components/chat/Membercard"
import styles from "@/styles/chat/members.module.css"

interface MembersSidebarProps {
  roomId: string;
  isOpen?: boolean; 
}

export default function MembersSidebar({ roomId, isOpen }: MembersSidebarProps) {
  const { user } = useAuth()
  const { members, onlineUsers, loading } = useRoomMembers(roomId, user?.uid)

  // Lógica de ordenação: Admin primeiro, depois por nome
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return a.nome.localeCompare(b.nome);
  });

  if (loading) {
    return (
      <aside className={styles.sidebar} aria-busy="true">
        <p className={styles.loadingText}>Buscando a galera...</p>
      </aside>
    )
  }

  return (
    <aside 
      className={`${styles.sidebar} ${isOpen ? styles.sidebarActive : ""}`}
      aria-labelledby="sidebar-title"
    >
      {/* 🟢 Wrapper do Título: Separado visualmente */}
      <header className={styles.headerSection}>
        <div className={styles.titleBadge}>
          <h3 id="sidebar-title" className={styles.title}>
            Membros
          </h3>
          <span className={styles.countBadge}>{members.length}</span>
        </div>
      </header>

      {/* 🟢 Wrapper da Lista: Envolvendo os itens juntos */}
      <nav className={styles.listSection}>
        <ul className={styles.list}>
          {sortedMembers.map((member) => {
            const isOnline = onlineUsers.includes(member.userId)
            return (
              <li key={member.userId} className={styles.listItem}>
                <Membercard member={member} isOnline={isOnline} />
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}