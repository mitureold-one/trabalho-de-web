import { supabase } from "./Supa-base";
import { storageDao } from "@/app/interfaces/dao/storage-dao";
import { userDao } from "@/app/interfaces/dao/user-dao";
import { UserDto } from "@/app/interfaces/dto/user-dto";

/**
 * Registra um novo usuário, faz upload do avatar e cria o perfil no banco.
 */
export async function registrarUsuario({ email, password, name, file }: any): Promise<UserDto> {
  // 1. Criação da credencial no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }, 
  });

  if (authError || !authData.user) {
    // Aqui capturamos o erro "User already registered" que você viu no console
    throw authError || new Error("Não foi possível criar suas credenciais.");
  }

  const user = authData.user;
  let avatarUrl = "/Avatar_default.png";

  // 2. Upload do Avatar (via StorageDao)
  if (file) {
    try {
      avatarUrl = await storageDao.uploadAvatar(file, user.id);
    } catch (err) {
      console.warn("⚠️ Falha no upload do avatar, usando imagem padrão.");
      // Não damos throw aqui para não travar o cadastro por causa de uma foto
    }
  }

  // 3. Sincronização do Perfil (via UserDao)
  // O upsert resolve: se a trigger criou, ele atualiza. Se não criou, ele insere.
  try {
    await userDao.upsertProfile(user.id, name, avatarUrl);
  } catch (error) {
    throw new Error("Credenciais criadas, mas houve um erro ao configurar seu perfil.");
  }

  // 4. Busca os dados finais e transforma em DTO
  // É melhor buscar do banco após o upsert para garantir que temos o ProfileRow completo
  const finalProfile = await userDao.fetchProfile(user.id);
  // ... dentro do registrarUsuario
  
  return userDao.mapToDto(user, finalProfile);
}

/**
 * Autentica o usuário e retorna o DTO completo (Auth + Perfil)
 */
export async function loginUsuario(email: string, pass: string): Promise<UserDto> {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: email.trim(), 
    password: pass 
  });

  if (error) throw error; 

  // O DAO resolve a busca do perfil e a transformação para DTO
  const profile = await userDao.fetchProfile(data.user.id);
  return userDao.mapToDto(data.user, profile);
}

/**
 * Recupera a sessão atual e reconstrói o usuário se houver um token válido
 */
export async function getSessionUser(): Promise<UserDto | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  // O DAO garante que, mesmo em uma nova sessão, os dados do perfil venham atualizados
  const profile = await userDao.fetchProfile(session.user.id);
  return userDao.mapToDto(session.user, profile);
}

/**
 * Encerra a sessão no Supabase
 */
export async function logoutUsuario(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}