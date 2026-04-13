import { PrismaClient } from '@prisma/client';
import { ICardRepository } from '../../application/ports/ICardRepository';

export class PrismaCardRepository implements ICardRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    title: string;
    description?: string;
    columnId: string;
    position: number;
  }) {
    return this.prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        position: data.position,
      },
      select: { id: true, title: true, columnId: true, position: true },
    });
  }

  async findById(cardId: string) {
    return this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          select: { id: true, name: true, boardId: true },
        },
      },
    });
  }

  async moveToColumn(cardId: string, newColumnId: string, position: number) {
    await this.prisma.card.update({
      where: { id: cardId },
      data: { columnId: newColumnId, position },
    });
  }

  async getMaxPosition(columnId: string): Promise<number> {
    const result = await this.prisma.card.aggregate({
      where: { columnId },
      _max: { position: true },
    });
    return result._max.position ?? -1;
  }

  async update(cardId: string, data: { title?: string; description?: string; dueDate?: Date | null; position?: number; columnId?: string }) {
    await this.prisma.card.update({
      where: { id: cardId },
      data,
    });
  }

  async addTag(cardId: string, tagId: string): Promise<void> {
    await this.prisma.card.update({
      where: { id: cardId },
      data: { tags: { connect: { id: tagId } } },
    });
  }

  async removeTag(cardId: string, tagId: string): Promise<void> {
    await this.prisma.card.update({
      where: { id: cardId },
      data: { tags: { disconnect: { id: tagId } } },
    });
  }

  async assignMember(cardId: string, userId: string): Promise<void> {
    await this.prisma.card.update({
      where: { id: cardId },
      data: { assignedMembers: { connect: { id: userId } } },
    });
  }

  async removeMember(cardId: string, userId: string): Promise<void> {
    await this.prisma.card.update({
      where: { id: cardId },
      data: { assignedMembers: { disconnect: { id: userId } } },
    });
  }

  async addActivity(cardId: string, userId: string, text: string) {
    const activity = await this.prisma.cardActivity.create({
      data: {
        text,
        cardId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return activity;
  }

  async delete(cardId: string) {
    await this.prisma.card.delete({
      where: { id: cardId },
    });
  }
}
