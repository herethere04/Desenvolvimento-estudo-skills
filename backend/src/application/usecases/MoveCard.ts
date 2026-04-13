import { ICardRepository } from '../ports/ICardRepository';
import { IBoardRepository } from '../ports/IBoardRepository';
import { ForbiddenError, NotFoundError, UnprocessableError } from '../../domain/errors/AppError';
import { canMoveCard } from '../../domain/rules/KanbanStateMachine';

interface MoveCardInput {
  cardId: string;
  targetColumnId: string;
  userId: string;
}

export class MoveCard {
  constructor(
    private cardRepo: ICardRepository,
    private boardRepo: IBoardRepository,
  ) {}

  async execute(input: MoveCardInput) {
    const card = await this.cardRepo.findById(input.cardId);
    if (!card) {
      throw new NotFoundError('Cartão não encontrado.');
    }

    const isMember = await this.boardRepo.isMember(card.column.boardId, input.userId);
    if (!isMember) {
      throw new ForbiddenError('Você não é membro deste quadro.');
    }

    const board = await this.boardRepo.findById(card.column.boardId);
    if (!board) {
      throw new NotFoundError('Quadro não encontrado.');
    }

    const targetColumn = board.columns.find((col) => col.id === input.targetColumnId);
    if (!targetColumn) {
      throw new NotFoundError('Coluna de destino não encontrada.');
    }

    const fromColumnName = card.column.name;
    const toColumnName = targetColumn.name;

    if (!canMoveCard(fromColumnName, toColumnName)) {
      throw new UnprocessableError(
        `Movimentação inválida: não é possível mover de "${fromColumnName}" para "${toColumnName}". O fluxo é estritamente: Backlog → To-Do → In Progress → Done.`,
      );
    }

    const maxPosition = await this.cardRepo.getMaxPosition(input.targetColumnId);

    await this.cardRepo.moveToColumn(input.cardId, input.targetColumnId, maxPosition + 1);

    return {
      cardId: input.cardId,
      from: fromColumnName,
      to: toColumnName,
    };
  }
}
