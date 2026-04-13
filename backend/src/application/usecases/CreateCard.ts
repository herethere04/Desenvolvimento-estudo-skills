import { ICardRepository } from '../ports/ICardRepository';
import { IBoardRepository } from '../ports/IBoardRepository';
import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError';

interface CreateCardInput {
  title: string;
  description?: string;
  boardId: string;
  userId: string;
  columnId?: string;
}

export class CreateCard {
  constructor(
    private cardRepo: ICardRepository,
    private boardRepo: IBoardRepository,
  ) {}

  async execute(input: CreateCardInput) {
    const isMember = await this.boardRepo.isMember(input.boardId, input.userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste quadro.');
    }

    const board = await this.boardRepo.findById(input.boardId);
    if (!board) {
      throw new NotFoundError('Quadro não encontrado.');
    }

    let targetColumn = null;
    
    if (input.columnId) {
      targetColumn = board.columns.find((col) => col.id === input.columnId);
    } 
    
    if (!targetColumn) {
      targetColumn = board.columns.find((col) => col.name === 'Backlog');
    }

    if (!targetColumn) {
      throw new NotFoundError('Coluna de destino não encontrada.');
    }

    const maxPosition = await this.cardRepo.getMaxPosition(targetColumn.id);

    const card = await this.cardRepo.create({
      title: input.title,
      description: input.description,
      columnId: targetColumn.id,
      position: maxPosition + 1,
    });

    return card;
  }
}
