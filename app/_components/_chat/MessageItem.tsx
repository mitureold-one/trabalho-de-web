import s from "@/app/styles/chat/messageitem.module.css";

interface MessageItemProps {
  msg: any; 
  isMine: boolean;
}

export default function MessageItem({ msg, isMine }: MessageItemProps) {
  return (
    /* ✅ Usamos <article> para cada mensagem e aria-label para contexto */
    <article
      className={`${s.messageRow} ${isMine ? s.myMessage : s.theirMessage}`}
      aria-label={`Mensagem de ${isMine ? "você" : msg.profiles?.name}`}
    >
      {!isMine && (
        <img
          src={msg.profiles?.avatar_url || "/Avatar_default.png"}
          className={s.miniAvatar}
          alt="" 
          aria-hidden="true"
        />
      )}

      {/* ✅ A bolha em si é o container do conteúdo */}
      <div className={`${s.bubble} ${isMine ? s.myBubble : s.theirBubble}`}>
        {!isMine && (
          <span className={s.userLabel}>
            {msg.profiles?.name}
          </span>
        )}

        <p className={s.content}>{msg.content}</p>

        {/* ✅ A hora é um dado complementar, usamos <time> */}
        <time className={s.timeTag}>
          {new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}