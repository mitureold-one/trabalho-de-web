// Este arquivo define a interface UserDto, que é um Data Transfer Object (DTO) usado para transferir dados de usuário entre diferentes camadas da aplicação.
//  Ele inclui propriedades como id, email, name, avatarUrl e createdAt, que representam as informações básicas de um usuário. Essa interface é útil para garantir
//  que os dados do usuário sejam consistentes e bem estruturados ao serem transferidos entre o frontend e o backend da aplicação.
export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
}