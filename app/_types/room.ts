/**
 * Room - Mapeamento da tabela 'rooms' do Supabase
 * 
 * Representa UMA LINHA EXATA (com dados relacionados) da tabela rooms no banco de dados.
 * Pode incluir dados do Join com profiles (criador) e contagem de membros.
 * 
 * RESPONSABILIDADE:
 * - Type-safe interface para dados brutos do Supabase quando buscados pela tabela rooms
 * - Documentar estrutura da tabela (quais campos existem, tipos)
 * - Intermediário entre resposta bruta do Supabase e RoomDto (domínio da app)
 * 
 * FLUXO DE MAPEAMENTO:
 * 
 * Supabase SELECT (Room) ← dados brutos com joins
 *     ↓
 * roomDao.mapToDto(raw: Room) → converte para RoomDto
 *     ↓
 * RoomDto (domínio da app) → componentes usam RoomDto
 * 
 * CAMPOS:
 * 
 * Identificação:
 * - id: UUID único da sala
 * 
 * Dados básicos:
 * - name: Nome da sala (ex: "JavaScript Brasil")
 * - created_at: Data de criação (ISO string)
 * - is_private: Se é privada (requer senha para entrar)
 * 
 * Dados opcionais/relacionados:
 * - tema?: Tema/categoria da sala (opcional, pode estar no banco ou não)
 * - creator?: Dados do criador (JOIN com profiles)
 *   - name: Nome do criador
 *   - avatar_url: Avatar do criador
 * - room_members?: Contagem de membros via aggregate
 *   - Array com um objeto { count: number }
 *   - Usado para exibir "10 membros na sala"
 * 
 * IMPORTANTE:
 * - room_members é array por limitação do Supabase Realtime/JS client
 * - Ao mapear para RoomDto, extrair o count: room_members?.[0]?.count
 * 
 * TABELA NO SUPABASE:
 * 
 * CREATE TABLE rooms (
 *   id uuid PRIMARY KEY,
 *   name text NOT NULL,
 *   created_at timestamp DEFAULT now(),
 *   is_private boolean DEFAULT false,
 *   user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
 *   password text, -- opcional, para salas privadas
 *   tema text -- opcional
 * );
 * 
 * CAMPOS NÃO INCLUÍDOS EM Room:
 * - user_id: FK para profiles(id), obtido via creator JOIN
 * - password: Nunca enviado para o frontend por segurança
 * 
 * RELATED TABLES:
 * - profiles: Criador da sala (user_id FK)
 * - room_members: Participantes (JOIN para contar/listar)
 * 
 * ALTERAÇÕES:
 * Se adicionar novo campo na tabela rooms do Supabase:
 * 1. Adicionar campo aqui em Room
 * 2. Atualizar roomDao.mapToDto se precisar transformar
 * 3. Atualizar RoomDto em _interfaces/dto/room-dto.ts se for campo importante
 */
export interface Room {
  // Identificação
  id: string;
  
  // Dados básicos
  name: string;
  created_at: string;
  is_private: boolean;
  
  // Dados opcionais
  tema?: string;
  
  // Dados relacionados (JOINs)
  creator?: {
    name: string;
    avatar_url: string;
  };
  
  // Contagem de membros via aggregate (JOIN com contagem)
  // Nota: Supabase retorna array, mas extractamos [0].count ao mapear
  room_members?: { count: number }[];
}