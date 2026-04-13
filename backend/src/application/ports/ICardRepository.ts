export interface ICardRepository {
  create(data: {
    title: string;
    description?: string;
    columnId: string;
    position: number;
  }): Promise<{ id: string; title: string; columnId: string; position: number }>;

  findById(cardId: string): Promise<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    columnId: string;
    column: { id: string; name: string; boardId: string };
  } | null>;

  moveToColumn(cardId: string, newColumnId: string, position: number): Promise<void>;

  getMaxPosition(columnId: string): Promise<number>;

  update(cardId: string, data: { title?: string; description?: string; dueDate?: Date | null; position?: number; columnId?: string }): Promise<void>;

  addTag(cardId: string, tagId: string): Promise<void>;
  removeTag(cardId: string, tagId: string): Promise<void>;

  assignMember(cardId: string, userId: string): Promise<void>;
  removeMember(cardId: string, userId: string): Promise<void>;

  addActivity(cardId: string, userId: string, text: string): Promise<{ id: string, text: string, createdAt: Date, user: { id: string, name: string, email: string } }>;

  delete(cardId: string): Promise<void>;
}
