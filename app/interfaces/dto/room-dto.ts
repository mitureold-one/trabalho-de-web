export interface RoomDto {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  memberCount?: number;
  isPrivate: boolean;
  createdAt: string;
  creator: {
    name: string;
    avatarUrl: string;
  };
}
