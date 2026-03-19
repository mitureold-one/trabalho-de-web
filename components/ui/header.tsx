"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import styles from "@/styles/ui/header.module.css"
import AvatarHeader from "./AvatarHeader" 
import Logo from "@/components/ui/LogoHeader";

export default function Header({ isCollapsed, setIsCollapsed }: any) {
  const pathname = usePathname()
  
  if (pathname === "/") return null

  return (
    <header className={`${styles.header} ${isCollapsed ? styles.collapsed : ""}`}> 
      
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <img src="\angulo-pequeno-direita.png" alt="botão de expadir o cabeçalho" /> 
        : <img src="\angulo-pequeno-esquerdo.png" alt="botão de colapsar o cabeçalho" /> }
      </button>

      <div className={styles.logoWrapper}>
        <Logo isCollapsed={isCollapsed} />
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <Link href="/salas" className={pathname === "/salas" ? styles.activeLink : ""}>
              <span className={styles.navIcon}>
                <img src="/casa.png" alt="icone de home" />
              </span>
              {!isCollapsed && <span className={styles.navText}>Salas</span>}
            </Link>
          </li>
          <li>
            <Link href="/amigos" className={pathname === "/amigos" ? styles.activeLink : ""}>
              <span className={styles.navIcon}>
                <img src="/usuarios.png" alt="icone de amigos" />
              </span>
              {!isCollapsed && <span className={styles.navText}>Sua Galera !</span>}
            </Link>
          </li>
          <li>
            <Link href="/explorar" className={pathname === "/explorar" ? styles.activeLink : ""}>
              <span className={styles.navIcon}>
                <img src="/usuarios-alt.png" alt="icone de explorar" />
              </span>
              {!isCollapsed && <span className={styles.navText}>Explorar</span>}
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.userArea}>
        <AvatarHeader isCollapsed={isCollapsed} />
      </div>
    </header>
  )
}