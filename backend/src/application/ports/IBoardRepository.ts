export interface BoardWithMembers {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdAt: Date;
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string; email: string };
  }>;
  columns: Array<{
    id: string;
    name: string;
    position: number;
    color: string;
    cards: Array<{
      id: string;
      title: string;
      description: string | null;
      dueDate: Date | null;
      position: number;
      createdAt: Date;
      tags: Array<{ id: string, name: string, color: string }>;
      assignedMembers: Array<{ id: string, name: string, email: string }>;
      _count: { activities: number };
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface IBoardRepository {
  create(data: {
    name: string;
    description?: string;
    columns: Array<{ name: string; position: number; color: string }>;
    adminUserId: string;
  }): Promise<{ id: string; name: string; inviteCode: string }>;

  findById(id: string): Promise<BoardWithMembers | null>;

  findByInviteCode(code: string): Promise<{ id: string; name: string } | null>;

  findByUserId(userId: string): Promise<Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    role: string;
    memberCount: number;
  }>>;

  addMember(boardId: string, userId: string, role?: string): Promise<void>;

  isMember(boardId: string, userId: string): Promise<boolean>;

  createTag(boardId: string, data: { name: string; color: string }): Promise<{ id: string; name: string; color: string }>;

  getTags(boardId: string): Promise<Array<{ id: string; name: string; color: string }>>;
}
