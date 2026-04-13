import { IBoardRepository } from '../ports/IBoardRepository';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';

interface JoinBoardInput {
  inviteCode: string;
  userId: string;
}

export class JoinBoard {
  constructor(private boardRepo: IBoardRepository) {}

  async execute(input: JoinBoardInput) {
    const board = await this.boardRepo.findByInviteCode(input.inviteCode);
    if (!board) {
      throw new NotFoundError('Código de convite inválido.');
    }

    const alreadyMember = await this.boardRepo.isMember(board.id, input.userId);
    if (alreadyMember) {
      throw new ValidationError('Você já é membro deste quadro.');
    }

    await this.boardRepo.addMember(board.id, input.userId, 'member');

    return { boardId: board.id, name: board.name };
  }
}
