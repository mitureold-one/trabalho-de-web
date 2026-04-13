import { roomDao } from "@/app/_interfaces/dao/room-dao"
import { RoomDto } from "@/app/_interfaces/dto/room-dto"
import { MemberDto } from "@/app/_interfaces/dto/member-dto"

/**
 * RoomService - Camada de serviço para operações de salas
 * 
 * RESPONSABILIDADE: Orquestrar lógica de negócio de salas e membros
 * - Nunca acessa banco de dados diretamente
 * - SEMPRE usa roomDao para todas as operações CRUD
 * - Valida entrada antes de enviar
 * - Trata erros com mensagens amigáveis
 * 
 * PADRÃO:
 * - Validação (nome, acesso, permissões)
 * - Chamada ao roomDao
 * - Tratamento de erros
 * - Retorno de DTOs
 */

/**
 * Cria uma nova sala de chat
 * 
 * @param name - Nome da sala
 * @param isPrivate - Se a sala é privada
 * @param password - Senha (obrigatória se isPrivate=true)
 * @returns RoomDto da sala criada
 */
export async function criarSala(
  name: string,
  isPrivate: boolean,
  password?: string
): Promise<RoomDto> {
  // Validação de entrada
  if (!name || name.trim().length === 0) {
    throw new Error("O nome da sala é obrigatório.")
  }

  if (name.trim().length > 100) {
    throw new Error("O nome da sala não pode exceder 100 caracteres.")
  }

  if (isPrivate && (!password || password.trim().length === 0)) {
    throw new Error("Uma senha é obrigatória para salas privadas.")
  }

  try {
    return await roomDao.createRoom(name.trim(), isPrivate, password)
  } catch (error) {
    console.error("[roomService] Erro ao criar sala:", error)
    throw error
  }
}

/**
 * Busca salas públicas com paginação
 * 
 * @param page - Número da página (começando em 0)
 * @param size - Quantidade por página (padrão: 20)
 * @returns Array de RoomDto
 */
export async function buscarSalas(page = 0, size = 20): Promise<RoomDto[]> {
  try {
    return await roomDao.getRooms(page, size)
  } catch (error) {
    console.error("[roomService] Erro ao buscar salas:", error)
    throw error
  }
}

/**
 * Busca uma sala específica por ID
 * 
 * @param roomId - ID da sala
 * @returns RoomDto ou null se não encontrada
 */
export async function buscarSala(roomId: string): Promise<RoomDto | null> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await roomDao.getRoomById(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao buscar sala:", error)
    return null
  }
}

/**
 * Busca uma sala com lista completa de membros
 * 
 * @param roomId - ID da sala
 * @returns RoomDto com membros populados
 */
export async function buscarSalaComMembros(roomId: string): Promise<RoomDto | null> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await roomDao.getRoomWithMembers(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao buscar sala com membros:", error)
    return null
  }
}

/**
 * Busca as salas que o usuário criou
 * 
 * @returns Array de RoomDto
 */
export async function buscarMinhasSalas(): Promise<RoomDto[]> {
  try {
    return await roomDao.getRoomsByUser()
  } catch (error) {
    console.error("[roomService] Erro ao buscar minhas salas:", error)
    throw error
  }
}

/**
 * Busca as salas que o usuário participa (como membro)
 * 
 * @returns Array de RoomDto
 */
export async function buscarSalasParticipo(): Promise<RoomDto[]> {
  try {
    return await roomDao.getUserJoinedRooms()
  } catch (error) {
    console.error("[roomService] Erro ao buscar salas que participo:", error)
    throw error
  }
}

/**
 * Busca salas por nome
 * 
 * @param query - Termo de busca
 * @param limit - Limite de resultados (padrão: 10)
 * @returns Array de RoomDto
 */
export async function buscarSalasPorNome(query: string, limit = 10): Promise<RoomDto[]> {
  if (!query || query.trim().length === 0) {
    throw new Error("Termo de busca é obrigatório.")
  }

  try {
    return await roomDao.searchRoomsByName(query.trim(), limit)
  } catch (error) {
    console.error("[roomService] Erro ao buscar salas:", error)
    throw error
  }
}

/**
 * Atualiza informações de uma sala (nome, privacidade, senha)
 * 
 * @param roomId - ID da sala
 * @param updates - Objeto com campos a atualizar
 * @returns RoomDto atualizada
 */
export async function atualizarSala(
  roomId: string,
  updates: {
    name?: string
    isPrivate?: boolean
    password?: string
  }
): Promise<RoomDto | null> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (updates.name && updates.name.trim().length > 100) {
    throw new Error("O nome da sala não pode exceder 100 caracteres.")
  }

  try {
    return await roomDao.updateRoom(roomId, updates)
  } catch (error) {
    console.error("[roomService] Erro ao atualizar sala:", error)
    throw error
  }
}

/**
 * Deleta uma sala (apenas o criador pode deletar)
 * 
 * @param roomId - ID da sala
 */
export async function deletarSala(roomId: string): Promise<boolean> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await roomDao.deleteRoom(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao deletar sala:", error)
    return false
  }
}

/**
 * Busca membros de uma sala
 * 
 * @param roomId - ID da sala
 * @returns Array de MemberDto
 */
export async function buscarMembros(roomId: string): Promise<MemberDto[]> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await roomDao.getParticipants(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao buscar membros:", error)
    throw error
  }
}

/**
 * Verifica se o usuário é membro de uma sala
 * 
 * @param roomId - ID da sala
 * @returns true se é membro, false caso contrário
 */
export async function verificarMembro(roomId: string): Promise<boolean> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await roomDao.isUserMemberOfRoom(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao verificar membro:", error)
    return false
  }
}

/**
 * Usuário entra em uma sala pública
 * 
 * @param roomId - ID da sala
 */
export async function entrarSala(roomId: string): Promise<void> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    const isMember = await roomDao.isUserMemberOfRoom(roomId)
    if (!isMember) {
      await roomDao.addMemberToRoom(roomId, "", "member")
    }
  } catch (error) {
    console.error("[roomService] Erro ao entrar na sala:", error)
    throw error
  }
}

/**
 * Usuário entra em uma sala privada com senha
 * 
 * @param roomId - ID da sala
 * @param password - Senha da sala
 */
export async function entrarSalaPrivada(roomId: string, password: string): Promise<void> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (!password || password.trim().length === 0) {
    throw new Error("Senha é obrigatória.")
  }

  try {
    await roomDao.verifyAndJoin(roomId, password)
  } catch (error) {
    console.error("[roomService] Erro ao entrar em sala privada:", error)
    throw error
  }
}

/**
 * Usuário sai de uma sala
 * 
 * @param roomId - ID da sala
 */
export async function sairSala(roomId: string): Promise<void> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    await roomDao.leaveRoom(roomId)
  } catch (error) {
    console.error("[roomService] Erro ao sair da sala:", error)
    throw error
  }
}

/**
 * Remove um membro de uma sala (apenas admin/criador)
 * 
 * @param roomId - ID da sala
 * @param userId - ID do usuário a remover
 */
export async function removerMembro(roomId: string, userId: string): Promise<void> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  try {
    await roomDao.removeMemberFromRoom(roomId, userId)
  } catch (error) {
    console.error("[roomService] Erro ao remover membro:", error)
    throw error
  }
}

/**
 * Atualiza o role de um membro (admin/member)
 * 
 * @param roomId - ID da sala
 * @param userId - ID do usuário
 * @param newRole - Novo role ('admin' ou 'member')
 */
export async function atualizarRoleMembro(
  roomId: string,
  userId: string,
  newRole: string
): Promise<boolean> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (!userId || userId.trim().length === 0) {
    throw new Error("ID do usuário é obrigatório.")
  }

  if (newRole !== "admin" && newRole !== "member") {
    throw new Error("Role deve ser 'admin' ou 'member'.")
  }

  try {
    return await roomDao.updateMemberRole(roomId, userId, newRole)
  } catch (error) {
    console.error("[roomService] Erro ao atualizar role:", error)
    return false
  }
}
