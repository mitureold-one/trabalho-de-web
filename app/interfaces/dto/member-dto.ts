export interface MemberDto {
  userId: string;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'member';
  joinedAt: string;
}