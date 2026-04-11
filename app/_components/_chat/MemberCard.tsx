"use client"

import Link from "next/link"
import styles from "@/app/styles/chat/membercard.module.css"
import { MemberDto } from "@/app/interfaces/dto/member-dto" 

interface MemberCardProps {
  member: MemberDto 
  isOnline: boolean
}

export default function MemberCard({ member, isOnline }: MemberCardProps) {
  return (
    <Link 
      href={`/profile/${member.userId}`} 
      className={styles.memberLink}
      title={`Ver perfil de ${member.name}`}
    >
      <article className={styles.memberItem}>
        
        <figure className={styles.avatarContainer}>
          <img 
            // 🔄 Mapeado do DTO (era member.avatar)
            src={member.avatarUrl || "/Avatar_default.png"} 
            alt={`Avatar de ${member.name}`} 
            className={styles.avatar} 
            onError={(e) => { e.currentTarget.src = "/Avatar_default.png" }}
          />
          <span 
            className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} 
            aria-hidden="true"
          />
        </figure>
        
        <div className={styles.info}>
          {/* 🔄 Mapeado do DTO (era member.nome) */}
          <strong className={styles.name}>{member.name}</strong>
          
          <footer className={styles.role}>
            {member.role === 'admin' ? (
              <div className={styles.adminBadge}>
                <img src="/verificacao-de-escudo.png" alt="Selo de Administrador" />
                <span>Admin</span>
              </div>
            ) : (
              <span className={styles.memberText}>Membro</span>
            )}
          </footer>
        </div>

      </article>
    </Link>
  )
}