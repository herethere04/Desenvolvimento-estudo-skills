import { IBoardRepository } from '../ports/IBoardRepository';
import { DEFAULT_COLUMNS } from '../../domain/constants/columns';

interface CreateBoardInput {
  name: string;
  description?: string;
  userId: string;
}

export class CreateBoard {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(input: CreateBoardInput) {
    const board = await this.boardRepo.create({
      name: input.name,
      description: input.description,
      columns: DEFAULT_COLUMNS.map((col) => ({
        name: col.name,
        position: col.position,
        color: col.color,
      })),
      adminUserId: input.userId,
    });

    return board;
  }
}
