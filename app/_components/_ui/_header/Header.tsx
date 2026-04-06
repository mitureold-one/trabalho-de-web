"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import styles from "@/app/styles/ui/header.module.css"

import AvatarHeader from "./HeaderAvatar" 
import Logo from "@/app/_components/_ui/_header/LogoHeader"

interface HeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsThemeOpen: (open: boolean) => void; 
}

const NAV_ROUTES = [
  { href: "/rooms", label: "Salas", icon: "/casa.png" },
  { href: "/amigos", label: "Galera", icon: "/usuarios.png" },
  { href: "/explorar", label: "Explorar", icon: "/usuarios-alt.png" },
];

export default function Header({ isCollapsed, setIsCollapsed, setIsThemeOpen }: HeaderProps) {
  const pathname = usePathname()
  
  if (pathname === "/") return null

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}> 
      
      {/* 1. Toggle Sidebar (Desktop) */}
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsCollapsed(prev => !prev)}
        aria-label="Expandir/Recolher Menu"
      >
        <Image 
          src={isCollapsed ? "/angulo-pequeno-direita.png" : "/angulo-pequeno-esquerdo.png"} 
          alt="" width={14} height={14} 
        />
      </button>

      {/* 2. Logo */}
      <div className={styles.logoContainer}>
        <Logo isCollapsed={isCollapsed} />
      </div>

      {/* 3. Navegação Central */}
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {NAV_ROUTES.map((route) => {
            const isActive = pathname.startsWith(route.href);
            return (
              <li key={route.href}>
                <Link 
                  href={route.href} 
                  className={isActive ? styles.activeLink : ""}
                >
                  <div className={styles.iconBox}>
                    <Image src={route.icon} alt="" width={22} height={22} />
                  </div>
                  <span className={styles.linkText}>{route.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* 4. Área de Configuração (Desktop Only) */}
      {/* Mantemos aqui porque no Desktop não tem o botão flutuante */}
      <div className={styles.settingsArea}>
        <button 
          className={styles.themeBtn} 
          onClick={() => setIsThemeOpen(true)}
          title="Personalizar Cores"
        >
          <div className={styles.iconBox}>
            <Image src="/definicoes.png" alt="" width={20} height={20} className={styles.gearIcon} />
          </div>
          {!isCollapsed && <span className={styles.linkText}>Aparência</span>}
        </button>
      </div>

      {/* 5. Footer (Apenas Avatar agora) */}
      <footer className={styles.sidebarFooter}>
        <AvatarHeader isCollapsed={isCollapsed} />
      </footer>
    </aside>
  )
}