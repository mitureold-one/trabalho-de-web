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
    options: { data: { name } }, // Salva o nome nos metadados como backup
  });

  if (authError || !authData.user) {
    throw authError || new Error("Não foi possível criar suas credenciais.");
  }

  const user = authData.user;
  let avatarUrl = "/Avatar_default.png";

  // 2. Upload do Avatar (Delega para o especialista: storageDao)
  if (file) {
    try {
      avatarUrl = await storageDao.uploadAvatar(file, user.id);
    } catch (err) {
      // Se o upload falhar, apenas avisamos e seguimos com o padrão
      // para não impedir o usuário de criar a conta.
      console.warn("⚠️ Falha no upload do avatar, usando imagem padrão.");
    }
  }

  // 3. Criação do Perfil no Banco (Delega para o especialista: userDao)
  try {
    await userDao.upsertProfile(user.id, name, avatarUrl);
  } catch (error) {
    // Se o perfil falhar aqui, o usuário existe no Auth mas não no banco (Profiles).
    // Em sistemas críticos, aqui você faria um "rollback" ou logaria o erro.
    throw new Error("Sua conta foi criada, mas houve um erro ao configurar seu perfil.");
  }

  // 4. Retorno do DTO (Transformação final para o App)
  return userDao.mapToDto(user, { 
    id: user.id, 
    name, 
    avatar_url: avatarUrl, 
    created_at: new Date().toISOString() 
  });
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