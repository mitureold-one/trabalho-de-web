"use client"

import Link from "next/link"
import styles from "@/app/styles/chat/membercard.module.css"

interface MemberCardProps {
  member: any
  isOnline: boolean
}

export default function MemberCard({ member, isOnline }: MemberCardProps) {
  return (
    /* O Link funciona como o nosso container principal navegável */
    <Link 
      href={`/profile/${member?.userId || ''}`} 
      className={styles.memberLink}
      title={`Ver perfil de ${member.nome}`}
    >
      {/* Usamos <article> porque cada card é um conteúdo independente. 
         Poderia ser um <li> se o seu loop estivesse dentro de uma <ul>.
      */}
      <article className={styles.memberItem}>
        
        {/* Figure é ótimo para envolver imagens com significado */}
        <figure className={styles.avatarContainer}>
          <img 
            src={member.avatar || "/Avatar_default.png"} 
            alt={`Avatar de ${member.nome}`} 
            className={styles.avatar} 
          />
          {/* Status visual - Usamos aria-hidden para o leitor de tela não ler uma "bolinha" */}
          <span 
            className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`} 
            aria-hidden="true"
          />
        </figure>
        
        <div className={styles.info}>
          {/* h4 ou strong para o nome, dependendo da hierarquia da página */}
          <strong className={styles.name}>{member.nome}</strong>
          
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