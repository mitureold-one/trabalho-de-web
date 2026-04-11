"use client";

import s from "@/app/styles/chat/messageitem.module.css";
import { MessageDto } from "@/app/interfaces/dto/message-dto"; 

interface MessageItemProps {
  msg: MessageDto; 
  isMine: boolean;
}

export default function MessageItem({ msg, isMine }: MessageItemProps) {
  return (
    <article
      className={`${s.messageRow} ${isMine ? s.myMessage : s.theirMessage}`}
      aria-label={`Mensagem de ${isMine ? "você" : msg.author.name}`}
    >
      {!isMine && (
        <img
          // 🔄 Mudança: msg.profiles.avatar_url -> msg.author.avatarUrl
          src={msg.author.avatarUrl || "/Avatar_default.png"}
          className={s.miniAvatar}
          alt="" 
          aria-hidden="true"
          onError={(e) => { e.currentTarget.src = "/Avatar_default.png" }}
        />
      )}

      <div className={`${s.bubble} ${isMine ? s.myBubble : s.theirBubble}`}>
        {!isMine && (
          <span className={s.userLabel}>
            {/* 🔄 Mudança: msg.profiles.name -> msg.author.name */}
            {msg.author.name}
          </span>
        )}

        <p className={s.content}>{msg.content}</p>

        <time className={s.timeTag}>
          {/* 🔄 Mudança: msg.created_at -> msg.createdAt */}
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}