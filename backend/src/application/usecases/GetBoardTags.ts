import { IBoardRepository } from '../ports/IBoardRepository';
import { NotFoundError } from '../../domain/errors/AppError';

export class GetBoardTags {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(boardId: string, userId: string) {
    const isMember = await this.boardRepo.isMember(boardId, userId);
    if (!isMember) {
      throw new NotFoundError('Quadro não encontrado ou acesso negado.');
    }

    return this.boardRepo.getTags(boardId);
  }
}
