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
  if(!room){
    return <footer>Carregando dados da sala...</footer>
  }
  return (
    <footer className={styles.chatfooter}>
      <p> Plataforma Criada Por: Chat da Galera ®-2026 </p>
      <p>Informações da Sala:</p>
      <p>
        {room.nome}<br/>
        criado por: {room.id_user}<br/>
        Em: {formatDate(room.created_at)}
      </p>
    </footer>
  )
}