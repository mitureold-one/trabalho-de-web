"use client"; 

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadAvatar, updateAvatar } from "@/lib/profile";

export default function EditAvatar() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Busca o usuário de forma segura
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Usuário não autenticado.");
      }

      // 2. Upload da imagem para o bucket (Storage)
      const url = await uploadAvatar(file, user.id);

      // 3. Atualiza a URL no perfil do usuário (Database)
      await updateAvatar(url, user.id);

      alert("Avatar atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      alert("Falha ao carregar imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="avatar-upload" className="cursor-pointer">
        {isUploading ? "Enviando..." : "Alterar Foto de Perfil"}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={handleFileChange}
      />
    </div>
  );
}