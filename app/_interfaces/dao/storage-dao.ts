/**
 * storageDao é responsável CENTRALIZADO por TODOS os uploads de arquivo do sistema.
 * 
 * Responsabilidades:
 * - Validação de tipo de arquivo (apenas imagens)
 * - Validação de tamanho (máx 3MB)
 * - Upload para Supabase Storage
 * - Geração de URLs públicas
 * - Organização em buckets e pastas por usuário/contexto
 * 
 * Nenhum componente deve fazer upload direto ao Supabase Storage.
 * Tudo passa por aqui!
 */
import { supabase } from "@/app/_lib/Supa-base";

export const storageDao = {
  /**
   * Função genérica interna para gerenciar uploads de arquivo
   * @param bucket Nome do bucket no Supabase Storage
   * @param file Arquivo a enviar
   * @param path Caminho completo dentro do bucket
   * @returns URL pública do arquivo enviado
   */
  async uploadFile(bucket: string, file: File, path: string): Promise<string> {
    // Validações básicas
    if (!file.type.startsWith("image/")) {
      throw new Error("Formato inválido. Apenas imagens são permitidas. 🖼️");
    }

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      throw new Error("A imagem deve ter no máximo 3MB. ⚖️");
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) {
      console.error(`❌ [StorageDao.uploadFile] Error:`, uploadError);
      throw new Error("Falha ao salvar imagem no servidor.");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // ─── Uploads de Perfil ──────────────────────────────────────────────────────

  /**
   * Upload de avatar do usuário
   * Armazena em: avatars/{userId}/avatar-{timestamp}.{ext}
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const path = `${userId}/avatar-${Date.now()}.${fileExt}`;
    return this.uploadFile("avatars", file, path);
  },

  /**
   * Upload de banner/capa do usuário
   * Armazena em: avatars/{userId}/banner-{timestamp}.{ext}
   */
  async uploadBanner(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const path = `${userId}/banner-${Date.now()}.${fileExt}`;
    return this.uploadFile("avatars", file, path);
  },

  // ─── Uploads Genéricos ─────────────────────────────────────────────────────

  /**
   * Upload genérico de imagem para qualquer contexto
   * @param file Arquivo a enviar
   * @param bucket Nome do bucket
   * @param folder Pasta dentro do bucket (ex: "profile", "messages", "rooms")
   * @param userId ID do usuário proprietário (para organização)
   */
  async uploadImage(
    file: File, 
    bucket: string, 
    folder: string, 
    userId: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const path = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    return this.uploadFile(bucket, file, path);
  },

  /**
   * Delete um arquivo do Supabase Storage
   * @param bucket Nome do bucket
   * @param path Caminho completo do arquivo
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error(`❌ [StorageDao.deleteFile] Error:`, error);
        throw new Error("Falha ao deletar imagem.");
      }
    } catch (err: any) {
      console.error(`❌ [StorageDao.deleteFile] Exception:`, err);
      throw new Error(err.message || "Falha ao deletar imagem.");
    }
  },
};