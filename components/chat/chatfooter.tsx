import styles from "@/styles/chat.module.css"

type ChatFooterProps = {
  room: any
}

function formatDate(date: string){
  const d = new Date(date)
  const data = d.toLocaleDateString("pt-BR")
  const hora = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  })

  return `${data} às ${hora}`
}

export default function ChatFooter({ room }: ChatFooterProps){
  if(!room) return null; 

  return (
    <footer className={styles.chatFooterInfo}>
      <div className={styles.footerContent}>
        <div className={styles.roomDetails}>
          <strong>{room.nome}</strong>
          <span> • Criada em {formatDate(room.created_at)}</span>
        </div>
        <p className={styles.copyright}>Chat da Galera ® 2026</p>
      </div>
    </footer>
  )
}