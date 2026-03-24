"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Chatbox from "@/components/chat/chatbox";
import { useAuth } from "@/AuthContext";
import styles from "@/styles/chat/chat.module.css";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !roomId) {
    return (
      /* aria-live para avisar que o conteúdo vai mudar após o loading */
      <div className={styles.loadingContainer} role="alert" aria-busy="true">
        <div className={styles.spinner}></div>
        <p>Sincronizando com a sala...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    /* ✅ Usamos o ID da sala no aria-label para SEO e Acessibilidade */
    <div className={styles.chatPageWrapper}>
      <Chatbox
        roomId={roomId}
        currentUser={user} 
      />
    </div>
  );
}