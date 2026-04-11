import { ProfileRow } from "@/app/interfaces/util/profilerow";

// Representa a estrutura da linha retornada pela query com Join
export interface RoomMemberQueryResult {
  role: 'admin' | 'member';
  joined_at: string;
  profiles: ProfileRow | null;
}