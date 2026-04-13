/**
 * MemberDto representa um membro participante de uma sala de chat.
 * Contém informações básicas do usuário dentro do contexto de uma sala.
 * 
 * Responsabilidade: roomDao
 * - roomDao gerencia: add, remove, update role de membros
 * - Retornado por: getParticipants(), getRoomWithMembers()
 */
export interface MemberDto {
  /**
   * ID do usuário membro da sala
   */
  userId: string;

  /**
   * Nome do membro (denormalizado para exibição)
   */
  name: string;

  /**
   * Avatar do membro (denormalizado para exibição)
   */
  avatarUrl: string;

  /**
   * Papel/permissão do membro na sala
   * - 'admin': pode gerenciar sala (editar, deletar, remover membros)
   * - 'member': membro regular (pode enviar mensagens)
   */
  role: 'admin' | 'member';

  /**
   * Data e hora em que o membro entrou na sala
   */
  joinedAt: string;
}