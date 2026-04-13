import { ProfileRow } from "@/app/_types/profile";

/**
 * RoomMemberQueryResult - Tipo de resultado de query do Supabase
 * 
 * Representa a estrutura retornada quando buscamos membros de uma sala
 * com JOIN com a tabela de profiles.
 * 
 * UTILIDADE:
 * - Type safety para fazer cast do resultado `supabase.from("room_members").select(...)`
 * - Documenta a estrutura esperada do JOIN entre room_members + profiles
 * - Facilita manutenção: se a query mudar, esse tipo também deve mudar
 * 
 * USADO EM:
 * - roomDao.getParticipants() → mapeia para MemberDto[]
 * 
 * ESTRUTURA:
 * Resultado da query: SELECT role, joined_at, profiles(id, name, avatar_url) FROM room_members
 * 
 * Exemplo bruto:
 * {
 *   role: "admin",
 *   joined_at: "2026-04-12T10:00:00Z",
 *   profiles: {
 *     id: "user-123",
 *     name: "João",
 *     avatar_url: "/avatars/123.jpg"
 *   }
 * }
 */
export interface RoomMemberQueryResult {
  role: 'admin' | 'member';
  joined_at: string;
  profiles: ProfileRow | null;
}