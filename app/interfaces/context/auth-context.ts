// Este arquivo define o contexto de autenticação para a aplicação,
// utilizando React Context API e Supabase para gerenciar a autenticação do usuário.
import { UserDto } from "../dto/user-dto";

export interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}