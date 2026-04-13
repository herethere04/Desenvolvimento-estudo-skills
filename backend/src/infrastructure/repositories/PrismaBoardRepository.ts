import { PrismaClient } from '@prisma/client';
import { IBoardRepository, BoardWithMembers } from '../../application/ports/IBoardRepository';

export class PrismaBoardRepository implements IBoardRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    name: string;
    description?: string;
    columns: Array<{ name: string; position: number; color: string }>;
    adminUserId: string;
  }) {
    const board = await this.prisma.board.create({
      data: {
        name: data.name,
        description: data.description,
        columns: {
          create: data.columns,
        },
        members: {
          create: {
            userId: data.adminUserId,
            role: 'admin',
          },
        },
      },
      select: { id: true, name: true, inviteCode: true },
    });

    return board;
  }

  async findById(id: string): Promise<BoardWithMembers | null> {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                dueDate: true,
                position: true,
                createdAt: true,
                tags: { select: { id: true, name: true, color: true } },
                assignedMembers: { select: { id: true, name: true, email: true } },
                activities: {
                  orderBy: { createdAt: 'desc' },
                  select: {
                    id: true,
                    text: true,
                    createdAt: true,
                    user: { select: { id: true, name: true, email: true } }
                  }
                },
                _count: { select: { activities: true } },
              },
            },
          },
        },
        tags: { select: { id: true, name: true, color: true } },
      },
    });
  }

  async findByInviteCode(code: string) {
    return this.prisma.board.findUnique({
      where: { inviteCode: code },
      select: { id: true, name: true },
    });
  }

  async findByUserId(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { board: { createdAt: 'desc' } },
    });

    return memberships.map((m) => ({
      id: m.board.id,
      name: m.board.name,
      description: m.board.description,
      createdAt: m.board.createdAt,
      role: m.role,
      memberCount: m.board._count.members,
    }));
  }

  async addMember(boardId: string, userId: string, role: string = 'member') {
    await this.prisma.boardMember.create({
      data: { boardId, userId, role },
    });
  }

  async isMember(boardId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.boardMember.findUnique({
      where: { userId_boardId: { userId, boardId } },
    });
    return !!member;
  }

  async createTag(boardId: string, data: { name: string; color: string }) {
    return this.prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
        boardId,
      },
    });
  }

  async getTags(boardId: string) {
    return this.prisma.tag.findMany({
      where: { boardId },
    });
  }
}
