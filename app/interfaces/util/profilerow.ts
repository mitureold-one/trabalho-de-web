/*Essa interface representa uma linha na tabela 'profiles' do supabase */
export interface ProfileRow {
  id: string;  
  name: string;
  avatar_url: string;
  created_at: string;
}