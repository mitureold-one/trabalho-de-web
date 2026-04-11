// O StorageDao é responsável por lidar com o armazenamento de arquivos,
//  especificamente para o upload de avatares dos usuários.
//  Ele utiliza o Supabase Storage para armazenar as imagens em um bucket dedicado,
//  garantindo que cada usuário tenha sua própria pasta organizada por ID.
//  O método uploadAvatar inclui validações para garantir que apenas imagens sejam aceitas
//  e que o tamanho do arquivo não exceda 2MB, seguindo as regras de negócio definidas
//  para o armazenamento. Em caso de sucesso, ele retorna a URL pública da imagem,
//  que pode ser usada para exibir o avatar do usuário na aplicação.
//  Em caso de falha, ele lança erros específicos para ajudar na depuração
//  e na experiência do usuário.
import { supabase } from "@/app/lib/Supa-base";

export const storageDao = {
  /**
   * Faz o upload de uma imagem de avatar para o bucket 'avatars'
   * @param file Arquivo vindo do input
   * @param userId ID do usuário para organizar as pastas no bucket
   * @returns URL pública da imagem
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    // 1. Validações (Regra de Negócio do Storage)
    if (!file.type.startsWith("image/")) {
      throw new Error("Formato inválido. Apenas imagens são permitidas. 🖼️");
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      throw new Error("A imagem deve ter no máximo 2MB. ⚖️");
    }

    // 2. Preparação do Caminho
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // 3. Execução do Upload
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type // Boa prática: definir o content-type explicitamente
      });

    if (uploadError) {
      console.error("❌ [StorageDao.uploadAvatar]:", uploadError);
      throw new Error("Falha técnica ao salvar a imagem no servidor.");
    }

    // 4. Retorno da URL Pública
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  }
};