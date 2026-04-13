/**
 * MessageDto contém os dados básicos de uma mensagem no sistema.
 * Representa uma mensagem enviada em uma sala de chat.
 * 
 * Responsabilidade: messageDao
 * - messageDao gerencia: send, edit, delete, fetch de mensagens
 * - Suporta edição de mensagens (updatedAt track quando foi editado)
 * - Valida conteúdo: 1-1000 caracteres
 */
export interface MessageDto {
  /**
   * ID único da mensagem
   */
  id: string;

  /**
   * Conteúdo/texto da mensagem
   * Validação: 1-1000 caracteres
   */
  content: string;

  /**
   * Data e hora de criação da mensagem
   */
  createdAt: string;

  /**
   * Data e hora da última edição da mensagem (se foi editada)
   * Presente apenas se a mensagem foi editada após criação
   */
  updatedAt?: string;

  /**
   * ID da sala onde a mensagem foi enviada
   */
  roomId: string;

  /**
   * ID do usuário que enviou a mensagem
   */
  userId: string;

  /**
   * Dados do autor da mensagem (denormalizados para exibição rápida)
   */
  author: {
    /**
     * Nome do autor
     */
    name: string;

    /**
     * Avatar do autor
     */
    avatarUrl: string;
  };
}