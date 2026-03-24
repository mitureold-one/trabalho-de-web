"use client"

import styles from "@/styles/footer.module.css"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.chatFooterInfo}>
      <div className={styles.footerContent}>
        
        <div className={styles.systemStatus}>
          <div className={styles.statusBadge}>
            <span className={styles.pulseDot}></span>
            <span className={styles.statusText}>Sistema Online</span>
          </div>
          <span className={styles.divider}>|</span>
          <span className={styles.version}>v1.0</span>
        </div>

        <div className={styles.branding}>
          <div className={styles.personalText}>
            <p className={styles.copyright}>
              Chat da Galera <span>© {currentYear}</span>
            </p>
            <p className={styles.bio}>
              Oi, eu sou o <strong>Guilherme</strong>. O Chat da Galera é um projetinho que passei 
              mais ou menos um mês fazendo em março de 2026. Ainda estou aprendendo, então tem 
              muita coisa para melhorar. Gostou? Deixa um feedback no LinkedIn ou um favorito 
              no GitHub. Valeu, até o próximo projeto!
            </p>
          </div>

          <div className={styles.socialLinks}>
            <a href="https://github.com/mitureold-one" target="_blank" rel="noopener noreferrer">
              <img src="/github.png" alt="GitHub" className={styles.socialIcon} />
            </a>
            <a href="https://www.linkedin.com/in/guicruz13/" target="_blank" rel="noopener noreferrer">
              <img src="/linkedin.png" alt="LinkedIn" className={styles.socialIcon} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}