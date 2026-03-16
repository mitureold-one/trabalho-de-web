"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import styles from "@/styles/header.module.css"
import AvatarHeader from "./AvatarHeader" 

export default function Header() {
  const pathname = usePathname()
  
  if (pathname === "/") return null

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Chat da Galera</div>
      <nav className={styles.nav}>
        <Link href="/salas">Salas</Link>
        <Link href="/amigos">Galera !</Link>
        <AvatarHeader />
      </nav>
    </header>
  )
}