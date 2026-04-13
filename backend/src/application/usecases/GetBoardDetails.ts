import { IBoardRepository } from '../ports/IBoardRepository';
import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError';

export class GetBoardDetails {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(boardId: string, userId: string) {
    const isMember = await this.boardRepo.isMember(boardId, userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste quadro.');
    }

    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new NotFoundError('Quadro não encontrado.');
    }

    return board;
  }
}
