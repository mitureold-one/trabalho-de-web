export interface Room {
  id: string;
  name: string;
  created_at: string;
  is_private: boolean;
  tema?: string;
  // O Supabase retorna um array no join, mas nós "limpamos" na lib para ser um objeto
  creator?: {
    name: string;
    avatar_url: string;
  };
  // Se você faz contagem de membros via join
  room_members?: { count: number }[];
}