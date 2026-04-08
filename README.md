💬 Projeto Chat - Documentação Técnica
Bem-vindo à documentação central do nosso sistema de chat em tempo real. Este documento serve como guia para desenvolvedores sobre a arquitetura, segurança e fluxos da aplicação.

📂 Estrutura do Projeto
O projeto utiliza a estrutura do Next.js App Router.

app/: Rotas e lógica da aplicação.

_components/: UI organizada por contexto (_auth, _chat, _room, _ui).

chat/[id]/: Interface de conversação em tempo real.

rooms/: Lobby e gerenciamento de salas.

lib/: Abstrações de serviços (Auth, Chat, Rooms, Supabase).

hooks/: Lógica de estado compartilhada (useAuth, useChat).

styles/: Temas globais e CSS Modules.

🛠 Tecnologias e Dependências
Framework: Next.js 16 (App Router) & React 19.

Estilização: Tailwind CSS v4 (PostCSS nativo).

BaaS (Backend): Supabase (Auth, Database, Storage, Realtime).

Ícones: Lucide React.

Linguagem: TypeScript.

🔐 Fluxo de Autenticação & Segurança
AuthContext.tsx
O coração da aplicação. Gerencia o estado global do usuário e protege rotas.

Race Conditions: Utilizamos a flag isSigningIn (ref) para evitar loops entre o login manual e o listener de sessão do Supabase.

Persistência: O refreshUser garante que dados do perfil (profiles) sejam mesclados com os dados de autenticação.

Camada de Serviço (lib/Auth.ts)
Mapper Pattern: A função mapUserData centraliza a construção do objeto do usuário. Se o esquema do banco mudar, alteramos apenas aqui.

Registro Atômico: Criação de conta -> Upload de Avatar -> Upsert de Perfil.

💬 Lógica de Chat & Mensageria (lib/Chat.ts)
O sistema foi desenhado para ser resiliente e seguro:

Paginação Inversa: Buscamos as últimas 50 mensagens e invertemos o array no cliente para manter a ordem cronológica natural.

Anti-Impersonation: O user_id nunca é aceito via parâmetro no envio de mensagens; ele é validado no servidor via supabase.auth.getUser().

Performance: Joins automáticos trazem dados do perfil (name, avatar_url) em uma única query.

🏘️ Gestão de Salas (lib/Rooms.ts)
Gerencia o "Lobby" da aplicação:

Salas Privadas: A verificação de senha é feita via RPC (Remote Procedure Call) no Postgres. A senha digitada nunca é comparada no frontend.

Tratamento de Erros: Códigos de erro do Postgres (ex: 23505 para duplicidade) são convertidos em notificações amigáveis.

🚀 Como Rodar Localmente
Dependências:

Bash
npm install
Variáveis de Ambiente:
Crie um .env.local com as chaves do seu projeto Supabase:

Snippet de código
NEXT_PUBLIC_SUPABASE_URL=seu_projeto_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
Desenvolvimento:

Bash
npm run dev
⚠️ Regras de Ouro para o Time
Tailwind v4: Não utilize arquivos de configuração antigos. O v4 processa variáveis diretamente no CSS.

RLS (Row Level Security): Sempre verifique se as políticas de segurança estão ativas no dashboard do Supabase antes de subir novas tabelas.

Imagens: Limite de upload de 2MB. O processamento é feito na lib/Auth.ts.

Dica: Para adicionar uma nova funcionalidade, verifique se ela se encaixa em uma das lib/ existentes ou se precisa de um novo serviço isolado. Mantenha a interface limpa!