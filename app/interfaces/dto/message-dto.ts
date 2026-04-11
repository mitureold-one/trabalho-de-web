export interface MessageDto {
  id: string;
  content: string;
  createdAt: string;
  roomId: string;
  userId: string;
  author: {
    name: string;
    avatarUrl: string;
  };
}