import { messageDao } from "@/app/_interfaces/dao/message-dao"
import { MessageDto } from "@/app/_interfaces/dto/message-dto"

/**
 * MessageService - Camada de serviço para operações de mensagens
 * 
 * RESPONSABILIDADE: Orquestrar lógica de negócio de mensagens
 * - Nunca acessa banco de dados diretamente
 * - SEMPRE usa messageDao para todas as operações CRUD
 * - Valida entrada antes de enviar
 * - Trata erros com mensagens amigáveis
 * 
 * PADRÃO:
 * - Validação (conteúdo, sessão, permissões)
 * - Chamada ao messageDao
 * - Tratamento de erros
 * - Retorno de DTOs
 */

/**
 * Envia uma nova mensagem em uma sala
 * 
 * @param roomId - ID da sala
 * @param content - Conteúdo da mensagem (1-1000 caracteres)
 * @returns MessageDto da mensagem criada
 */
export async function enviarMensagem(roomId: string, content: string): Promise<MessageDto> {
  // Validação de entrada
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (!content || content.trim().length === 0) {
    throw new Error("A mensagem não pode estar vazia.")
  }

  if (content.length > 1000) {
    throw new Error("A mensagem não pode exceder 1000 caracteres.")
  }

  try {
    return await messageDao.sendMessage(roomId, content.trim())
  } catch (error) {
    console.error("[messageService] Erro ao enviar mensagem:", error)
    throw error
  }
}

/**
 * Busca mensagens de uma sala com paginação
 * 
 * @param roomId - ID da sala
 * @param limit - Quantidade de mensagens (padrão: 50)
 * @returns Array de MessageDto
 */
export async function buscarMensagensdareSala(
  roomId: string,
  limit = 50
): Promise<MessageDto[]> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  try {
    return await messageDao.getMessagesByRoom(roomId, limit)
  } catch (error) {
    console.error("[messageService] Erro ao buscar mensagens:", error)
    throw error
  }
}

/**
 * Busca mensagens posteriores a uma data (para histórico paginado)
 * 
 * @param roomId - ID da sala
 * @param fromDate - Data inicial (ISO string)
 * @param limit - Quantidade de mensagens (padrão: 50)
 * @returns Array de MessageDto
 */
export async function buscarMensagensApos(
  roomId: string,
  fromDate: string,
  limit = 50
): Promise<MessageDto[]> {
  if (!roomId || roomId.trim().length === 0) {
    throw new Error("ID da sala é obrigatório.")
  }

  if (!fromDate || fromDate.trim().length === 0) {
    throw new Error("Data é obrigatória.")
  }

  try {
    return await messageDao.getMessagesAfter(roomId, fromDate, limit)
  } catch (error) {
    console.error("[messageService] Erro ao buscar mensagens:", error)
    throw error
  }
}

/**
 * Busca uma mensagem específica por ID
 * 
 * @param messageId - ID da mensagem
 * @returns MessageDto ou null se não encontrada
 */
export async function buscarMensagem(messageId: string): Promise<MessageDto | null> {
  if (!messageId || messageId.trim().length === 0) {
    throw new Error("ID da mensagem é obrigatório.")
  }

  try {
    return await messageDao.getMessageById(messageId)
  } catch (error) {
    console.error("[messageService] Erro ao buscar mensagem:", error)
    return null
  }
}

/**
 * Edita o conteúdo de uma mensagem
 * 
 * @param messageId - ID da mensagem
 * @param novoConteudo - Novo conteúdo (1-1000 caracteres)
 * @returns MessageDto atualizada
 */
export async function editarMensagem(
  messageId: string,
  novoConteudo: string
): Promise<MessageDto> {
  if (!messageId || messageId.trim().length === 0) {
    throw new Error("ID da mensagem é obrigatório.")
  }

  if (!novoConteudo || novoConteudo.trim().length === 0) {
    throw new Error("O novo conteúdo não pode estar vazio.")
  }

  if (novoConteudo.length > 1000) {
    throw new Error("A mensagem não pode exceder 1000 caracteres.")
  }

  try {
    return await messageDao.editMessage(messageId, novoConteudo.trim())
  } catch (error) {
    console.error("[messageService] Erro ao editar mensagem:", error)
    throw error
  }
}

/**
 * Deleta uma mensagem
 * 
 * @param messageId - ID da mensagem
 */
export async function deletarMensagem(messageId: string): Promise<void> {
  if (!messageId || messageId.trim().length === 0) {
    throw new Error("ID da mensagem é obrigatório.")
  }

  try {
    await messageDao.deleteMessage(messageId)
  } catch (error) {
    console.error("[messageService] Erro ao deletar mensagem:", error)
    throw error
  }
}
