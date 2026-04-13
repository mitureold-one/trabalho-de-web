"use client"

import { useAuth } from "@/AuthContext"
import { useRoomMembers } from "@/app/_hooks/useRoomMembers"
import MemberCard from "@/app/_components/_chat/MemberCard"
import styles from "@/app/_styles/chat/members.module.css"

interface MembersSidebarProps {
  roomId: string;
  isOpen?: boolean; 
}

export default function MembersSidebar({ roomId, isOpen }: MembersSidebarProps) {
  const { user } = useAuth()
  const { members, onlineUsers, loading } = useRoomMembers(roomId, user?.id)

  // Lógica de ordenação
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB);
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
      <header className={styles.headerSection}>
        <div className={styles.titleBadge}>
          <h3 id="sidebar-title" className={styles.title}>
            Membros
          </h3>
          <span className={styles.countBadge}>{members.length}</span>
        </div>
      </header>

      <nav className={styles.listSection}>
        <ul className={styles.list}>
          {sortedMembers.map((member) => {
            
            const isOnline = onlineUsers.includes(member.userId)
            return (
              <li key={member.userId} className={styles.listItem}>
                <MemberCard member={member} isOnline={isOnline} />
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}