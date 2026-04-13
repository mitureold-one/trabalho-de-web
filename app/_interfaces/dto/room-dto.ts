// RoomDto contém as informações completas de uma sala de chat/discussão.
// Inclui dados básicos da sala, informações do criador e lista de membros.
// Usado para exibir detalhes da sala em componentes e gerenciar participantes.

import { MemberDto } from "./member-dto";

export interface RoomDto {
  // Identificação da sala
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;

  // Informações do criador
  creator: {
    name: string;
    avatarUrl: string;
  };

  // Informações de membros
  /**
   * Contagem total de membros (usado para lista rápida, busca)
   */
  memberCount?: number;

  /**
   * Lista completa de membros da sala com detalhes (nome, avatar, role, data de entrada)
   * Preenchida quando precisa exibir a legenda de participantes ou gerenciar permissões
   */
  members?: MemberDto[];
}